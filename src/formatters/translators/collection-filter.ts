import { ApexComment } from '../../result-builder/section/apex-comment.js';
import { ApexFor } from '../../result-builder/section/apex-for.js';
import { ApexIfCondition, apexIfConditionFromString } from '../../result-builder/section/apex-if-condition.js';
import { ApexIf } from '../../result-builder/section/apex-if.js';
import { ApexSectionLiteral } from '../../result-builder/section/apex-section-literal.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { ApexVariable } from '../../result-builder/apex-variable.js';
import {FlowCollectionProcessor} from '../../types/metadata.js';
import { Variable } from '../../types/variable.js';

export function getFiltered(flowElem: FlowCollectionProcessor, variableInfo: Variable): ApexFor {
    const ref: string = flowElem.collectionReference[0];
    const name: string = flowElem.name[0];
    const v: string = flowElem.assignNextValueToReference[0];

    const apexFor = new ApexFor().item(variableInfo.type).itemInstance(v).items(ref);

    const apexVariableName = new ApexVariable(name);
    const apexVariableV = new ApexVariable(v);
    const apexIfBody = new ApexSectionLiteral(`${name}.add(${v});`).registerVariables([apexVariableName, apexVariableV]);

    if (flowElem.conditionLogic[0] === 'formula_evaluates_to_true') {
        const formula: string = flowElem.formula[0];
        const apexSection = new ApexSection();
        const apexComment = new ApexComment('Add this formula to condition: ' + formula);
        apexSection.addSection(apexComment);
        const apexIfCondition = apexIfConditionFromString('true', new Array<ApexVariable>());
        const apexIf = new ApexIf().if(apexIfCondition, apexIfBody);
        apexSection.addSection(apexIf);
        return apexFor.set(apexSection);
    }

    const apexIfCondition = new ApexIfCondition().setFlowCondition(flowElem.conditionLogic[0], [flowElem.conditions![0]], false);
    const apexIf = new ApexIf().if(apexIfCondition, apexIfBody);
    apexFor.set(apexIf);
    return apexFor;
}
