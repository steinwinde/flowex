import {FlowAssignment, FlowAssignmentItem, FlowElementReferenceOrValue} from '../../types/metadata.js';
import {MyFlowElementReferenceOrValue} from '../../types/metadata-simple.js';
import {getFlowElementReferenceOrValue} from '../translators/reference-or-value-translator.js';
import { Variable } from '../../types/variable.js';
import { ApexFor, apexFor } from '../../result-builder/section/apex-for.js';
import { apexIf } from '../../result-builder/section/apex-if.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { ApexVariable, VAR_CURRENT_STAGE, VAR_RECORD, apexVariableFromResourceName } from '../../result-builder/apex-variable.js';
import { ApexAssignment } from '../../result-builder/section/apex-assignment.js';
import { ApexSectionLiteral } from '../../result-builder/section/apex-section-literal.js';
import { ApexIfCondition, apexIfConditionFromString } from '../../result-builder/section/apex-if-condition.js';
import { ApexLeftHand } from '../../result-builder/section/apex-left-hand.js';
import { ApexRightHand } from '../../result-builder/section/apex-right-hand.js';

export function getAssignments(flowElem: FlowAssignment, var2type: Map<string, Variable>): ApexSection {
    const apexSection = new ApexSection();
    for (const ai of flowElem.assignmentItems) {
        const expr = translateAssignmentItem(ai, var2type);
        apexSection.addSection(expr);
    }

    return apexSection;
}

// see FlowAssignmentOperators
// see https://help.salesforce.com/s/articleView?id=sf.flow_ref_operators_assignment.htm&type=5
// UI has: Variable - Operator - Value
// XML has: assignToReference - operator - value/stringValue or elementReference or other value
// definition: string - FlowAssignmentOperator - FlowElementReferenceOrValue
// i.e. left hand is never a literal, right hand has a type and is potentially elementReference (which is a string like the left hand)

// We can't always know the left-hand operand type (e.g. in case of fields on objects). In such cases the type must
// be deduced from the right-hand.

// "Equals Count" in the UI is "AssignCount", like "Equals" is "Assign".

// TODO: I have not understood what "selected picklist" means. Picklists are more important in Screen flows. Therefore
// picklists and multi-picklists are not fully supported for now.

