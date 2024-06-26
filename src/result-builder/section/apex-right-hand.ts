import { ApexVariable } from "../apex-variable.js";
import { ApexSection, VariableUse } from "./apex-section.js";

export class ApexRightHand extends ApexSection {
    private rightHand: string;

    constructor(rightHand: string, apexVariables: Array<ApexVariable>) {
        super();
        this.rightHand = rightHand;
        for(const apexVariable of apexVariables) {
            this.addVariable(apexVariable, VariableUse.Read);
        }
    }

    build() : string {
        return this.rightHand;
    }
}