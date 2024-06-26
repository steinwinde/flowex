import { ApexMethod } from "./apex-method.js";
import { ApexSection } from "./apex-section.js";

export class ApexMethodCall extends ApexSection {
    private apexMethod: ApexMethod;

    constructor(apexMethod: ApexMethod) {
        super();
        this.apexMethod = apexMethod;
    }

    build(): string {
        // It is for this reason build() must be called late ;-)
        return this.apexMethod.buildCall();
        // const body = this.apexMethod.buildCall();
        // return super.buildWithBody(body);
    }
}