import { ApexVariable } from '../apex-variable.js';
import { SoqlQuery } from '../soql/soql-query.js';
import { ApexSection, VariableUse } from './apex-section.js';

export class ApexRightHand extends ApexSection {
  private rightHand: string = '';

  // constructor();
  public constructor(rightHand?: string, apexVariables?: ApexVariable[]) {
    super();
    if (rightHand) {
      this.rightHand = rightHand;
      if (apexVariables) {
        for (const apexVariable of apexVariables) {
          this.addVariable(apexVariable, VariableUse.Read);
        }
      }
    }
  }

  public setSoqlQuery(soqlQuery: SoqlQuery): ApexRightHand {
    this.addSection(soqlQuery);
    return this;
  }

  public build(): string {
    const sectionBuild = super.build();
    return this.rightHand + sectionBuild;
  }
}
