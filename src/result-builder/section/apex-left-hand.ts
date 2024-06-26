import { ApexVariable, TYPE_LITERAL_APEX, VAR, apexVariableFromLiteral } from "../apex-variable.js";
import { ApexSection, VariableUse } from "./apex-section.js";

export class ApexLeftHand extends ApexSection {
    private leftHand: string;

    constructor(leftHand: string, apexVariables: Array<ApexVariable>) {
        super();
        this.leftHand = leftHand;
        for(const apexVariable of apexVariables) {
            // FIXME: This is not necessarily correct (a Write), if the variable is an object
            this.addVariable(apexVariable, VariableUse.Write);
        }
    }

    
    build() : string {
        return this.leftHand;
    }
}

export const apexLeftHandFromLiteral = (apexTypeLiteral : TYPE_LITERAL_APEX, apexVariableName : VAR) => {
    const leftHand = `${apexTypeLiteral} ${apexVariableName}`;
    const apexVariable = apexVariableFromLiteral(apexTypeLiteral, apexVariableName);
    return new ApexLeftHand(leftHand, [apexVariable]);
}