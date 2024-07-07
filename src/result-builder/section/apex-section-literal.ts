// Watch out! Variables need to be registered manually here.

import { ApexSection, VariableUse } from "./apex-section.js";
import { ApexVariable } from "../apex-variable.js";
import { countOccurences, strFormat } from "../../utils.js";

// does not contain any variables that can collide or need to be tracked; registered as Read
export class ApexSectionLiteral extends ApexSection {

    constructor(literal: string, insertedSections?: Array<ApexSection>) {
        super();
        if(countOccurences(literal) !== (insertedSections ? insertedSections.length : 0)) {
            throw new Error('Number of %s placeholders does not match the number of sections to insert.');
        }

        this.addStringSection(literal);
        if(insertedSections) {
            this.addSections(insertedSections);
        }
    }

    registerVariable(apexVariable : ApexVariable): this {
        super.addVariable(apexVariable, VariableUse.Read);
        return this;
    }

    registerVariables(apexVariables : Array<ApexVariable>): this {
        for (const v of apexVariables) this.registerVariable(v);
        
        return this;
    }

    build(): string {
        const builtSections = super.getBuiltSections();
        return strFormat(builtSections, NL);
    }
}