function translateAssignmentItem(ai: FlowAssignmentItem, var2type: Map<string, Variable>): ApexSection {
    const leftHand: MyFlowElementReferenceOrValue = getLeftHand(ai.assignToReference[0], var2type);
    // @see https://trailhead.salesforce.com/trailblazer-community/feed/0D54S00000G4VUCSA3
    // "If you leave a field or resource value blank, the value is null at run time. To treat a text value as an empty string instead of null, set it to {!$GlobalConstant.EmptyString}"
    let rightHand = {t: 'stringValue', v: 'null'};
    if (ai.value) {
        rightHand = getFlowElementReferenceOrValue(ai.value[0], false);
    }

    // Consider the possibility of a reference to a Flow Stage
    if(rightHand.t === 'elementReference') {
        const stageIndex = knowledge.builder.getMainClass().getStage(rightHand.v);
        if(stageIndex !== -1) {
            // this will represent a number value
            rightHand.v = String(stageIndex);
        }
    }

    // contrary to the SF documentation, we first look at the operator, then type, because the operator is
    // always known, the type not - and in the latter case we have an operator specific default
    const op: string = ai.operator[0];
    switch (op) {
        case 'Assign': { // "Equals"
            // TODO: not sure, if this is correct for picklist/multi-picklist, but for all others it is
            // TODO: not sure, if the right hand is a variable
            const apexVariable = apexVariableFromResourceName(leftHand.v);
            const apexLeftHand = new ApexLeftHand(leftHand.v, [apexVariable]);
            const apexAssignment = new ApexAssignment(apexLeftHand, rightHand.v);
            return apexAssignment;
        }

        case 'Add': {
            // confirmed working with Text List (Test: "TextAssignments")
            return getAdd(leftHand, rightHand, var2type);
        }

        case 'Subtract': {
            return getSubtract(leftHand, rightHand);
        }

        case 'AddItem': {
            // "AddItem" is only used by Multipicklists
            const apexVariable = apexVariableFromResourceName(leftHand.v);
            const body = `${leftHand.v}.add(${rightHand.v});`;
            return new ApexSectionLiteral(body).registerVariable(apexVariable);
            // return `${leftHand.v}.add(${rightHand.v});`;
        }

        case 'RemoveFirst': {
            // confirmed working with Text List (Test: "TextAssignments")
            return getRemoveFirst(leftHand, rightHand);
        }

        case 'RemoveBeforeFirst': {
            // confirmed working with Text List (Test: "TextAssignments")
            return getRemoveBeforeFirst(leftHand, rightHand);
        }

        case 'RemoveAfterFirst': {
            // confirmed working with Text List (Test: "TextAssignments")
            return getRemoveAfterFirst(leftHand, rightHand);
        }

        case 'RemoveAll': {
            // confirmed working with Text List (Test: "TextAssignments")
            return getRemoveAll(leftHand, rightHand);
        }

        case 'AddAtStart': {
            // confirmed working with Text List (Test: "TextAssignments")
            // TODO: not sure, if right hand is variable
            const apexVariable = apexVariableFromResourceName(leftHand.v);
            const body = `${leftHand.v}.add(0, ${rightHand.v});`;
            return new ApexSectionLiteral(body).registerVariable(apexVariable);
            // return `${leftHand.v}.add(0, ${rightHand.v});`;
        }

        case 'RemoveUncommon': {
            const apexVariableRightHand = apexVariableFromResourceName(rightHand.v);
            const apexVariableLeftHand = apexVariableFromResourceName(leftHand.v);
            const apexVariableI = new ApexVariable('i').registerType('Integer');

            
            // confirmed working with Text List (Test: "TextAssignments")
            const condition = `!${rightHand.v}.contains(${leftHand.v}.get(i))`;
            const apexIfCondition = apexIfConditionFromString(condition, [apexVariableRightHand, apexVariableLeftHand, apexVariableI]);
            const ifBody = `${leftHand.v}.remove(i);`;
            const apexIfBody = new ApexSectionLiteral(ifBody).registerVariables([apexVariableLeftHand, apexVariableI]);;
            const forBody = apexIf().if(apexIfCondition, apexIfBody);
            const forStatement = apexFor().i(`${leftHand.v}.size()-1`).gtEq(0).decrement().set(forBody);
            return forStatement;
        }

        case 'AssignCount': {
            const apexVariableLeftHand = apexVariableFromResourceName(leftHand.v);
            const apexLeftHand = new ApexLeftHand(leftHand.v, [apexVariableLeftHand]);
            const apexVariableRightHand = apexVariableFromResourceName(rightHand.v);
            const apexRightHand = new ApexRightHand(`${rightHand.v}.size()`, [apexVariableRightHand]);
            const apexAssignment = new ApexAssignment(apexLeftHand, apexRightHand);
            return apexAssignment;
            // return `${leftHand.v} = ${rightHand.v}.size();`;
        }

        case 'RemovePosition': {
            const apexVariableLeftHand = apexVariableFromResourceName(leftHand.v);
            return new ApexSectionLiteral(`${leftHand.v}.remove(${Number.parseInt(rightHand.v, 10)});`)
                .registerVariable(apexVariableLeftHand);
            // confirmed working with Text List (Test: "TextAssignments")
            // return `${leftHand.v}.remove(${Number.parseInt(rightHand.v, 10)});`;
        }

        default: {
            throw new Error('Unknown operator: ' + op);
        }
    }
}

