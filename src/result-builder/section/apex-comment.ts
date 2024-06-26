import { ApexSection } from "./apex-section.js";

export class ApexComment extends ApexSection {

    constructor(comment: string) {
        super();
        this.addStringSection(`// ${comment}`);
    }
}