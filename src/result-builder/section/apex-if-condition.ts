/**
 * Represents an if condition as part of an if or an else statement inside of an apexIf
 */

// TODO: This fuses in an ad hoc manner two very similar inputs for apexConditions: FlowRecordFilter and FlowCondition;
// This should be merged properly.

import {
  FlowCollectionProcessor,
  FlowCondition,
  FlowDecision,
  FlowRecordFilter,
  FlowRule,
  FlowWaitEvent,
} from '../../types/metadata.js';
import { concatFilters } from '../../formatters/translators/query-filter.js';
import { getFlowElementReferenceOrValue } from '../../formatters/translators/reference-or-value-translator.js';
import { ApexVariable, apexVariableFromResourceName } from '../apex-variable.js';
import { ApexReference } from './apex-reference.js';
import { ApexSection, VariableUse } from './apex-section.js';

const CONDITION_LOGIC: Record<string, string> = {
  and: '&&',
  or: '||',
} as const;

// TODO: Why are there fewer here than in the metadata
// see FlowComparisonOperator
const OPERATOR_TRANSLATIONS: Record<string, string> = {
  EqualTo: '==',
  NotEqualTo: '!=',
  GreaterThan: '>',
  LessThan: '<',
  GreaterThanOrEqualTo: '>=',
  LessThanOrEqualTo: '<=',
} as const;

export class ApexIfCondition extends ApexSection {
  private static getFilters(filterLogic: string, filters: FlowRecordFilter[], ref: string): string {
    let result = '';
    const overallOper = CONDITION_LOGIC[filterLogic];
    const ar: string[] = [];
    let a = '';
    let b = '';
    if (filters.length > 1) {
      a = '(';
      b = ')';
    }

    for (const filter of filters) {
      // e.g. "$Record.FirstName"
      const apexReference = new ApexReference().set(filter.field[0]);
      const leftValueReference: string = apexReference.build();

      if (leftValueReference.includes('.')) {
        const obj: string = leftValueReference.split('.')[0];
        ar.push(obj + ' != null');
      }

      const oper: string = OPERATOR_TRANSLATIONS[filter.operator[0]];
      // TODO: this might need quoting - add to parameters of getFlowElementReferenceOrValue ?
      const rightValue: string = getFlowElementReferenceOrValue(filter.value[0], false).v;
      let val = '';
      if (oper) {
        val = `${a}${ref}.${leftValueReference} ${oper} ${rightValue}${b}`;
      } else {
        switch (filter.operator[0]) {
          case 'IsNull': {
            const eqOrNot = rightValue === 'true' ? '==' : '!=';
            val = `${a}${ref}.${leftValueReference} ${eqOrNot} null${b}`;
            break;
          }

          case 'StartsWith': {
            // TODO: don't we need something similiar to IsNull: eqOrNot...?!
            val = `${ref}.${leftValueReference}.startsWith(${rightValue})`;

            break;
          }

          case 'EndsWith': {
            // TODO: don't we need something similiar to IsNull: eqOrNot...?!
            val = `${ref}.${leftValueReference}.endsWith(${rightValue})`;

            break;
          }

          case 'Contains': {
            // TODO: don't we need something similiar to IsNull: eqOrNot...?!
            val = `${ref}.${leftValueReference}.contains(${rightValue})`;

            break;
          }

          default: {
            val = '???';
            break;
          }
        }
      }

      ar.push(val);
    }

    result = ar.join(' ' + overallOper + ' ');

    return result;
  }

  public setString(body: string, apexVariables: ApexVariable[]): ApexIfCondition {
    this.addStringSection(body);
    for (const apexVariable of apexVariables) {
      this.addVariable(apexVariable, VariableUse.Read);
    }

    return this;
  }

  public setFlowRecordFilter(filterLogic: string, filters: FlowRecordFilter[], ref: string): ApexIfCondition {
    this.addStringSection(ApexIfCondition.getFilters(filterLogic, filters, ref));
    return this;
  }

  public setFlowCondition(
    conditionLogic: string,
    conditions: FlowCondition[],
    includeNullCheck: boolean
  ): ApexIfCondition {
    const ar: string[] = this.getConditions(conditions, includeNullCheck);

    // conditionLogic is "and", "or" or something like "1 OR (2 AND 4) OR (3 AND 4)"
    const overallOper: string | undefined = CONDITION_LOGIC[conditionLogic];

    if (overallOper) {
      this.addStringSection(ar.join(' ' + overallOper + ' '));
      return this;
    }

    const reOr = /OR/g;
    const reAnd = /AND/g;
    this.addStringSection(concatFilters(ar, conditionLogic).replaceAll(reOr, '||').replaceAll(reAnd, '&&'));
    return this;
  }

