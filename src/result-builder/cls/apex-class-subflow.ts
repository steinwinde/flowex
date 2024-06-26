import { FlowRunInMode } from "../../types/metadata.js";
import { ApexClass } from "./apex-class.js";
import { ApexVariable } from "../apex-variable.js";

export class ApexSubflowClass extends ApexClass {
    
    constructor(name: string) {
        const flowRunInMode : FlowRunInMode = "DefaultMode";
        super(name, 'public', flowRunInMode);
        this.sharingLevel = 'with sharing ';
    }

    // overwrites the implementation in the base class
    registerVariable(name: string): ApexVariable {

        const existingVariable = this.variables.find((v) => v.getName() === name);
        if (existingVariable) {
            return existingVariable;
        }

        const variable = new ApexVariable(name, false);
        this.variables.push(variable);
        return variable;
    }

    protected buildOutput(): string {
        this.getReady();

        return `public ${this.sharingLevel}class ${this.name} {

${this.fields4ClassHead}public ${this.name}(${this.fields4Arguments}) {
${this.fields4Constructor}}
}`;
    }

    protected getReady(): void {
        super.setFields4ClassHead();
        super.setConstructor();
    }
}