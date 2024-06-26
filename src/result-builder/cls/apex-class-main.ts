import { MethodScout } from '../../extractor/traversals/method-scout.js';
import { ApexDataType } from '../../formatters/translators/data-type-translator.js';
import { FlowElement, FlowRunInMode, FlowScreenField, FlowVariable } from "../../types/metadata.js";
import { camelize, getUniqueName } from "../../utils.js";
import { ApexComparableClass } from "./apex-class-comparable.js";
import { ApexTypeClass } from "./apex-class-type.js";
import { ApexClass } from "./apex-class.js";
import { ApexMethod, METHOD_PREFIXES, TOP_METHOD } from "../section/apex-method.js";
import { ApexSection } from '../section/apex-section.js';
import { ApexVariable, VAR_RECORD } from "../apex-variable.js";

type ClassLevelObjectAttribute = {
    name: string,    // e.g. "required"
    dataType: string // e.g. Boolean
};


export class ApexMainClass extends ApexClass {

    private apexSections : Array<ApexSection> = new Array<ApexSection>();

    // the inner classes that need to be rendered at the top of the main Apex class for sorting objects
    private innerClasses: Array<ApexClass> = new Array<ApexClass>();
    private otherMethods = '';
    // TODO: classLevelObjects are copied from programmer.ts, not sure, if they are well shaped
    // the inner classes that need to be rendered at the top of the Apex class for having a type of screen input
    private classLevelObjects: Map<string, Set<ClassLevelObjectAttribute>> = new Map<string, Set<ClassLevelObjectAttribute>>();
    // set of existing method names; this guarantees we don't get duplicate method names
    private methods: Map<string, ApexMethod> = new Map<string, ApexMethod>();
    // all stages
    private stages: Array<string> = [];

    // all inner classes
    private innerClassBlock: string = '';

    private globalVariables: boolean;

    constructor(name: string, globalVariables: boolean, flowRunInMode?: FlowRunInMode) {
        super(name, 'public', flowRunInMode);
        this.globalVariables = globalVariables;
    }

    addToBody(apexSection : ApexSection) : void {
        this.apexSections.push(apexSection);
    }

    // E.g. used for mocha testing. (Retrieved methods don't know their original name if not set by the PathFinder.)
    getMethods() : Array<ApexMethod> {
        const methods = [...this.methods.values()];
        return methods;
    }

    // only methods generated by the PathFinder have a node name and can be retrieved; as methods potentially
    // get new names, other methods can't be retrieved
    getMethodFromNode(nodeName: string): ApexMethod | undefined {
        const method = [...this.methods.values()].find((m) => m.getNodeName() === nodeName);
        return method;
    }

    // only variables generated based on the name of a Flow resource can be retrieved; as variables potentially
    // got new names, other variables can't be retrieved
    getVariableFromFlowElement(flowElementName: string) : ApexVariable | undefined {
        const variable = this.variables.find((v) => v.getFlowElementName() === flowElementName);
        return variable;
    }

    getStage(name: string): number {
        const index = this.stages.indexOf(name);
        return index;
    }

    // pathfinder: currentNodeName
    // record-*: FlowElement, prefix, object (type)
    // FlowCollectionProcessor, DynamicChoiceSetsForPicklist: FlowElement, prefix

    // uniqueness of method names is guaranteed by the logic of this method,
    // not only when executing "build()" later
    /**
     * 
     * @param flowElement The FlowElement spawning the method
     * @param prefix If a Salesforce object (type) is provided, prefix of name
     * @param salesforceObj, often a Salesforce SObject or Apex type, e.g. String or Account
     * @returns the generated ApexMethod with its unique name set
     */
    registerMethod(flowElement : FlowElement, prefix?: METHOD_PREFIXES, salesforceObj?: string): ApexMethod {

        // start element has no name
        const flowElementName = flowElement.name ? flowElement.name[0] : TOP_METHOD;
        const mainPart = salesforceObj ?? flowElementName;
        const preliminaryName : string = (prefix??'') + mainPart[0].toUpperCase() + mainPart.slice(1);
        const beautifiedName = camelize(preliminaryName, false);
        const existingNames : Set<string> = new Set<string>(this.methods.keys());
        const name : string = getUniqueName(beautifiedName, existingNames);
        const apexMethod = new ApexMethod(name, flowElementName);
        this.methods.set(name, apexMethod);
        return apexMethod;
    }

    registerComparableClass(name: string) : ApexComparableClass {
        const existingInnerClass = this.innerClasses.find((c) => c.name === name);
        if (existingInnerClass) {
            throw new Error(`Inner class ${name} already exists - this is not yet supported`);
        }

        const comparableClass = new ApexComparableClass(name);
        this.innerClasses.push(comparableClass);
        return comparableClass;
    }

    private registerTypeClass(name: string) : ApexClass {
        const existingInnerClass = this.innerClasses.find((c) => c.name === name);
        if (existingInnerClass) {
            throw new Error(`Inner class ${name} already exists - this is not yet supported`);
        }

        const innerClass = new ApexTypeClass(name);
        this.innerClasses.push(innerClass);
        return innerClass;
    }

    registerVariableBasedOnFlowElement(flowElement: FlowElement): ApexVariable {
        const name = flowElement.name[0];

        const variable = new ApexVariable(name, false).registerFlowElementName(flowElement);
        this.variables.push(variable);
        return variable;
    }

    // registers name and type
    registerVariableBasedOnFlowVariable(flowVariable : FlowVariable): ApexVariable {
        const name = flowVariable.name[0];
        
        const apexType = ApexDataType.fromFlowVariable(flowVariable);
        const variable = new ApexVariable(name, false).registerType(apexType.getResult()).registerFlowElementName(flowVariable);
        this.variables.push(variable);

        return variable;
    }

