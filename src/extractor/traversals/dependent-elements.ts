import {Knowledge} from '../index.js';
import {ApexDataType} from '../../formatters/translators/data-type-translator.js';
import {getFlowElementReferenceOrValue} from '../../formatters/translators/reference-or-value-translator.js';
import {Flow, FlowAssignment, FlowCollectionProcessor, FlowCustomError, FlowDecision, FlowElement, FlowElementReferenceOrValue, 
    FlowFormula, FlowLoop, FlowNode, FlowRecordCreate, FlowRecordLookup, FlowStart, FlowSubflow,
    FlowWait} 
    from '../../types/metadata.js';
import {MyFlowElementReferenceOrValue} from '../../types/metadata-simple.js';
import * as utils from '../utils.js';
import {addFlowElementReferenceOrValue2Object2FieldsMap} from '../utils.js';
import { ApexVariable, VAR_RECORD } from '../../result-builder/apex-variable.js';
import { Variable } from '../../types/variable.js';
import { skipSubflowInputAssignment } from '../../formatters/elements/subflow.js';
import { BasicElementProcessor } from './basic-elements.js';
import { Node } from "../../types/node.js";
import { Targets } from '../../types/targets.js';

export class DependentElementProcessor extends BasicElementProcessor {
    private f: Flow;
    private queryObject2fields: Map<string, string[]>;

    constructor(f: Flow, k: Knowledge, queryObject2fields: Map<string, string[]>) {
        super(k);
        this.f = f;
        this.queryObject2fields = queryObject2fields;
    }

    run() : void {
        this.processStart(this.f.start || this.f.startElementReference);
        this.processWaits(this.f.waits);
        this.processDecisions(this.f.decisions);
        this.processAssignments(this.f.assignments);
        this.processSimpleElements(this.f.recordDeletes, 'recordDeletes');
        this.processSimpleElements(this.f.recordUpdates, 'recordUpdates');
        this.processActionCalls(this.f.actionCalls);
        this.processFormulas(this.f.formulas);
        this.processRecordCreates(this.f.recordCreates);
        this.processRecordLookups(this.f.recordLookups);
        // moved this down from before processFormulas to see, if this facilitates determining the filter variables
        this.processCollectionProcessors(this.f.collectionProcessors);
        // moved this here from IndependentElementProcessor (where is was before processScreens) to see, if this 
        // facilitates determining the iteration variables
        this.processLoops(this.f.loops);
        this.processSubflows(this.f.subflows);
        this.processCustomErrors(this.f.customErrors);
    }

    private processActionCalls(flowNodes : FlowNode[]) : void {
        if (!flowNodes) return;
        for (const e of flowNodes) {
            const name: string = this.prepare4Retrieval(e, 'actionCalls');
            // Everything else is left to pathfinder/element-processor.ts
            // any FlowActionCall must be marked as "must be method"
            // this.knowledge.target2makeMethod.set(name, true);
            // this.knowledge.requiredMethods.add(name);
        }
    }

    private processAssignments(flowAssignments : FlowAssignment[]) : void {
        if (!flowAssignments) return;
        for (const e of flowAssignments) {
            // this depends on prior parsing screens
            for (const fai of e.assignmentItems) {
                const s = fai.assignToReference[0];
                // TODO: this is very similar to code in processRecordCreate - merge the two!
                if (s.includes('.')) {
                    const [variable, field] = s.split('.');
                    const customType = this.knowledge.builder.getMainClass().getCustomTypeOfVariable(variable);
                    if (!customType) {
                        // not a custom component
                        continue;
                    }

                    // const dataType = this.getTypeOfFlowAssignmentItem(fai);
                    // const f: ClassLevelObjectAttribute = {dataType, name: field};
                    // FIXME: 2024-04-29: just commented this, because I don't understand
                    // this.knowledge.programmer.addAttributeToType(customType, f);
                }
            }
        }

        this.processSimpleElements(flowAssignments, 'assignments');
    }

