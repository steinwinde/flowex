import { FlowElement } from "../types/metadata.js";
import { ApexMethod } from "./section/apex-method.js";
import { soql, SoqlQuery } from "./soql/soql-query.js";


// Names of variables of potentially global importance, created by Flowex
// globally unique variables
export const VAR_RECORD = 'record';
export const VAR_RECORD_PRIOR = 'recordPrior';
export const VAR_CURRENT_STAGE = 'CurrentStage';
export const VAR_STAGES = 'Stages';
export const VAR_ACTIVE_STAGES = 'ActiveStages';
// non-unique variables
export const VAR_RESULT = 'result';
export const VAR_ITEM = 'item';
export const VAR_WRAPPER_LIST = 'wrapperList';
export const VAR_E = 'e'; // catch block error
export const VAR_I = 'i'; // loop
export const VAR_J = 'j'; // loop in loop
export const VAR_L = 'l'; // List
export const VAR_N = 'n'; // Number
export const VAR_S = 's'; // String
export const VAR_PICKLISTVAL = 'pickListVal';
export const VAR_PLES = 'ples'; // picklist entries
export const VAR_FR = 'fr'; // Describe Field Result

// TODO: not sure we need this or should even use it
export type VAR = typeof VAR_ACTIVE_STAGES | typeof VAR_CURRENT_STAGE | typeof VAR_FR | typeof VAR_I | typeof VAR_ITEM | typeof VAR_L | typeof VAR_N
    | typeof VAR_PICKLISTVAL | typeof VAR_PLES | typeof VAR_RECORD | typeof VAR_RECORD_PRIOR | typeof VAR_RESULT | typeof VAR_S | typeof VAR_WRAPPER_LIST;

// anything not in the list of Apex types is considered object
export type TYPE_LITERAL_APEX = 'Blob' | 'Boolean' | 'Date' | 'DateTime' | 'Decimal' | 'Double' | 'Id' | 'Integer' | 'Long' | 'String' | 'Time';

export class ApexVariable {

    // If set to public, the variable doesn't appear in any method calls and it is automatically
    // class field
    private accessModifier: 'private' | 'public' = 'private';

    // This does not include List information, i.e. is always for single objects or primitives
    private apexType: string | undefined;

    // in Apex, this is a "List<...>"
    private isCollection = false;
    // in Apex, this is a "final static..."
    private isConstant = false;
    // constructor variable due to initialization in constructor
    private isInitializedInConstructor = false;
    // do never make a variable a class field, if it targets a method; e.g. this could be a loop variable
    private targetedMethod: ApexMethod | undefined;

    private name: string;
    private comment: string | undefined;

    // TODO: Not sure this makes sense as a part of ApexVariable
    private rightHand: SoqlQuery | string | undefined;

    // Information facilitating later retrieval
    private flowElementName : string | undefined;
    // See VAR_RECORD, VAR_CURRENT_STAGE, VAR_ACTIVE_STAGES etc.
    // private special : VAR | undefined;

    constructor(name: string, isConstant: boolean = false) {

        this.name = name;
        this.isConstant = isConstant;
    }

    // in case of Flow Stages (and other rather internal variables?), this method is useful
    registerConstant(): ApexVariable {
        this.isConstant = true;
        return this;
    }

    registerLocal(apexMethod : ApexMethod | null | undefined): ApexVariable {
        // TODO: We really should only use undefined (if at all)
        if(apexMethod === null) return this;
        this.targetedMethod = apexMethod;
        return this;
    }

    registerSpecial(special: VAR): ApexVariable {
        // TODO
        // this.special = special;
        return this;
    }

    // TODO: This should get ApexType as parameter, not a string
    registerType(type: string): ApexVariable {
        if(this.apexType !== undefined) {
            throw new Error('Apex type already set: ' + this.name + ', ' + this.apexType);
        }

        if(type.startsWith('List<')) {
            throw new Error('Only the inner type is to be provided');
        }

        if(type === 'elementReference') {
            throw new Error('elementReference');
        }

        this.apexType = type;
        return this;
    }

    registerFlowElementName(flowElement: FlowElement): ApexVariable {
        this.flowElementName = flowElement.name[0];
        return this;
    }

    registerIsCollection() : ApexVariable{
        this.isCollection = true;
        return this;
    }

    registerAccessPublic() : ApexVariable {
        this.accessModifier = 'public';
        return this;
    }

    registerConstructorVariable() : ApexVariable{

        if(this.rightHand !== undefined) {
            throw new Error('Right hand side value not allowed for constructor variable');
        }

        this.isInitializedInConstructor = true;
        return this;
    }