function getAdd(leftHand: MyFlowElementReferenceOrValue, rightHand: MyFlowElementReferenceOrValue, var2type: Map<string, Variable>) : ApexSection {
    const apexVariableLeftHand = apexVariableFromResourceName(leftHand.v);
    const apexVariables = [apexVariableLeftHand];
    if (leftHand.t.startsWith('List<') || leftHand.t === 'Picklist' || leftHand.t === 'Stage') {
        if(rightHand.t === 'elementReference'
            // Because Stage variables are translated to their index, we don't need to track them
            && leftHand.v !== 'ActiveStages'
        ) {
            const apexVariableRightHand = apexVariableFromResourceName(rightHand.v);
            apexVariables.push(apexVariableRightHand);
        }
        
        let body = '';
        // TODO: not sure, if this makes sense for stages and picklists
        if (var2type.get(rightHand.v)?.isCollection) {
            body = `${leftHand.v}.addAll(${rightHand.v});`;
        }

        body = `${leftHand.v}.add(${rightHand.v});`;
        return new ApexSectionLiteral(body).registerVariables(apexVariables);
    }

    if (rightHand.t === 'Multipicklist') {
        // TODO: not sure how we can pick the last element
        const body = `${leftHand.v}[${leftHand.v}.length()] = ${leftHand.v}[${leftHand.v}.length()] + "${rightHand.v}";`;
        return new ApexSectionLiteral(body).registerVariable(apexVariableLeftHand);
    }

    if (leftHand.t === 'Date') {
        const i = Number.parseInt(rightHand.v, 10);
        // return `${leftHand.v}.addDays(${i});`;
        return new ApexSectionLiteral(`${leftHand.v}.addDays(${i});`).registerVariable(apexVariableLeftHand);
    }

    if(rightHand.t === 'elementReference') {
        const apexVariableRightHand = apexVariableFromResourceName(rightHand.v);
        apexVariables.push(apexVariableRightHand);
    }
    
    const body = `${leftHand.v} += ${rightHand.v};`;
    return new ApexSectionLiteral(body).registerVariables(apexVariables);
}

function getSubtract(leftHand: MyFlowElementReferenceOrValue, rightHand: MyFlowElementReferenceOrValue) : ApexSection {
    const apexVariableLeftHand = apexVariableFromResourceName(leftHand.v);
    if (leftHand.t === 'Date') {
        const i = Number.parseInt(rightHand.v, 10);
        const apexSectionLiteral = new ApexSectionLiteral(`${leftHand.v}.addDays(-${i});`).registerVariable(apexVariableLeftHand);
        return apexSectionLiteral;
        // return `${leftHand.v}.addDays(-${i});`;
    }

    // TODO: not sure, if right hand is literal
    // const apexVariableRightHand = apexVariableFromResourceName(rightHand.v);
    const apexSectionLiteral = new ApexSectionLiteral(`${leftHand.v} -= ${rightHand.v};`).registerVariable(apexVariableLeftHand);
    // return `${leftHand.v} -= ${rightHand.v};`;
    return apexSectionLiteral;
}

function getRemoveBeforeFirst(leftHand: MyFlowElementReferenceOrValue, rightHand: MyFlowElementReferenceOrValue) : ApexFor {
    // Collection only (picklist, multi-picklist, $Flow.CurrentRecord)
    const apexVariable = apexVariableFromResourceName(leftHand.v);
    // const bodyFor = `${leftHand.v}.remove(j);`;
    const bodyFor = new ApexSectionLiteral(`${leftHand.v}.remove(j);`).registerVariable(apexVariable);
    const forStatementInner = apexFor().j('i-1').gtEq('0').decrement().set(bodyFor);
    const condition = getCondition(leftHand, rightHand);
    const apexSectionLiteralBreak = new ApexSectionLiteral('break;');
    // const ifBody = forStatementInner.build() + global.NL + 'break;';
    const apexSection = new ApexSection().addSection(forStatementInner).addSection(apexSectionLiteralBreak);
    const ifStatement = apexIf().if(condition, apexSection);
    const forStatement = apexFor().i(0).lt(`${leftHand.v}.size()`).set(ifStatement);
    return forStatement;
}

function getRemoveFirst(leftHand: MyFlowElementReferenceOrValue, rightHand: MyFlowElementReferenceOrValue) : ApexFor {
    // Collection only (picklist, multi-picklist, $Flow.CurrentRecord)
    const condition = getCondition(leftHand, rightHand);
    const apexSectionLiteral = new ApexSectionLiteral(`${leftHand.v}.remove(i);`)
        .registerVariables([apexVariableFromResourceName(leftHand.v), new ApexVariable('i').registerType('Integer')]);
    const apexSectionLiteralBreak = new ApexSectionLiteral('break;');
    // const body = `${leftHand.v}.remove(i);` + global.NL + 'break;';
    const apexSection = new ApexSection().addSection(apexSectionLiteral).addSection(apexSectionLiteralBreak);
    const ifStatement = apexIf().if(condition, apexSection);
    const forStatement = apexFor().i(0).lt(`${leftHand.v}.size()`).set(ifStatement);
    return forStatement;
}