    // TODO: move into class dedicated to FlowAssignments
    // private getTypeOfFlowAssignmentItem(fai: FlowAssignmentItem | FlowInputFieldAssignment) : string {
    //     const val = fai.value[0];
    //     const whatValue = Object.keys(val)[0];
    //     const assignmentItemValue = new Map<string, string>([
    //         ['apexValue', 'Object'],
    //         ['booleanValue', 'Boolean'],
    //         ['dateTimeValue', 'DateTime'],
    //         ['dateValue', 'Date'],
    //         ['elementReference', 'Id'],
    //         ['numberValue', 'Decimal'],
    //         ['sobjectValue', 'SObject'],
    //         ['stringValue', 'String'],
    //     ]);
    //     return assignmentItemValue.get(whatValue)!;
    // }

    private processCollectionProcessors(flowNodes : FlowCollectionProcessor[]): void {
        if (!flowNodes) return;
        for (const e of flowNodes) {
            this.prepare4Retrieval(e, 'collectionProcessors');

            const variableName = e.collectionReference[0];
            const primaryVariable = this.knowledge.builder.getMainClass().getVariable(variableName);
            const variableType = primaryVariable.getApexType();
            const apexVariable = this.knowledge.builder.getMainClass().registerVariableBasedOnFlowElement(e).registerType(variableType);
            if(primaryVariable.isCollectionVariable()) {
                apexVariable.registerIsCollection();
            }
        }
    }

    private processCustomErrors(flowCustomErrors : FlowCustomError[]): void {
        if (!flowCustomErrors) return;
        for (const e of flowCustomErrors) {
            this.prepare4Retrieval(e, 'customErrors');
        }
    }

    private processDecisions(flowDecisions : FlowDecision[]): void {
        // conditions might reference $Organization.[field]; or reference fields on list items that
        // got built by a GetRecords before...
        if (!flowDecisions) return;
        for (const e of flowDecisions) {
            for (const r of e.rules) {
                for (const c of r.conditions) {
                    if (c.leftValueReference) {
                        this.assignQueryObject2Fields(c.leftValueReference[0], false, this.queryObject2fields);
                        this.considerGetRecordsFields(c.leftValueReference[0]);
                    }

                    if (c.rightValue) {
                        // eslint-disable-next-line max-depth
                        if (c.rightValue[0].elementReference) {
                            this.assignQueryObject2Fields(c.rightValue[0].elementReference[0], false, this.queryObject2fields);
                            this.considerGetRecordsFields(c.rightValue[0].elementReference[0]);
                        }

                        // eslint-disable-next-line max-depth
                        if (c.rightValue[0].stringValue) {
                            this.assignQueryObject2Fields(c.rightValue[0].stringValue[0], false, this.queryObject2fields);
                        }
                    }
                }
            }
        }

        this.processSimpleElements(flowDecisions, 'decisions');
    }

    // TODO: 2024: Doesn't this not ignore the point in the Flow where this is used? Does the result
    // of the formula not depend on it? In that case, should this not rather be a method?
    private processFormulas(flowFormulas: FlowFormula[]): void {
        if (!flowFormulas) return;

        for (const e of flowFormulas) {
            const dataType = ApexDataType.fromFlowVariableBase(e).getResult();
            const re = /[\n\r]/g;
            const comment = '// TODO: Rephrase this formula in Apex and assign it to the variable below:' + global.NL +
                '// ' + (e.expression ? e.expression[0].replaceAll(re, '') : '') +
                (e.scale ? ` (scale: ${e.scale})` : '')
            this.knowledge.builder.getMainClass().registerVariable(e.name[0]).registerComment(comment).registerType(dataType);
        }
    }

