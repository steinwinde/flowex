import { ApexDataType } from '../../formatters/translators/data-type-translator.js';
import {getFlowElementReferenceOrValue} from '../../formatters/translators/reference-or-value-translator.js';
import {Flow,FlowChoice, FlowConstant, FlowDynamicChoiceSet, FlowLoop, FlowNode, FlowScreen, FlowScreenField, FlowStage, FlowTextTemplate, FlowVariable} 
    from '../../types/metadata.js';
import { Variable } from '../../types/variable.js';
import {Knowledge} from '../index.js';
import { BasicElementProcessor } from './basic-elements.js';
import { Node } from "../../types/node.js";
import { apexFor } from '../../result-builder/section/apex-for.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { ApexVariable, VAR_ACTIVE_STAGES, VAR_CURRENT_STAGE, VAR_FR, VAR_I, VAR_N, VAR_PICKLISTVAL, VAR_PLES, VAR_S } from '../../result-builder/apex-variable.js';
import { ApexSectionLiteral } from '../../result-builder/section/apex-section-literal.js';
import { ApexAssignment } from '../../result-builder/section/apex-assignment.js';
import { METHOD_PREFIXES } from '../../result-builder/section/apex-method.js';
import { ApexLeftHand } from '../../result-builder/section/apex-left-hand.js';
// import { ApexLeftHand, apexLeftHandFromLiteral } from '../../result-builder/section/apex-left-hand.js';

export class IndependentElementProcessor extends BasicElementProcessor {
    f: Flow;
    queryObject2fields = new Map<string, string[]>();

    constructor(f: Flow, k: Knowledge, queryObject2fields: Map<string, string[]>) {
        super(k);
        this.f = f;
        this.queryObject2fields = queryObject2fields;
    }

    public run(): void {
        this.processChoices(this.f.choices);
        this.processConstants(this.f.constants);
        this.processDynamicChoiceSets(this.f.dynamicChoiceSets);
        this.processScreens(this.f.screens);
        this.processStages(this.f.stages);
        this.processTextTemplates(this.f.textTemplates);
        this.processVariables(this.f.variables);
    }

    private processChoices(flowChoices: FlowChoice[]): void {
        if (!flowChoices) return;
        for (const e of flowChoices) {
            this.knowledge.choices.set(e.name[0], e);
        }
    }

    private processConstants(flowConstants : FlowConstant[]): void {
        if (!flowConstants) return;
        for (const e of flowConstants) {
            // it is possible to save a flow constant without value
            if (!e.value) continue;

            const apexDataType = ApexDataType.fromFlowConstant(e);
            const rightHand = getFlowElementReferenceOrValue(e.value[0], true).v;
            this.knowledge.builder.getMainClass().registerConstant(e).registerType(apexDataType.getResult()).registerRightHand(rightHand);
        }
    }

    private processDynamicChoiceSets(flowDyns: FlowDynamicChoiceSet[]): void {
        if (!flowDyns) return;
        let i = 0;
        for (const e of flowDyns) {
            const node = new Node(e);
            this.knowledge.name2node.set(node.name, node);
            if (e.collectionReference) {
                // if collectionReference refers to a (name of a) GetRecords element, make sure GetRecords retrieves these fields
                // "Choice Label" (UI) (displayField XML) is a reference to a field on afore
                // "Data Type" (UI) (dataType XML) is referring to the type of the next, "Choice Value" - we can ignore this.
                // "Choice Value" (UI) (valueField XML) is another field on the GetRecords record
                // This does not need to be part of the output, when a screen is rendered in Apex, because no additional
                // query is necessary. But the query necessarily needs to include the two fields.
                const obj: string = e.object[0];
                const displayField : string = e.displayField[0];
                const valueField : string = e.valueField[0];
                this.addQueryObject2fields(obj + '.' + displayField);
                this.addQueryObject2fields(obj + '.' + valueField);
                this.knowledge.builder.getMainClass().registerVariableBasedOnFlowElement(e).registerType('String').registerIsCollection();
            } else if (e.picklistObject) {
                this.processDynamicChoiceSetsForPicklistObject(e, i++);
            } else {
                // required
                const obj: string = e.object[0];
                this.knowledge.builder.getMainClass().registerVariableBasedOnFlowElement(e).registerType(obj).registerIsCollection();
                // for the initialization see screens element later on
            }
        }
    }

    private processScreens(flowNodes : FlowScreen[]): void {
        if (!flowNodes) return;
        for (const e of flowNodes) {
            this.prepare4Retrieval(e, 'screens');
            if (e.fields) {
                for (const field of e.fields) {
                    this.knowledge.builder.getMainClass().registerVariableBasedOnFlowScreenField(field);
                }
            }
        }
    }

