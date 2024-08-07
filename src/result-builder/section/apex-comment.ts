import { ApexSection } from './apex-section.js';

export class ApexComment extends ApexSection {
  public constructor(comment: string) {
    super();
    this.addStringSection(`// ${comment}`);
  }
}
