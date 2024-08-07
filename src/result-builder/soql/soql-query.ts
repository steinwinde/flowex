import { ApexSectionLiteral } from '../section/apex-section-literal.js';
import { ApexSection } from '../section/apex-section.js';

export class SoqlQuery extends ApexSection {
  private fields = new Array<string>();
  private sObject: null | string = null;
  // private wherePart: null | string = null;
  private orderByFields = new Array<string>();
  private limitPart: null | number = null;
  private exposedField: null | string = null;
  // we only support either ASC (default) OR DESC for all, not a mix
  private orientation: 'ASC' | 'DESC' = 'ASC';

  public select(fields: string | string[]): SoqlQuery {
    this.fields = typeof fields === 'string' ? [fields] : fields;
    return this;
  }

  public from(sObject: string): SoqlQuery {
    this.sObject = sObject;
    return this;
  }

  public where(wherePart: ApexSection | string): SoqlQuery {
    if (typeof wherePart === 'string') {
      const apexSectionLiteral = new ApexSectionLiteral(wherePart);
      super.addSection(apexSectionLiteral);
    } else {
      super.addSection(wherePart);
    }

    return this;
  }

  public orderBy(orderByFields: string | string[], desc?: boolean): SoqlQuery {
    this.orderByFields = typeof orderByFields === 'string' ? [orderByFields] : orderByFields;

    if (desc) {
      this.orientation = 'DESC';
    }

    return this;
  }

  public limit(limitPart: number): SoqlQuery {
    this.limitPart = limitPart;
    return this;
  }

  public exposeField(field: string): SoqlQuery {
    this.exposedField = field;
    return this;
  }

  public build(): string {
    let query = 'SELECT ' + this.fields.join(', ') + ' FROM ' + this.sObject;
    const wherePart = super.build();
    if (wherePart) {
      // only part that is an ApexSection
      // query += ' WHERE ' + this.wherePart;
      query += ' WHERE ' + super.build();
    }

    if (this.orderByFields.length > 0) {
      query += ' ORDER BY ' + this.orderByFields.join(` ${this.orientation}, `) + ` ${this.orientation}`;
    }

    if (this.limitPart) {
      query += ' LIMIT ' + this.limitPart;
    }

    query = '[' + query + ']';

    if (this.exposedField) {
      query += '.' + this.exposedField;
    }

    return query;
  }
}

export function soql(): SoqlQuery {
  return new SoqlQuery();
}
