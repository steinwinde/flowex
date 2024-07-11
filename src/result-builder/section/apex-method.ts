import { ApexSection, VariableUse } from './apex-section.js';
import { ApexVariableInfo } from "../apex-variable-info.js";
import { ApexVariable } from '../apex-variable.js';

// Why methods are created:
// - Nodes are called from multiple places
// - Actions
// - Special purpose methods (e.g. sorting, updating, getting)

export const TOP_METHOD = 'run';

// Prefixes of names of special purpose methods
export enum METHOD_PREFIXES {
    METHOD_PREFIX_GET = 'get', 
    METHOD_PREFIX_POPULATE = 'populate', 
    METHOD_PREFIX_SORT = 'sort', 
    METHOD_PREFIX_UPDATE = 'update'
}

// This represents a section of the code that is called from two points and must be a method.
export class ApexMethod extends ApexSection {

    // final name of the method; the name is adjusted by the ApexClass before the method is instantiated
    private readonly name: string;
    // e.g. "List<Account>", "void" or "String"
    private returnType: string = 'void';
    // the body of the method
    private body: ApexSection | undefined;
    // name of Node / flowElement that creates this method
    private readonly nodeName: string;
    // methods that call this method and must be considered when compiling parameters
    private callingMethods = new Set<ApexMethod>();
    // TODO: Is this really needed on method level?
    // if false, make all variables class fields
    private readonly localVariables;

    constructor(name: string, nodeName: string, localVariables: boolean) {
        super();
        this.name = name;
        this.nodeName = nodeName;
        this.localVariables = localVariables;
    }

    registerCallingMethod(callingMethod: ApexMethod): void {
        if([...this.callingMethods.keys()]
            .some(e => e.getName() === callingMethod.getName())) return;

        this.callingMethods.add(callingMethod);
    }

    // Use with care; only known use 2024-06-28: FlowActions
    registerParameter(variable: ApexVariable) : ApexVariable {
        // we default to read-only; if a return is needed, this will be set explicitly
        super.addVariable(variable, VariableUse.Read);
        return variable;
    }

    // FIXME: currently only used in record lookup
    registerReturnType(returnType: string) : ApexMethod {
        this.returnType = returnType;
        return this;
    }

    registerBody(body?: ApexSection): void {
        this.body = body;
    }

    // ----------------------------------------------------------------------------------------------------------------

    getName(): string {
        return this.name;
    }

    getNodeName(): string {
        return this.nodeName;
    }

    build() : string {
        const methodBody = this.body ? (NL + this.body.build() + NL) : '';
        // const params = !this.localVariables ? new Array<string>() : this.getParams();
        const params = this.getParams();
        const body = `private ${this.returnType} ${this.name}(${params}) {${methodBody}}`;
        // return super.buildWithBody(body);
        return body;
    }

    buildCall(argOverwrite?: string) : string {
        // const args = !this.localVariables ? new Array<string>() : this.getArguments();
        const args = argOverwrite ?? this.getArguments();
        return `${this.name}(${args});`;
    }

    resolveVariables(): Map<string, ApexVariableInfo> {
        if(this.body 
            && this.localVariables
        ) {
            // this.addVariables(this.body.resolveVariables());
            return this.body.resolveVariables();
        }

        // // TODO: not sure, if this needs to be called 
        // const variables = super.resolveVariables();
        // for(const variable of variables) {
        //     console.error('resolveVariables. method: ' + this.name + ', variable: ' + variable.getName());
        // }

        // return variables;

        // return new Map<string, ApexVariableInfo>();
        return this.getVariableInfos();
    }

    // TODO: just for debugging
    outputCallingMethods(): void {
        const callingMethodsOutput = [...this.callingMethods.values()].map(method => method.getName()).join(', ');
        console.error('method: ' + this.name 
            + (callingMethodsOutput ? ', calling methods: ' 
            + callingMethodsOutput : ', no calling methods found, must be constructor'));
    }

    // TODO: Just for debugging 
    outputVariables(): void {
        const variablesOutput = [...this.resolveVariables().values()].map(variable => variable.toString()).join(', ');
        console.error('method: ' + this.name 
            + (variablesOutput ? ', variables: ' + variablesOutput : ', no variables'));
    }

    addVariablesToCallingMethods(): boolean {
        let added = false;
        const variableInfos = this.getVariableInfos();

        for(const callingMethod of this.callingMethods) {
            for(const variableInfo of variableInfos.values()) {
                if(callingMethod.addVariableInfo(variableInfo)) {
                    added = true;
                }
            }
        }

        return added;
    }

    // protected addVariablesOfCalledMethod(variables: Array<ApexVariable>): boolean {
    //     let added = false;
    //     for(const variable of variables) {
    //         const found = this.getVariables().some((apexVariable) => apexVariable.getName() === variable.getName());
    //         if(!found) {
    //             this.addVariables([variable]);
    //             added = true;
    //         }
    //     }

    //     return added;
    // }
    
    // ----------------------------------------------------------------------------------------------------------------

    private getParams() : string {
        // if(!this.localVariables) return '';
        return [...this.resolveVariables().values()].map(variable => 
            variable.getApexVariable().getApexType() + ' ' + variable.getApexVariable().getName()).join(', ');
    }

    // This is in case we can use the same names in the caller and the parameters; this does not work e.g. for
    // literals
    private getArguments() : string {
        // if(!this.localVariables) return '';
        return [...this.resolveVariables().values()].map(variable =>
            variable.getApexVariable().getName()).join(', ');
    }
}