    private processRecordCreates(flowNodes : FlowRecordCreate[]): void {
        if (!flowNodes) return;
        for (const e of flowNodes) {
            const name: string = this.prepare4Retrieval(e, 'recordCreates');
            // in case the element is based on "Use separate resources, and literal values",
            // a new "Variable" is created, e.g. labelled "AccountId from Create_B"; in that
            // case apparently a tag "storeOutputAutomatically" is true (without the user
            // chosing so); see also the explanation of this tag here:
            // https://developer.salesforce.com/docs/atlas.en-us.232.0.api_meta.meta/api_meta/meta_visual_workflow.htm
            // the internal reference to this variable is like this: [name of create record element].Id
            const recordCreate : FlowRecordCreate = e as FlowRecordCreate;
            if (recordCreate.storeOutputAutomatically && recordCreate.storeOutputAutomatically[0] === 'true') {
                // const rendered: string = utils.getVariable4FlowRecordCreate(recordCreate);
                // this.knowledge.programmer.classLevelVariables.set(name, rendered);
                const apexVariable = this.knowledge.builder.getMainClass().registerVariable(name);

                // TODO: For some reason the object didn't get a type anymore; but the type is - in "Create_Contact_Conditionally"
                // (apex.test.ts) simply held in the "object"; therefore I allow myself to set the type here; but somehow 
                // this worked differently before, I think
                apexVariable.registerType(recordCreate.object[0]);
            }


            // this depends on prior parsing screens
            if (e.inputAssignments) {
                // TODO: this is very similar to code in processAssignments - merge!
                for (const fifa of e.inputAssignments) {
                    if (!fifa.value || !fifa.value[0].elementReference || !fifa.value[0].elementReference[0].includes('.')) {
                        continue;
                    }

                    const [variable, field] = fifa.value[0].elementReference[0].split('.');
                    const customType = this.knowledge.builder.getMainClass().getCustomTypeOfVariable(variable);
                    if (!customType) {
                        // not a custom component
                        continue;
                    }

                    // const dataType = this.getTypeOfFlowAssignmentItem(fifa);
                    // const f: ClassLevelObjectAttribute = {dataType, name: field};
                    // FIXME: 2024-04-29: just commented this, because I don't understand
                    // this.knowledge.programmer.addAttributeToType(customType, f);
                }
            }
        }
    }

    private processRecordLookups(flowRecordLookups : FlowRecordLookup[]) : void {
        if (!flowRecordLookups) return;
        for (const e of flowRecordLookups) {
            const name: string = this.prepare4Retrieval(e, 'recordLookups');

            const isSingle = utils.isSingle(e, this.knowledge.var2type);
            const obj = e.object[0];
            const apexVariable = this.knowledge.builder.getMainClass().registerVariable(name).registerType(obj);
            if(!isSingle) {
                apexVariable.registerIsCollection();
            }

            if (e.getFirstRecordOnly) {
                const isSingle = e.getFirstRecordOnly[0] === 'true';
                const variable = new Variable(name, e.object[0], !isSingle);
                this.knowledge.var2type.set(name, variable);
            }
        }

        // after finished building var2type
        for (const e of flowRecordLookups) {
            if (e.filters && e.filters[0].value) {
                const ferov : FlowElementReferenceOrValue = e.filters[0].value[0];
                if (ferov.elementReference) {
                    addFlowElementReferenceOrValue2Object2FieldsMap(ferov, this.knowledge.objects2Fields, this.knowledge.var2type);
                }
            }
        }
    }

    private processLoops(flowLoops : FlowLoop[]): void {
        if (!flowLoops) return;
        for (const e of flowLoops) {
            this.prepare4Retrieval(e, 'loops');
            // we can't register variables here, because they are local and would not know their method
        }
    }

    private processSimpleElements(flowNodes : FlowNode[], p: string) : void {
        if (!flowNodes) return;
        for (const e of flowNodes) {
            this.prepare4Retrieval(e, p);
        }
    }

    private processWaits(flowWaits : FlowWait[]): void {
        if (!flowWaits) return;
        for (const e of flowWaits) {
            this.prepare4Retrieval(e, 'waits');
        }
    }

