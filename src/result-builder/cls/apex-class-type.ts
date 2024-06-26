import { ApexClass } from "./apex-class.js";

export class ApexTypeClass extends ApexClass {

    constructor(name: string) {
        super(name, 'private');
    }

    protected buildOutput(): string {
        // TODO: this is hardly what we need
        return `private class ${this.name} {}`;
    }

    protected getReady(): void {
        // nothing to do
    }
}