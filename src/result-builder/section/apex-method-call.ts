import { ApexMethod } from './apex-method.js';
import { ApexSection } from './apex-section.js';

export class ApexMethodCall extends ApexSection {
  private apexMethod: ApexMethod;

  public constructor(apexMethod: ApexMethod) {
    super();
    this.apexMethod = apexMethod;
  }

  public build(): string {
    // return this.apexMethod.buildCall();

    const body = this.apexMethod.buildCall();
    const additionalBody = super.build();
    if (body && additionalBody) {
      return body + NL + additionalBody;
    }

    return body ?? additionalBody;
  }
}