    private processStages(flowStages : FlowStage[]) : void {
        
        if (!flowStages) return;

        // From what I can tell, the concept of the order of stages is a crutch to facilitate
        // inserting new stages later on in a Flow context. In an Apex class, this is simple. There is no 
        // benefit in modelling stages as a Map<String, Integer> (with the Integer representing the Order).
        // Instead it is modelled as a simple List<String> in Apex.
        const stages = new Array<string>();
        const activeStages = new Array<number>();
        let stageIndex = 0;
        for (const e of flowStages) {
            const name : string = e.name[0];
            // TODO: This is - of course - very much ad hoc, not escaping anything, etc... The right hand side should
            // be created by a dedicated builder.
            stages.push(name);
            if(e.isActive[0] === true) {
                activeStages.push(stageIndex);
            }

            stageIndex++;
        }

        // we model this in the Apex class to be able to find references to stages later
        this.knowledge.builder.getMainClass().registerStages(stages);

        const activeStagesJoined = activeStages.join(', ');
        this.knowledge.builder.getMainClass()
            .registerVariable(VAR_ACTIVE_STAGES)
            .registerSpecial(VAR_ACTIVE_STAGES)
            .registerType('Integer')
            .registerIsCollection()
            .registerRightHand('new List<Integer>{' + activeStagesJoined + '}');

        const currentStageApexVariable = this.knowledge.builder.getMainClass()
            .registerVariable(VAR_CURRENT_STAGE)
            .registerSpecial(VAR_CURRENT_STAGE)
            .registerType('Integer');
        if(activeStages.length > 0) {
            currentStageApexVariable.registerRightHand('0');
        }
    }

    // Text Templates are different from Constants, Variables and Formulas in many respects, e.g.:
    // - User can enter multi-line text, which is converted to a single line of HTML by the UI - when I test it. However, 
    //   I have seen multi-line text in examples from client orgs (always with single line feeds, no carriage returns).
    // - Text can contain formula expressions.
    // - User can add images to the template, which are then stored separately from the Flow and referred to
    //   like this:
    //   &lt;img src=&quot;https://xxxxx-yyyy-zzzzz-dev-ed.trailblaze.file.force.com/sfc/servlet.shepherd/version/download/0680600000aaBzh?asPdf=false&amp;amp;operationContext=CHATTER&quot; alt=&quot;dustbin1.gif&quot;&gt;
    private processTextTemplates(flowTextTemplates: FlowTextTemplate[]): void {
        if (!flowTextTemplates) return;
        for (const e of flowTextTemplates) {
            const esc = "'" + e.text[0]
                    .replaceAll('\\', '\\\\')
                    .replaceAll('\'', '\\\'')
                    .replaceAll('\n', '\\n') 
                + "'";
            this.knowledge.builder.getMainClass().registerVariableBasedOnFlowElement(e).registerType('String').registerRightHand(esc);
        }
    }

    private processVariables(flowVariables : FlowVariable[]): void {
        if (!flowVariables) return;
        for (const e of flowVariables) {
            const isCollection: boolean = e.isCollection[0] === 'true';
            // var2type
            // const v: Variable = utils.getRendered4Variables(e);
            let dataType: string = e.dataType[0];
            if (dataType === 'SObject') {
                dataType = e.objectType[0];
            }

            const variable = new Variable(e.name[0], dataType, isCollection);
            this.knowledge.var2type.set(e.name[0], variable);

            // classLevelVariables, constructorParameters, constructorFields
            const apexVariable = this.knowledge.builder.getMainClass().registerVariableBasedOnFlowVariable(e);
            if (isCollection) {
                apexVariable.registerIsCollection();
            }

            if(e.isOutput[0] === 'true') {
                apexVariable.registerAccessPublic();
            }

            if (e.isInput[0] === 'true') {
                // We allow a public (isOutput==true) variable to be assigned in the constructor
                apexVariable.registerConstructorVariable();
            }

            // default might necessitate SOQL query, need to collect objects and fields
            if (e.value) {
                if (e.value[0].elementReference) {
                    this.assignQueryObject2Fields(e.value[0].elementReference[0], false, this.queryObject2fields);
                }

                if (e.value[0].stringValue) {
                    // TODO: If the entered string ends in a single backslash, the string literal in Apex will be invalid.
                    this.assignQueryObject2Fields(e.value[0].stringValue[0], true, this.queryObject2fields);
                }
            }
        }
    }

    // ----------------------------------------------------------------------------------------------------------------
    // helper
    // ----------------------------------------------------------------------------------------------------------------

    private addQueryObject2fields(fieldOnObject: string) : void {
        const [obj, field] = fieldOnObject.split('.');
        if (this.knowledge.queryObject2fields.has(obj)) {
            if (!this.knowledge.queryObject2fields.get(obj)?.includes(field)) {
                // TODO: should we not rather use Map<string, Set>?
                this.knowledge.queryObject2fields.get(obj)!.push(field);
            }
        } else {
            this.knowledge.queryObject2fields.set(obj, [field]);
        }
    }

