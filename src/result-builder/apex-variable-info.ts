import { ApexVariable } from './apex-variable.js';
import { VariableUse } from './section/apex-section.js';

export class ApexVariableInfo {
  private apexVariable: ApexVariable;
  private use: VariableUse;

  public constructor(apexVariable: ApexVariable, use: VariableUse) {
    this.apexVariable = apexVariable;
    this.use = use;
  }

  public getApexVariable(): ApexVariable {
    return this.apexVariable;
  }

  public getUse(): VariableUse {
    return this.use;
  }

  public toString(): string {
    const useString = this.use === VariableUse.Read ? 'Read' : 'Write';
    return `${this.apexVariable.getName()} (${useString})`;
  }
}
