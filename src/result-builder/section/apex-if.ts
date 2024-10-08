import { ApexVariableInfo } from '../apex-variable-info.js';
import { ApexComment } from './apex-comment.js';
import { ApexIfCondition } from './apex-if-condition.js';
import { ApexSection } from './apex-section.js';

const NOTHING_TO_DO = new ApexComment('nothing to do');

export class ApexIf extends ApexSection {
  private conditions = new Array<ApexIfCondition>();
  private bodies = new Array<ApexSection>();
  private defaultBody: ApexSection | undefined;

  public if(condition: ApexIfCondition, body: ApexSection | null | undefined): ApexIf {
    this.conditions.push(condition);
    this.bodies.push(body ?? NOTHING_TO_DO);

    return this;
  }

  public default(body: ApexSection | null | undefined): ApexIf {
    this.defaultBody = body ?? NOTHING_TO_DO;

    return this;
  }

  public build(): string {
    return this.getBody();
    // return super.buildWithBody(this.getBody());
  }

  public resolveVariables(): Map<string, ApexVariableInfo> {
    for (const condition of this.conditions) {
      this.resolveVariablesOfPart(condition.resolveVariables());
    }

    for (const body of this.bodies) {
      this.resolveVariablesOfPart(body.resolveVariables());
    }

    if (this.defaultBody) {
      this.resolveVariablesOfPart(this.defaultBody.resolveVariables());
    }

    // this might also add variables from sections added to apexIf, e.g. apexAssignments
    return super.resolveVariables();
  }

  private getBody(): string {
    const conditions = this.conditions.map((condition) => condition.build());

    const bodies = this.bodies.map((body) => body.build());
    const defaultBody = this.defaultBody ? this.defaultBody.build() : '';
    bodies.push(defaultBody);

    let result = `if(${conditions[0]}) {` + NL + bodies[0] + NL + '}';

    for (let i = 1; i < conditions.length; i++) {
      result += ` else if(${conditions[i]}) {`;
      if (bodies[i]) {
        result += NL + bodies[i] + NL;
      }

      result += '}';
    }

    // now add default else block
    if (bodies.at(-1)) {
      result += ` else {${NL}${bodies.at(-1)!}${NL}}`;
    }

    const additionalBody = super.build();
    if (result && additionalBody) {
      return result + NL + additionalBody;
    }

    return result ?? additionalBody;

    // return result;
  }
}

export function apexIf(): ApexIf {
  return new ApexIf();
}