function getRemoveAfterFirst(leftHand: MyFlowElementReferenceOrValue, rightHand: MyFlowElementReferenceOrValue) : ApexFor {
    // Collection only (picklist, multi-picklist, $Flow.CurrentRecord)
    const condition = getCondition(leftHand, rightHand);
    const bodyInner = `${leftHand.v}.remove(j);`;
    const apexSectionLiteral = new ApexSectionLiteral(bodyInner).registerVariable(apexVariableFromResourceName(leftHand.v));
    const forStatementInner = apexFor().j(`${leftHand.v}.size()-1`).gt('i').decrement().set(apexSectionLiteral);
    const apexSectionLiteralBreak = new ApexSectionLiteral('break;');
    // const body = `${forStatementInner.build()}` + global.NL + 'break;';
    const apexSection = new ApexSection().addSection(forStatementInner).addSection(apexSectionLiteralBreak);
    const ifStatement = apexIf().if(condition, apexSection);
    const forStatement = apexFor().i(0).lt(`${leftHand.v}.size()`).set(ifStatement);
    return forStatement;
}

function getRemoveAll(leftHand: MyFlowElementReferenceOrValue, rightHand: MyFlowElementReferenceOrValue) : ApexSection {
    // Collection only (picklist, multi-picklist, $Flow.CurrentRecord)
    const condition = getCondition(leftHand, rightHand);
    const body = `${leftHand.v}.remove(i);`;
    const apexSectionLiteral = new ApexSectionLiteral(body);
    const ifStatement = apexIf().if(condition, apexSectionLiteral);
    const forStatement = apexFor().i(`${leftHand.v}.size()-1`).gtEq('0').decrement().set(ifStatement);
    return forStatement;
}

function getCondition(leftHand: MyFlowElementReferenceOrValue, rightHand: MyFlowElementReferenceOrValue) : ApexIfCondition {
    let body = `${leftHand.v}.get(i).equals(${rightHand.v})`;
    if (leftHand.t === 'List<Date>') {
        body = `${leftHand.v}.get(i).isSameDay(${rightHand.v})`;
    } else if (leftHand.t === 'List<Boolean>' || leftHand.t === 'List<Number>' || leftHand.t === 'List<Currency>') {
        body = `${leftHand.v}.get(i) == ${rightHand.v}`;
    }

    const apexVariableLeftHand = apexVariableFromResourceName(leftHand.v);
    const apexVariables = [apexVariableLeftHand];
    if(rightHand.t === 'elementReference') {
        const apexVariableRightHand = apexVariableFromResourceName(rightHand.v);
        apexVariables.push(apexVariableRightHand);
    }

    const condition = apexIfConditionFromString(body, apexVariables);
    return condition;
}

// the "types" returned here are those of the Salesforce help page, not API or any other types;
// however, I had to add a type "Date", because we need to correctly process assignments like "myDate Add 2" (which becomes "myDate.addDays(2)")
function getLeftHand(s: string, var2type: Map<string, Variable>) : MyFlowElementReferenceOrValue {
    if (s.startsWith('$Flow.')) {
        // see "Stage" on https://help.salesforce.com/s/articleView?id=sf.flow_ref_operators_assignment.htm&type=5
        // $Flow.CurrentRecord, $Flow.CurrentStage, $Flow.ActiveStages (all Text)
        // The following emulates "ActiveStages", which is not a known type outside of the flow, but kept in Apex
        // for clarity. When building an Apex-to-LWC converter, this has to be reconsidered.
        let t = 'List<String>';
        if (s.endsWith('CurrentRecord')) t = 'Record';
        else if (s.endsWith(VAR_CURRENT_STAGE)) t = 'String';
        s = s.split('.')[1];
        return {t, v: s};
    }

    if (s.startsWith('$Record.')) {
        return {t: 'Unknown', v: 'record.' + s.split('.')[1]};
    }

    if (s === '$Record') {
        return {t: 'Record', v: VAR_RECORD};
    }

    if (s.includes('.')) {
        // field (e.g. reference) on an object
        return {t: 'Unknown', v: s};
    }

    let t = 'Unknown';
    const indirectType = var2type.get(s);
    if (indirectType) {
        t = indirectType.getTypeComplete();
    }

    return {t, v: s};
}

function removeFieldFromReference(s: string) : string {
    if (s.includes('.')) {
        return s.split('.')[0];
    }

    return s;
}