    registerRightHand(rightHand: SoqlQuery | string): ApexVariable {
        if(this.rightHand !== undefined) {
            throw new Error('Right hand side already set');
        }

        if(this.isInitializedInConstructor) {
            throw new Error('Right hand side value not allowed for constructor variable');
        }

        this.rightHand = rightHand;
        return this;
    }

    registerComment(comment: string): ApexVariable {
        if(this.comment !== undefined) {
            throw new Error('Comment already set');
        }

        this.comment = comment;
        return this;
    }

    // ----------------------------------------------------------------------------------------------------------------

    getName(): string {
        return this.name;
    }

    getFlowElementName(): string | undefined {
        return this.flowElementName;
    }

    // TODO: not sure this is needed
    isConstantVariable() : boolean {
        return this.isConstant;
    }

    isCollectionVariable() : boolean {
        return this.isCollection;
    }

    isConstructorVariable() : boolean {
        return this.isInitializedInConstructor;
    }

    isLocalVariable() : boolean {
        return this.targetedMethod !== undefined;
    }

    getApexType(): string {
        if(this.apexType === undefined) {
            throw new Error('Apex type not set of variable: ' + this.name);
        }
        
        return this.apexType;
    }

    // TODO: For debugging purposes only
    hasApexType(): boolean {
        return this.apexType !== undefined;
    }

    // ----------------------------------------------------------------------------------------------------------------

    build(): string {
        if(this.name === undefined) {
            throw new Error('Name not set');
        }
        
        return this.name;
    }

    buildDeclaration(outputAccessModifier : boolean): string {
        const completeApexType = this.getCompleteApexType();
        const main = `${completeApexType} ${this.name}`;
        if(outputAccessModifier) {
            return `${this.accessModifier} ${main}`;
        }

        return main;
    }

    buildDeclarationForClassHead(): string {
        const completeApexType = this.getCompleteApexType();
        let main = `${completeApexType} ${this.name}`;
        // What variables should we initialize in the class head, considering they are initialized in the constructor? Initialization is safer,
        // but then they become non-final.
        // One other option: if(!this.isInitializedInConstructor) {
        if(this.name !== VAR_RECORD) {
            const rightHand = this.rightHand === undefined ? this.getCompleteNonExistentRightHand() : this.rightHand;
            main = `${main} = ${rightHand}`;
        }

        let constantModifier = '';
        if(this.isConstant) {
            constantModifier = 'static final ';
        }
        
        if(this.comment) {
            return `${this.comment}${global.NL}${this.accessModifier} ${constantModifier}${main}`;
        }

        return `${this.accessModifier} ${constantModifier}${main}`;
    }

    buildDeclarationWithInitializationInConstructor(): string {
        if(this.rightHand) {
            throw new Error('Right hand side value set, but not allowed when value is initialized in constructor: ' 
                + this.name + ',' + this.rightHand);
        }

        if(this.isConstant) {
            throw new Error('A Constant variable is not initialized in a constructor: ' + this.name);
        }

        return `this.${this.name} = ${this.name};`;
    }

    // ----------------------------------------------------------------------------------------------------------------

    private getCompleteApexType(): string {
        if(this.apexType === undefined) {
            throw new Error('Apex type not set: ' + this.name);
        }

        return this.isCollection ? `List<${this.apexType}>` : this.apexType;
    }

    private getCompleteNonExistentRightHand(): string {
        return this.isCollection ? `new List<${this.apexType}>()` : 'null';
    }
}

export function apexVariableFromResourceName(resourceName: string): ApexVariable {
    if (resourceName.includes('.')) {
        if(resourceName.startsWith(VAR_RECORD_PRIOR + '.')) {
            const type = knowledge.builder.getMainClass().getVariable(VAR_RECORD).getApexType();
            const query = soql().select(resourceName.slice(VAR_RECORD_PRIOR.length + 1)).from(type).build();
            const apexVariable = knowledge.builder.getMainClass().registerVariable(VAR_RECORD_PRIOR)
                .registerSpecial(VAR_RECORD_PRIOR)
                .registerRightHand(query)
                .registerType(type);
            return apexVariable;
        }
     
        // we allow callers to pass in a field name, e.g. 'Account.Name', but we only need the object name
        resourceName = resourceName.split('.')[0];
    }

    const apexVariable = knowledge.builder.getMainClass().getVariable(resourceName);
    assertApexVariableDefined(apexVariable);

    return apexVariable;
}

// export function apexVariableFromLiteral(apexTypeLiteral : TYPE_LITERAL_APEX, apexVariableName : VAR) : ApexVariable {
//     return new ApexVariable(apexTypeLiteral).registerSpecial(apexVariableName).registerType(apexTypeLiteral);
// }

function assertApexVariableDefined(apexVariable: ApexVariable | undefined): asserts apexVariable {
    if(apexVariable === undefined) {
        throw new Error('ApexVariable not defined');
    }
}