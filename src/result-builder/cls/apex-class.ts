import { FlowConstant, FlowRunInMode } from '../../types/metadata.js';
import { ApexVariable } from '../apex-variable.js';

const SHARING_LEVEL = new Map([
    ['SystemModeWithoutSharing', 'without sharing'],
    ['DefaultMode', 'inherited sharing'], 
    ['SystemModeWithSharing', 'with sharing'],
    [null, '']
]);

// TODO: should be moved to a more appropriate place
export type AccessModifier = 'private' | 'protected' | 'public';


export abstract class ApexClass {

    // always known at time of creation, e.g. for inner classes "private"
    protected accessModifier: string;
    // e.g. for inner classes this can be null
    protected flowRunInMode: FlowRunInMode | null = null;
    // typically the name of the Flow
    readonly name: string;
    protected variables: Array<ApexVariable> = new Array<ApexVariable>();

    protected versionComment = '';
    protected classComment = '';

    // all class level fields, i.e. class wide variables
    protected fields4ClassHead: string = '';    // for inner classes this is empty
    protected sharingLevel: string = '';
    // constructor arguments
    protected fields4Arguments: string = '';
    // constructor body
    protected fields4Constructor: string = '';
    // body of run method in main class
    protected body = '';

    // input name will usually be the name of the Flow
    constructor(name: string, accessModifier: AccessModifier, flowRunInMode?: FlowRunInMode) {
        this.name = name;
        this.accessModifier = accessModifier;
        this.flowRunInMode = flowRunInMode ?? null;
    }

    getVariable(name: string): ApexVariable {
        for(const variable of this.variables) {
            if(variable.getName() === name) {
                return variable;
            }
        }

        throw new Error(`Variable ${name} not found`);
    }

    // TODO: Not sure, if we should use this at all. Better return the ApexVariable itself, because it has information on 
    // things like Collection true/false too.
    getCustomTypeOfVariable(name: string): string | undefined {
        // TODO: Not sure, if this works exactly as in programmer.ts, but hopefully it does
        for(const variable of this.variables) {
            if(variable.getName() === name) {
                // TODO: Note that this does not consider List/not List
                return variable.getApexType();
            }
        }

        // Based on the way the method is used, this is a meaningful result and we shouldn't throw an exception
        return undefined;
    }

    getVariables() : Array<ApexVariable> {
        return this.variables;
    }

    // TODO: There is limited necessity to calculate a variable name to guarantee uniqueness. E.g. if the 
    // same Subflow is called twice in a Flow, the variable names are different, because they are based on the name 
    // and not on the flowname in the flow-meta.
    // It makes sense to make sure in the calling code no attempt is made to register the same variable twice.
    // HOWEVER, there are certain variables Salesforce uses for internal purposes and that are not exposed
    // as a Flow Resource. As we create them with their intuitive names, they can cause name conflicts. Here are the
    // cases known to me:
    // - "Stages" for the List<String> to model Flow stages
    // - "ActiveStages" for the List<String> to model active Flow stages
    // - "CurrentStage" for the String to model the current Flow stage
    // - Variables set by the application to hold results temporarily, e.g. "l" in record lookups
    // - Maybe loop variables like i, j
    registerVariable(name: string): ApexVariable {
        this.checkValidName(name);
        this.checkUnique(name);

        const variable = new ApexVariable(name, false);
        this.variables.push(variable);
        return variable;
    }

    private checkValidName(name: string): void {
        if(/^[A-Z_a-z]+$/.test(name) && name.length > 0) return;
        throw new Error('Variable name must contain letters only and must not be empty: ' + name);
    }

    // TODO: This is verifying the correctness of the code, not of the input data or anything else
    protected checkUnique(name: string) {
        const existingVariable = this.variables.find((v) => v.getName() === name);
        if (existingVariable && !existingVariable.isLocalVariable()) {
            throw new Error(`Variable ${name} already exists`);
        }
    }

    registerConstant(flowConstant: FlowConstant) : ApexVariable {
        const name = flowConstant.name[0];
        const existingVariable = this.variables.find((v) => v.getName() === name);
        if (existingVariable) {
            // Make sure in the calling code this is not called unnecessarily
            throw new Error(`Variable ${name} already exists`);
        }
        
        const variable = new ApexVariable(name, true);
        this.variables.push(variable);
        return variable;
    }

    registerVersionComment(version: string): ApexClass {
        this.versionComment = `// Generated by FlowEx ${version}` + NL + NL;
        return this;
    }

    // see start.ts
    registerClassComment(comment: string): ApexClass {
        this.classComment = `// ${comment}` + NL;
        return this;
    }

    build(): string {
        this.getReady();
        return this.buildOutput();
    }

    protected abstract buildOutput(): string;

    protected abstract getReady() : void;

    // When creating a new class with the Builder, one gets a handle to this class; it's nice from there to be able to 
    // know its name (instead of going back to the Builder)
    public getName(): string {
        return this.name;
    }

    // ----------------------------------------------------------------------------------------------------------------

    protected setSharingLevel(): void {
        const bareSharingLevel = SHARING_LEVEL.get(this.flowRunInMode);
        if(bareSharingLevel) {
            this.sharingLevel = bareSharingLevel + ' ';
        }
    }

    protected setFields4ClassHead(): void {
        const fields: string[] = [];
        for(const variable of this.variables) {
            if(!variable.isLocalVariable()) {
                fields.push(variable.buildDeclarationForClassHead());
            }
        }
        
        this.fields4ClassHead = fields.join(';' + NL);
        if(this.fields4ClassHead.length > 0) {
            this.fields4ClassHead += ';' + NL + NL;
        }
    }

    protected setConstructor(): void {
        if(this.variables.length === 0) return;
        const fields4ArgumentsArray: string[] = [];
        const fields4ConstructorArray: string[] = [];
        for(const variable of this.variables) {
            if(variable.isConstructorVariable()) {
                fields4ArgumentsArray.push(variable.buildDeclaration(false));
                fields4ConstructorArray.push(variable.buildDeclarationWithInitializationInConstructor());
            }
        }

        if(fields4ArgumentsArray.length === 0) return;
        this.fields4Arguments = fields4ArgumentsArray.join(', ');
        this.fields4Constructor = fields4ConstructorArray.join(NL);
        if(this.fields4Constructor.length > 0) {
            this.fields4Constructor += NL;
        }
    }
}