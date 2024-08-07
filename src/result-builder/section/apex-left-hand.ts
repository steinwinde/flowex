import { ApexVariable } from '../apex-variable.js';
import { ApexSection, VariableUse } from './apex-section.js';

export class ApexLeftHand extends ApexSection {
  private leftHand: string;

  public constructor(leftHand: string, apexVariables: ApexVariable[]) {
    super();
    this.leftHand = leftHand;
    for (const apexVariable of apexVariables) {
      // FIXME: This is not necessarily correct (a Write), if the variable is an object
      this.addVariable(apexVariable, VariableUse.Write);
    }
  }

  public build(): string {
    return this.leftHand;
  }
}

// export const apexLeftHandFromLiteral = (apexTypeLiteral : TYPE_LITERAL_APEX, apexVariableName : VAR) => {
//     const leftHand = `${apexTypeLiteral} ${apexVariableName}`;
//     const apexVariable = apexVariableFromLiteral(apexTypeLiteral, apexVariableName);
//     return new ApexLeftHand(leftHand, [apexVariable]);
// }
