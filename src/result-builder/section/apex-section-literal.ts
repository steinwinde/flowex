// Watch out! Variables need to be registered manually here.

import { ApexSection, VariableUse } from "./apex-section.js";
import { ApexVariable } from "../apex-variable.js";

// does not contain any variables that can colide or need to be tracked; registered as Read
export class ApexSectionLiteral extends ApexSection {

    constructor(literal: string) {
        super();
        this.addStringSection(literal);
    }

    registerVariable(apexVariable : ApexVariable): this {
        super.addVariable(apexVariable, VariableUse.Read);
        return this;
    }

    registerVariables(apexVariables : Array<ApexVariable>): this {
        for (const v of apexVariables) this.registerVariable(v);
        
        return this;
    }
}