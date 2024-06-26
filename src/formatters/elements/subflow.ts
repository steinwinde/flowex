import {FlowSubflow, FlowSubflowInputAssignment} from '../../types/metadata.js';
import {MyFlowElementReferenceOrValue} from '../../types/metadata-simple.js';
import {getFlowElementReferenceOrValue} from '../translators/reference-or-value-translator.js';
import { ApexSectionLiteral } from '../../result-builder/section/apex-section-literal.js';
import { ApexVariable } from '../../result-builder/apex-variable.js';

export function getSubflow(flowElem: FlowSubflow): ApexSectionLiteral {
    // the type of the variable holding the flow reference is the (possibly several times appearing) name of the
    // referenced flow: <subflows><flowName>...</flowName></subflows>

    const subflowClass = knowledge.builder.getSubflow(flowElem.flowName[0]);
    const nameOfClassRepresentingSubflow = subflowClass.getName();

    let typeNameExpr = '';
    // The name of the variable referencing the flow is found in <subflows><name>...</name></subflows> and necessarily unique.
    const name = flowElem.name[0];

    // in case of storeOutputAutomatically, the flow is held by a local variable instead of a class field
    const storeOutputAutomatically = flowElem.storeOutputAutomatically && flowElem.storeOutputAutomatically[0] === 'true';
    if(storeOutputAutomatically) {
        typeNameExpr = nameOfClassRepresentingSubflow + ' ';
    } else {
        knowledge.builder.getMainClass().registerVariable(name).registerType(nameOfClassRepresentingSubflow);
    }

    const inputFields : Map<string, (null | string)> = new Map();

    // The subflow might be called from several places. We need to add all variables to the
    // subflow constructor call, but we default them to null.
    // for (const e of knowledge.programmer.getVariablesOfSeparateClass(nameOfClassRepresentingSubflow, false)) {
    for(const variable of subflowClass.getVariables().filter(v => v.isConstructorVariable())) {
        const variableName = variable.getName();
        inputFields.set(variableName, null);
    }

    // Now we assign the values to the extend they are listed in this call.
    if (flowElem.inputAssignments) {
        for (const e of flowElem.inputAssignments) {
            if(skipSubflowInputAssignment(e)) {
                continue;
            }

            const rightHand: MyFlowElementReferenceOrValue = getFlowElementReferenceOrValue(e.value[0], false);
            inputFields.set(e.name[0], rightHand.v);
            // already done during linear parsing:
            // knowledge.programmer.addVariableToSeparateClass(nameOfClassRepresentingSubflow, rightHand.v, rightHand.t, false);
        }
    }

    // TODO: we should use the camelized version of the variable that got registered, instead of camelizing here
    // const outputFields : Map<string, (string | null)> = new Map();
    // for (const e of knowledge.programmer.getVariablesOfSeparateClass(nameOfClassRepresentingSubflow, true))  outputFields.set(e, null);
    let remainder = '';
    if (flowElem.outputAssignments) {
        for (const e of flowElem.outputAssignments) {
            // e.assignToReference[0] is the name of the variable the result of the subflow is assigned to
            // e.name[0] is the name of the output field of the subflow
            // both are guaranteed to be unique in the flow
            const apexVariable = subflowClass.getVariable(e.name[0]);
            const varName = apexVariable.getName();

            remainder += global.NL + `${e.assignToReference[0]} = ${name}.${varName};`;
        }
    }

    const params = [...inputFields.values()].map(e => (e ?? 'null')).join(', ');
    
    const body = `${typeNameExpr}${name} = new ${nameOfClassRepresentingSubflow}(${params});${remainder}`;
    const apexSectionLiteral = new ApexSectionLiteral(body).registerVariable(new ApexVariable(name));
    return apexSectionLiteral;
}

export function skipSubflowInputAssignment(flowSubflowInputAssignment: FlowSubflowInputAssignment) : boolean {
    // an input assignment can have the "Include" toggle for a variable set to true in the UI, 
    // but the value of the variable is left empty; this doesn't make sense, but can be configured in the flow; 
    // we ignore such variables, because - having no access to the subflow - we have no way to know the type of the variable;
    // we could assign to "Object", but the flow author had apparently no intention to use the variable
    return !flowSubflowInputAssignment.value;
}