  // getVariableNames(): Set<string> {
  //     return this.variableNames;
  // }

  // ----------------------------------------------------------------------------------------------------------------
  // private
  // ----------------------------------------------------------------------------------------------------------------

  // private registerVariable(apexVariable: ApexVariable) {
  //     this.variableNames.add(apexVariable.getName());
  // }

  private addReadVariable(name: string): void {
    const apexVariable = apexVariableFromResourceName(name);
    this.addVariable(apexVariable, VariableUse.Read);
  }

  private getConditions(conditions: FlowCondition[] | undefined, includeNullCheck: boolean): string[] {
    const ar: string[] = [];
    if (conditions === undefined) return ar;

    let a = '';
    let b = '';
    if (conditions.length > 1) {
      a = '(';
      b = ')';
    }

    const isChecked4Null: string[] = [];

    for (const condition of conditions) {
      const apexReference = new ApexReference().set(condition.leftValueReference[0]);
      const leftValueReference: string = apexReference.build();
      this.addReadVariable(apexReference.getFirstPart());

      // Not sure, if we will use this for anything but "decisions", but in the context of "decisions" flows do an
      // implicit null check. This null check is added here to make the "else" clause chosen in case anything in the
      // "if" condition is null.
      if (includeNullCheck && apexReference.isField()) {
        const obj = apexReference.getFirstPart();
        if (!isChecked4Null.includes(obj)) {
          ar.push(obj + ' != null');
          isChecked4Null.push(obj);
        }
      }

      const oper: string = OPERATOR_TRANSLATIONS[condition.operator];
      let rightValue = '';
      if (condition.rightValue) {
        const flowElementReferenceOrValue = getFlowElementReferenceOrValue(condition.rightValue[0], false);
        if (flowElementReferenceOrValue.t === 'elementReference') {
          // this.variableNames.add(flowElementReferenceOrValue.v);
          this.addReadVariable(flowElementReferenceOrValue.v);
        }

        rightValue = flowElementReferenceOrValue.v;
      }

      // in the UI, the user can choose to ignore the field, which means that the right value is null
      if (!rightValue) rightValue = 'null';

      let val = '';
      if (oper) {
        val = `${a}${leftValueReference} ${oper} ${rightValue}${b}`;
      } else {
        switch (condition.operator[0]) {
          case 'IsNull': {
            const eqOrNot = rightValue === 'true' ? '==' : '!=';
            val = `${a}${leftValueReference} ${eqOrNot} null${b}`;
            break;
          }

          case 'StartsWith': {
            // TODO: don't we need something similiar to IsNull: eqOrNot...?!
            val = `${leftValueReference}.startsWith(${rightValue})`;
            // TODO: We need to know here, if left and right are variables or literals
            break;
          }

          case 'EndsWith': {
            // TODO: don't we need something similiar to IsNull: eqOrNot...?!
            val = `${leftValueReference}.endsWith(${rightValue})`;
            break;
          }

          case 'Contains': {
            // TODO: don't we need something similiar to IsNull: eqOrNot...?!
            val = `${leftValueReference}.contains(${rightValue})`;
            break;
          }

          case 'IsChanged': {
            // TODO
            val = 'Not yet supported';
            break;
          }

          // TODO
          // IsChanged: '???',
          // WasSet: '???',
          // WasSelected: '???',
          // WasVisited: '???',
          default: {
            val = '???';
            break;
          }
        }
      }

      ar.push(val);
    }

    return ar;
  }
}

export function apexIfConditionFromFlowDecision(decision: FlowDecision, ruleNumber: number): ApexIfCondition {
  const rule: FlowRule = decision.rules[ruleNumber];
  const apexIfCondition = new ApexIfCondition().setFlowCondition(rule.conditionLogic[0], rule.conditions, true);
  return apexIfCondition;
}

export function apexIfConditionFromWaitCondition(flowWait: FlowWaitEvent): ApexIfCondition {
  const apexIfCondition = new ApexIfCondition().setFlowCondition(flowWait.conditionLogic[0], flowWait.conditions, true);
  return apexIfCondition;
}

export function apexIfConditionFromCollectionProcessor(collectionProcessor: FlowCollectionProcessor): ApexIfCondition {
  return new ApexIfCondition().setFlowCondition(
    collectionProcessor.conditionLogic[0],
    [collectionProcessor.conditions![0]],
    false
  );
}

export function apexIfConditionFromFlowRecordFilter(
  filterLogic: string,
  filters: FlowRecordFilter[],
  ref: string
): ApexIfCondition {
  return new ApexIfCondition().setFlowRecordFilter(filterLogic, filters, ref);
}

export function apexIfConditionFromString(s: string, apexVariables: ApexVariable[]): ApexIfCondition {
  return new ApexIfCondition().setString(s, apexVariables);
}
