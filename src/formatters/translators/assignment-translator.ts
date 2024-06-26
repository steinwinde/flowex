import { ApexAssignment } from '../../result-builder/section/apex-assignment.js';
import { ApexVariable } from '../../result-builder/apex-variable.js';
import {FlowInputFieldAssignment, FlowOutputFieldAssignment} from '../../types/metadata.js';
import {getFlowElementReferenceOrValue} from './reference-or-value-translator.js';
import { ApexLeftHand } from '../../result-builder/section/apex-left-hand.js';
import { ApexRightHand } from '../../result-builder/section/apex-right-hand.js';

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

export function translateAssignments4Update(fifas: FlowInputFieldAssignment[], ref: string): Array<ApexAssignment> {
    const results = new Array<ApexAssignment>();
    for (const a of fifas) {
        const val: string = getFlowElementReferenceOrValue(a.value[0], false).v;
        // const body = `${ref}.${a.field} = ${val};`;
        const apexVariables = new Array<ApexVariable>();
        apexVariables.push(new ApexVariable(ref), new ApexVariable(val));
        const leftHand = new ApexLeftHand(`${ref}.${a.field}`, [new ApexVariable(ref)]);
        const rightHand = new ApexRightHand(val, [new ApexVariable(val)]);
        const assignment = new ApexAssignment(leftHand, rightHand);
        results.push(assignment);
    }

    return results;
}

export function translateAssignments4LookupRef(fields: string[], ref: string, ref2?: string): Array<ApexAssignment> {
    const results = new Array<ApexAssignment>();
    const apexVariable = new ApexVariable(ref);
    for (const field of fields) {
        let assignment: ApexAssignment;
        const leftHand = new ApexLeftHand(`${ref}.${field}`, [apexVariable]);
        if (ref2) {
            const apexVariable2 = new ApexVariable(extractObjectOfExpression(ref2));
            const rightHand = new ApexRightHand(`${ref2}.${field}`, [apexVariable2]);
            assignment = new ApexAssignment(leftHand, rightHand);
        } else {
            assignment = new ApexAssignment(leftHand, 'null');
        }

        results.push(assignment);
    }

    return results;
}

export function translateAssignments4LookupAss(ass: FlowOutputFieldAssignment[], ref: string, nullify: boolean): Array<ApexAssignment> {
    const results = new Array<ApexAssignment>();
    for (const a of ass) {
        let assignment: ApexAssignment;
        const leftHand: string = a.assignToReference[0];
        const apexVariableLeftHand = new ApexVariable(leftHand);
        const apexLeftHand = new ApexLeftHand(leftHand, [apexVariableLeftHand]);
        if (nullify) {
            assignment = new ApexAssignment(apexLeftHand, 'null');
            // results.push(`${leftHand} = null;`);
        } else {
            const rightHand: string = a.field[0];
            const apexVariableRef = new ApexVariable(extractObjectOfExpression(ref));
            const apexRightHand = new ApexRightHand(`${ref}.${rightHand}`, [apexVariableRef]);
            assignment = new ApexAssignment(apexLeftHand, apexRightHand);
            // results.push(`${leftHand} = ${ref}.${rightHand};`);
        }

        results.push(assignment);
    }

    return results;
}

function extractObjectOfExpression(s : string) : string {
    // TODO: Doesn't look like it would always work :-/ E.g. what about periods?
   return s.split('[')[0];
}