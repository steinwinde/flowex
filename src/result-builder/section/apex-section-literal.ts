// Watch out! Variables need to be registered manually here.

import { ApexVariable } from '../apex-variable.js';
import { countOccurences, strFormat } from '../../utils.js';
import { ApexSection, VariableUse } from './apex-section.js';

// does not contain any variables that can collide or need to be tracked; registered as Read
export class ApexSectionLiteral extends ApexSection {
  public constructor(literal: string, insertedSections?: ApexSection[]) {
    super();
    if (countOccurences(literal) !== (insertedSections ? insertedSections.length : 0)) {
      throw new Error('Number of %s placeholders does not match the number of sections to insert.');
    }

    this.addStringSection(literal);
    if (insertedSections) {
      this.addSections(insertedSections);
    }
  }

  public registerVariable(apexVariable: ApexVariable): this {
    super.addVariable(apexVariable, VariableUse.Read);
    return this;
  }

  public registerVariables(apexVariables: ApexVariable[]): this {
    for (const v of apexVariables) this.registerVariable(v);

    return this;
  }

  public build(): string {
    const builtSections = super.getBuiltSections();
    return strFormat(builtSections, NL);
  }
}