    // TODO: Should probably be moved to a separate file, because it's generating considerable Apex already
    private processDynamicChoiceSetsForPicklistObject(e: FlowDynamicChoiceSet, i: number): void {
        // TODO: This is the ugly solution of the problem "multiple dynamic choice sets exist"
        const varN = VAR_N + i;
        const varI = VAR_I + i;
        const varS = VAR_S + i;
        const varPickListVal = VAR_PICKLISTVAL + i;
        const varFr = VAR_FR + i;
        const varPles = VAR_PLES + i;

        const name: string = e.name[0];
        const apexMethod = this.knowledge.builder.getMainClass().registerMethod(e, METHOD_PREFIXES.METHOD_PREFIX_POPULATE, name);

        const obj: string = e.picklistObject[0];
        const picklistField: string = e.picklistField[0];
        // let sortBlock = '';
        const apexSection = new ApexSection();
        if (e.sortOrder) {
            const apexVariable = new ApexVariable(name);
            const apexSectionLiteral = new ApexSectionLiteral(`${name}.sort();`).registerVariable(apexVariable);
            apexSection.addSection(apexSectionLiteral);
//             sortBlock = `${name}.sort();
// `;
            const sortOrder: string = e.sortOrder[0];
            if (sortOrder === 'Desc') {
                const apexVariableI = this.knowledge.builder.getMainClass().registerVariable(varI).registerType('Integer').registerLocal(apexMethod);
                const apexVariableN = this.knowledge.builder.getMainClass().registerVariable(varN).registerType('Integer');
                const apexVariableS = this.knowledge.builder.getMainClass().registerVariable(varS).registerType('String');

                const leftHandN = new ApexLeftHand(`Integer ${varN}`, [apexVariableN]);
                // const leftHandN = apexLeftHandFromLiteral('Integer', varN);
                const apexAssignmentZero = new ApexAssignment(leftHandN, `${name}.size()`);
                const leftHandS = new ApexLeftHand(`String ${varS}`, [apexVariableS]);
                // const leftHandS = apexLeftHandFromLiteral('String', varS);
                const apexAssignmentOne = new ApexAssignment(leftHandS, `${name}[${varI}]`);
                const apexAssignmentTwo = new ApexAssignment(`${name}[${varI}]`, `${name}[n-${varI}-1]`);
            const apexAssignmentThree = new ApexAssignment(`${name}[${varN}-${varI}-1]`, varS);
//                 const body = `String s = ${name}[i];
// ${name}[i] = ${name}[n-i-1];
// ${name}[n-i-1] = s;`;
                const apexSectionDesc = new ApexSection().addSections([apexAssignmentOne, apexAssignmentTwo, apexAssignmentThree]);
                const apexForStatement = apexFor().lt(varN + '/2').set(apexSectionDesc);
                // sortBlock += apexForStatement.build();
                apexSection.addSections([apexAssignmentZero, apexForStatement]);
            }
        }

        const apexVariablePickList = this.knowledge.builder.getMainClass().registerVariable(varPickListVal).registerType('String');
        const apexVariableFr = this.knowledge.builder.getMainClass().registerVariable(varFr).registerType('Schema.DescribeFieldResult');
        const apexVariablePles = this.knowledge.builder.getMainClass().registerVariable(varPles).registerType('Schema.PicklistEntry').registerIsCollection();

        const bodyFor = `${name}.add(${varPickListVal}.getLabel());`;
        const apexSectionAdd = new ApexSectionLiteral(bodyFor).registerVariable(apexVariablePickList); 
        const apexForStatement = apexFor().item('Schema.PicklistEntry').itemInstance(varPickListVal).items(varPles).set(apexSectionAdd);
        
        const apexAssignFirstLine = new ApexSectionLiteral(`Schema.DescribeFieldResult ${varFr} = ${obj}.${picklistField}.getDescribe();`)
            .registerVariable(apexVariableFr);
        const apexAssignSecondLine = new ApexSectionLiteral('List<Schema.PicklistEntry> ' + varPles + ' = ' + varFr + '.getPicklistValues();')
            .registerVariable(apexVariablePles);
        const apexMethodBody = new ApexSection().addSections([apexAssignFirstLine, apexAssignSecondLine, apexForStatement]);
        apexMethod.registerBody(apexMethodBody);

//         const body = `private void ${methodName}() {
// Schema.DescribeFieldResult fr = ${obj}.${picklistField}.getDescribe();
// List<Schema.PicklistEntry> ples = fr.getPicklistValues();
// ${apexForStatement.build()}
// ${sortBlock}}`;
        this.knowledge.builder.getMainClass().registerVariable(name).registerType('String').registerIsCollection();
    }
}