    // registers name and type
    registerVariableBasedOnFlowScreenField(flowScreenField: FlowScreenField): ApexVariable {
        const name = flowScreenField.name[0];

        // only for FlowScreenField an inner class might be necessary
        if(flowScreenField.fieldType[0] === 'ComponentInstance' 
                && flowScreenField.storeOutputAutomatically 
                && flowScreenField.storeOutputAutomatically[0] === 'true') {
            // inner class
            const dataType: string = flowScreenField.extensionName[0];
            // TODO: very much doubt this works
            this.registerTypeClass(dataType);
        }

        const apexType = ApexDataType.fromFlowScreenField(flowScreenField);
        const variable = new ApexVariable(name, false).registerType(apexType.getResult());
        this.variables.push(variable);
        return variable;
    }

    registerType(name: string): string {
        name = this.getTypeName(name);
        if (!this.classLevelObjects.has(name)) {
            this.classLevelObjects.set(name, new Set<ClassLevelObjectAttribute>());
        }

        return name;
    }

    // Must be done here to be able to track individual stages later
    registerStages(stages: Array<string>) : ApexClass {

        this.stages = stages;

        stages = stages.map((s) => '\'' + s + '\'');
        const stagesString = stages.join(', ');

        super.registerVariable('Stages')
            .registerType('String')
            .registerIsCollection()
            .registerConstant()
            .registerRightHand('new List<String>{' + stagesString + '}');
        
        return this;
    }

    // ----------------------------------------------------------------------------------------------------------------

    protected buildOutput(): string {

        const bodies = new Array<string>();
        for(const section of this.apexSections) {
            bodies.push(section.build());
        }

        let body = bodies.join(global.NL);
        if(body) {
            body = global.NL + body + global.NL;
        }

        // Any optional section of code that can't contain line breaks internally can assume to start after white space,
        // but must make sure to add a trailing white space (probably space) in the end.
        // Any optional section of code that can contains line breaks internally can assume to start on a new line, but
        // must make sure to add a trailing line break in the end if having contents. Note how this.body and this.otherMethods
        // is inserted.
        return `${this.accessModifier} ${this.sharingLevel}class ${this.name} {

${this.versionComment}${this.classComment}${this.innerClassBlock}${this.fields4ClassHead}public ${this.name}(${this.fields4Arguments}) {
${this.fields4Constructor}${this.buildCallOfTopMethod()}
}
${this.otherMethods}}`;
    }

    private setInnerClassBlock(): void {
        if(this.innerClasses.length === 0) {
            return;
        }

        const innerClasses: string[] = [];
        for(const innerClass of this.innerClasses) {
            innerClasses.push(innerClass.build());
        }

        const {NL} = global;
        this.innerClassBlock = innerClasses.join(NL) + NL + NL;
    }

    private setInnerClassBlockByClassLevelObjects(): void {
        if(this.classLevelObjects.size === 0) {
            return;
        }

        const {NL} = global;
        const innerClasses: string[] = [];
        for (const [key, value] of this.classLevelObjects.entries()) {
            const lines: string[] = [];
            for (const att of value) {
                lines.push(att.dataType + ' ' + att.name + ';');
            }

            const classBody: string = lines.length === 0 ? '' : NL + lines.join(NL) + NL;
            const typeName = camelize(key, true);
            innerClasses.push(`private class ${typeName} {${classBody}}`);
        }

        this.innerClassBlock = innerClasses.join(NL) + NL + NL;
    }

    protected getReady() : void {
        this.setSharingLevel();
        this.setInnerClassBlock();
        this.setInnerClassBlockByClassLevelObjects();

        this.resolveVariablesOfMethods();
        this.variables = this.getVariablesSorted();
        
        new MethodScout(knowledge.name2node, knowledge.builder.getMainClass().getMethods()).run();

        this.setConstructor();
        this.setFields4ClassHead();
        this.setOtherMethods();
    }

    protected setOtherMethods(): void {
        if(this.methods.size === 0) return;

        const methodBodies: string[] = [];
        for(const apexMethod of this.methods.values()) {
            methodBodies.push(apexMethod.build());
        }

        // this section of the output might be "", in which case it does not come with any line breaks
        // if there is at least one method, 
        // a) a blank line is inserted before the method and 
        // b) a line break (but no blank line) after the last method
        this.otherMethods = global.NL + methodBodies.join(global.NL + global.NL) + global.NL;
    }

    private buildCallOfTopMethod() : string {
        const method = this.methods.get(TOP_METHOD);
        const call = method?.buildCall();
        return call ?? '';
    }

    private resolveVariablesOfMethods() : void {
        for(const apexMethod of this.methods.values()) {
            const apexVariables = apexMethod.resolveVariables();
            // for(const apexVariable of apexVariables) {
            //     console.error('method, variable:', apexMethod.getName(), ' ', apexVariable.getName());
            // }
        }
    }

    private getVariablesSorted() : ApexVariable[] {

        return this.variables.sort((a, b) => {
            if(a.isConstantVariable() && !b.isConstantVariable()) {
                return -1;
            }

            if(!a.isConstantVariable() && b.isConstantVariable()) {
                return 1;
            }

            if(a.getName() === VAR_RECORD) return -1;
            if(b.getName() === VAR_RECORD) return 1;

            if(a.isConstructorVariable() && !b.isConstructorVariable()) {
                return -1;
            }
            
            if(!a.isConstructorVariable() && b.isConstructorVariable()) {
                return 1;
            }

            return 1;
        });
    }

    private getTypeName(name: string) : string {
        if (name.includes(':')) {
            // we assume we got an "extensionName"
            name = name.replace(':', ' ');
        }

        return name;
    }
}