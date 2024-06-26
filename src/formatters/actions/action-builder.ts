import {FlowActionCall, FlowActionCallInputParameter} from '../../types/metadata.js';
import {Parameter} from '../../types/parameter.js';
import {getFlowElementReferenceOrValue} from '../translators/reference-or-value-translator.js';
import EmailAlert from './email-alert.js';
import EmailSimple from './email-simple.js';
import QuickAction from './quick-action.js';

export interface Action {
    body: string;
    methodParameters: Parameter[];
}

export default function getAction(flowElem: FlowActionCall) : Action {
    const name: string = flowElem.name[0];
    const actionName: string = flowElem.actionName[0];
    const inputParams: Map<string, string> = mapInputParameters(flowElem.inputParameters);
    switch (flowElem.actionType[0]) {
    case 'emailAlert': {
        // flow action "Email Alert"
        return new EmailAlert(name, actionName, inputParams);
    }

    case 'emailSimple': {
        return new EmailSimple(actionName, inputParams);
        break;
    }

    case 'quickAction': {
        return new QuickAction(actionName, inputParams);
        break;
    }

    default: {
        return new QuickAction(actionName, inputParams);
    }
    }
}

function mapInputParameters(actionCalls: FlowActionCallInputParameter[]): Map<string, string> {
    const m: Map<string, string> = new Map<string, string>();
    for (const ac of actionCalls) {
        const ref = getFlowElementReferenceOrValue(ac.value[0], false).v;
        m.set(ac.name[0], ref);
    }

    return m;
}
