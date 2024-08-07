import { ApexLeftHand } from './apex-left-hand.js';
import { ApexRightHand } from './apex-right-hand.js';
import { ApexSection } from './apex-section.js';

export class ApexAssignment extends ApexSection {
  private leftHand: ApexSection | string;
  private rightHand: ApexSection | string;

  // Even the left hand can be a string, e.g. when referring to an array like 'myArray[n-1]'; but use ApexLeftHand as much as possible
  public constructor(leftHand: ApexLeftHand | string, rightHand: ApexRightHand | string) {
    super();
    this.leftHand = leftHand;
    this.rightHand = rightHand;

    if (this.leftHand instanceof ApexSection) {
      this.resolveVariablesOfPart(this.leftHand.resolveVariables());
    }

    if (this.rightHand instanceof ApexSection) {
      this.resolveVariablesOfPart(this.rightHand.resolveVariables());
    }
  }

  public build(): string {
    const body = this.getBody();
    const additionalBody = super.build();
    if (body && additionalBody) {
      return body + NL + additionalBody;
    }

    return body ?? additionalBody;
  }

  private getBody(): string {
    const leftHand = this.leftHand instanceof ApexSection ? this.leftHand.build() : this.leftHand;
    const rightHand = this.rightHand instanceof ApexSection ? this.rightHand.build() : this.rightHand;
    const body = `${leftHand} = ${rightHand};`;
    return body;
  }
}
