import { ApexAssignment } from '../../result-builder/section/apex-assignment.js';
import { FlowInputFieldAssignment, FlowOutputFieldAssignment } from '../../types/metadata.js';
import { ApexLeftHand } from '../../result-builder/section/apex-left-hand.js';
import { ApexRightHand } from '../../result-builder/section/apex-right-hand.js';
import { getFlowElementReferenceOrValue } from './reference-or-value-translator.js';

export function translateAssignments4Create(fifas: FlowInputFieldAssignment[]): string {
  const results: string[] = [];
  for (const a of fifas) {
    const val: string = getFlowElementReferenceOrValue(a.value[0], false).v;
    results.push(a.field + ' = ' + val);
  }

  if (results.length === 1) {
    return results[0];
  }

  const result: string = NL + results.join(',' + NL) + NL;
  return result;
}

export function translateAssignments4Update(fifas: FlowInputFieldAssignment[], ref: string): ApexAssignment[] {
  const results = new Array<ApexAssignment>();
  for (const a of fifas) {
    let leftHand: ApexLeftHand;
    if (ref === 'Trigger.new[0]') {
      leftHand = new ApexLeftHand(`((${knowledge.sObjectType!})${ref}).${a.field}`, []);
    } else {
      const apexVariableLeftHand = knowledge.builder.getMainClass().getVariable(ref);
      leftHand = new ApexLeftHand(`${ref}.${a.field}`, [apexVariableLeftHand]);
    }

    const referenceOrValue = getFlowElementReferenceOrValue(a.value[0], false);
    const val: string = referenceOrValue.v;
    let rightHand: ApexRightHand;
    if (referenceOrValue.t === 'elementReference') {
      // FIXME: Ugly workaround: A similar approach would need to be taken for all the other
      // cases where we use getFlowElementReferenceOrValue :-(
      try {
        const apexVariableRightHand = knowledge.builder.getMainClass().getVariable(val);
        rightHand = new ApexRightHand(val, [apexVariableRightHand]);
      } catch {
        rightHand = new ApexRightHand(val, []);
      }
    } else {
      rightHand = new ApexRightHand(val, []);
    }

    const assignment = new ApexAssignment(leftHand, rightHand);
    results.push(assignment);
  }

  return results;
}

export function translateAssignments4LookupRef(fields: string[], ref: string, ref2?: string): ApexAssignment[] {
  const results = new Array<ApexAssignment>();
  const apexVariable = knowledge.builder.getMainClass().getVariable(ref);
  for (const field of fields) {
    let assignment: ApexAssignment;
    const leftHand = new ApexLeftHand(`${ref}.${field}`, [apexVariable]);
    if (ref2) {
      const variableName = extractObjectOfExpression(ref2);
      const apexVariable2 = knowledge.builder.getMainClass().getVariable(variableName);
      // const apexVariable2 = new ApexVariable(extractObjectOfExpression(ref2));
      let rightHand: ApexRightHand;
      // eslint-disable-next-line unicorn/prefer-ternary
      if (apexVariable2) {
        rightHand = new ApexRightHand(`${ref2}.${field}`, [apexVariable2]);
      } else {
        rightHand = new ApexRightHand(`${ref2}.${field}`, []);
      }

      assignment = new ApexAssignment(leftHand, rightHand);
    } else {
      assignment = new ApexAssignment(leftHand, 'null');
    }

    results.push(assignment);
  }

  return results;
}

export function translateAssignments4LookupAss(
  ass: FlowOutputFieldAssignment[],
  ref: string,
  nullify: boolean
): ApexAssignment[] {
  const results = new Array<ApexAssignment>();
  for (const a of ass) {
    let assignment: ApexAssignment;
    const leftHand: string = a.assignToReference[0];
    const leftHandVariableName = leftHand.split('.')[0];
    const apexVariableLeftHand = knowledge.builder.getMainClass().getVariable(leftHandVariableName);
    const apexLeftHand = new ApexLeftHand(leftHand, [apexVariableLeftHand]);
    if (nullify) {
      assignment = new ApexAssignment(apexLeftHand, 'null');
    } else {
      const rightHand: string = a.field[0];
      const variableName = extractObjectOfExpression(ref);
      const apexVariableRef = knowledge.builder.getMainClass().getVariable(variableName);
      const apexRightHand = new ApexRightHand(`${ref}.${rightHand}`, [apexVariableRef]);
      assignment = new ApexAssignment(apexLeftHand, apexRightHand);
    }

    results.push(assignment);
  }

  return results;
}

function extractObjectOfExpression(s: string): string {
  // TODO: Doesn't look like it would always work :-/ E.g. what about periods?
  return s.split('[')[0];
}
