import { ApexAssignment } from '../../result-builder/section/apex-assignment.js';
import { ApexSectionLiteral } from '../../result-builder/section/apex-section-literal.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { ApexVariable, VAR_RECORD } from '../../result-builder/apex-variable.js';
import {FlowRecordCreate} from '../../types/metadata.js';
import {translateAssignments4Create} from '../translators/assignment-translator.js';
import { ApexRightHand } from '../../result-builder/section/apex-right-hand.js';
import { ApexLeftHand } from '../../result-builder/section/apex-left-hand.js';

export function getRecordCreates(flowElem: FlowRecordCreate): ApexSection | undefined {
    // 4 possible choices:
    // 2 options ("How Many Records to Create"), 2 options ("How to Set the Record Fields")
    // (A) "One" vs (B) "Multiple"
    // and
    // (x) "Use all values from a record" vs (y) "Use separate resources, and literal values"
    // and
    // (m) "Manually assign variables" with "Store (e.g. Account) ID in Variable"

    // Ax: expects a variable with a record without ID => has single-record inputReference, no object
    // Ay: asks for an object and the values to be set on it => has object, no inputReference
    // Aym: same like Ay, but result ID is stored in something like My_ID_Var or anAccount.Id
    // Bx: expects a variable with a collection of records, all without ID => has multi-record inputReference, no object

    // In case of Ay there is a check box "Manually assign variables", which makes a field appear "Store Account ID in Variable".
    // I assume that in this case of "assignRecordIdToReference", the result of the create operation does not
    // need to be a global variable.

    const assignRecordIdToReference = flowElem.assignRecordIdToReference ? flowElem.assignRecordIdToReference[0] : undefined;

    let inputReference: string | undefined = flowElem.inputReference ? flowElem.inputReference[0] : undefined;
    if (inputReference) {
        // case Ax and Bx: pre-existing variable expected
        // TODO: SuperDecisionAllCreate is an absurd test case that inserts the incoming $Record; in order to make
        // this test case work temporarily, I do this (after correction of test case to be deleted!):
        if (inputReference === '$Record') {
            inputReference = VAR_RECORD;
        }

        const apexSectionLiteral = new ApexSectionLiteral(`insert ${inputReference};`);
        if(inputReference !== VAR_RECORD) {
            const apexVariable = knowledge.builder.getMainClass().getVariable(inputReference);
            apexSectionLiteral.registerVariable(apexVariable);
        }

        return apexSectionLiteral;
        // return `insert ${inputReference};`;
    }

    if (!flowElem.object) {
        // faulty flow
        return undefined;
    }

    // case Ay
    const obj: string = flowElem.object[0];
    const storeOutputAutomatically = flowElem.storeOutputAutomatically && flowElem.storeOutputAutomatically[0] === 'true';
    let localObj = '';
    if (!storeOutputAutomatically) {
        localObj = obj + ' ';
    }

    const vars = flowElem.inputAssignments ? translateAssignments4Create(flowElem.inputAssignments) : '';
    const variable: string = flowElem.name[0];
    // for an explanation see the dependent element processor for RecordCreate
    const recordCreate = flowElem as FlowRecordCreate;
    const hasNewVariable = recordCreate.storeOutputAutomatically && recordCreate.storeOutputAutomatically[0] === 'true';
    const apexVariables = new Array<ApexVariable>();
    if(hasNewVariable) {
        const apexVariable = knowledge.builder.getMainClass().getVariable(variable);
        apexVariables.push(apexVariable);
    }

    let additionalAssignment : ApexAssignment | undefined;
    if (assignRecordIdToReference) {
        const apexRightHand = new ApexRightHand(`${variable}.Id`, apexVariables);
        additionalAssignment = new ApexAssignment(assignRecordIdToReference, apexRightHand);
    }

    const apexLeftHand = new ApexLeftHand(`${localObj}${variable}`, apexVariables);
    const assignment = new ApexAssignment(apexLeftHand, `new ${obj}(${vars})`);
    const apexSectionLiteral = new ApexSectionLiteral(`insert ${variable};`);

//     const s = `${localObj}${variable} = new ${obj}(${vars});
// insert ${variable};${additionalAssignment}`;

    const apexSection = new ApexSection()
        .addSection(assignment)
        .addSection(apexSectionLiteral);

    if (additionalAssignment) {
        apexSection.addSection(additionalAssignment);
    }

    return apexSection;
}