    private processStart(flowStarts : FlowStart[] | string): void {
        if(typeof flowStarts[0] === 'string') {
            // we can't do prepare4Retrieval
            const flowElement: FlowElement = {} as FlowElement;
            const node = new Node(flowElement);
            this.knowledge.name2node.set(node.name, node);
            node.type = 'start';
            node.targets = Targets.fromStartElementReference(flowStarts[0]);

            return;
        }

        const flowStart = flowStarts[0] as FlowStart;
        // flows of type "Autolaunched Flow (No Trigger)" have no triggerType
        if (flowStart.triggerType) {
            this.knowledge.triggerType = flowStart.triggerType[0];
            // in RecordBeforeSave, elements become a different meaning; e.g. the EditRecords element does not
            // update (itself) the record, just sets values on it
            this.knowledge.recordBeforeSave = (flowStart.triggerType[0] === 'RecordBeforeSave');
            if (flowStart.recordTriggerType) {
                const recordTriggeredFlows: string[] = ['Create', 'Update', 'CreateAndUpdate', 'Delete'];
                const hasRecordId: boolean = recordTriggeredFlows.includes(flowStart.recordTriggerType[0]);
                if (hasRecordId) {
                    this.makeHasRecord(flowStart);
                }
            } else if (flowStart.triggerType[0] === 'Scheduled' || flowStart.triggerType[0] === 'PlatformEvent') {
                // Scheduled flows have a record variable too (at least, if "object" is configured on the start element)
                // Platform Event flows too - the error output from the event, e.g. BatchApexErrorEvent
                this.makeHasRecord(flowStart);
            }
        }

        this.prepare4Retrieval(flowStart, 'start');
    }

    private makeHasRecord(flowStart: FlowStart) : void {
        const sObject = flowStart.object[0];
        this.knowledge.builder.getMainClass()
            .registerVariable(VAR_RECORD)
            .registerSpecial(VAR_RECORD)
            .registerType(sObject)
            .registerConstructorVariable();
    }

    private processSubflows(flowSubflows: FlowSubflow[]) : void {
        if (!flowSubflows) return;
        for (const e of flowSubflows) {
            // the same subflow can be inserted in the flow each time with different input parameters;
            // we don't want to build separate classes and constructors of the subflow, but a single constructor,
            // with some parameters left out when not used in a specific call
            const typeName = e.flowName[0];
            const subflowClass = this.knowledge.builder.registerSubflow(typeName);

            const inputAssignmentRegisteredVariables = new Map<string, ApexVariable>();
            if (e.inputAssignments) {
                for (const ia of e.inputAssignments) {
                    if(skipSubflowInputAssignment(ia)) {
                        continue;
                    }

                    const varNameInSubflow = ia.name[0];
                    const rightHand: MyFlowElementReferenceOrValue = getFlowElementReferenceOrValue(ia.value[0], false);
                    if(rightHand.t === 'elementReference') {
                        const apexVariableRightHand = this.knowledge.builder.getMainClass().getVariable(rightHand.v);
                        const rightHandSideApexVariableType = apexVariableRightHand.getApexType();
                        if(rightHandSideApexVariableType === undefined) {
                            throw new Error('The type of a right hand side of an input variable must not be undefined when processing subflows');
                        }

                        const apexVariable = subflowClass.registerVariable(varNameInSubflow)
                            .registerType(rightHandSideApexVariableType)
                            .registerConstructorVariable();

                        if(apexVariableRightHand.isCollectionVariable()) {
                            apexVariable.registerIsCollection();
                        }

                        inputAssignmentRegisteredVariables.set(varNameInSubflow, apexVariable);
                    }
                }
            }

            if (e.outputAssignments) {
                for (const oa of e.outputAssignments) {
                    const varNameInSubflow = oa.name[0];
                    const varNameInFlow = oa.assignToReference[0];
                    const apexVariable = this.knowledge.builder.getMainClass().getVariable(varNameInFlow);
                    const rightHandSideApexVariableType = apexVariable.getApexType();
                    const isCollection = apexVariable.isCollectionVariable();

                    const apexVariableInSubflow = inputAssignmentRegisteredVariables.get(varNameInSubflow)
                        || subflowClass.registerVariable(varNameInSubflow).registerType(rightHandSideApexVariableType);
                    // always public: either we will later refer to the class as such or to the individual variables; in both cases
                    // we need public access
                    apexVariableInSubflow.registerAccessPublic();
                    if(isCollection) {
                        apexVariableInSubflow.registerIsCollection();
                    }
                }
            }

            this.prepare4Retrieval(e, 'subflows');
        }
    }

    private considerGetRecordsFields(s: string) : void {
        if (s.charAt(0) !== '$') {
            // add to objects2Fields
            // TODO: problem: the loop variable will be processed later, therefore an expression like the following is not yet known:
            /*
            <conditions>
            <leftValueReference>currentItem_Get_Last_Case.ContactEmail</leftValueReference>
            */
        }
    }
}
