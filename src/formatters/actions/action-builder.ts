import { FlowActionCall, FlowActionCallInputParameter } from '../../types/metadata.js';
import { getFlowElementReferenceOrValue } from '../translators/reference-or-value-translator.js';
import { BasicAction } from './basic-action.js';
import EmailAlert from './email-alert.js';
import EmailSimple from './email-simple.js';
import UnsupportedAction from './unsupported.js';

export default function getAction(flowElem: FlowActionCall): BasicAction {
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
    }

    case 'quickAction': {
      return new UnsupportedAction(actionName);
    }

    default: {
      return new UnsupportedAction(actionName);
    }
  }
}

function mapInputParameters(actionCalls: FlowActionCallInputParameter[]): Map<string, string> {
  const m: Map<string, string> = new Map<string, string>();
  for (const ac of actionCalls) {
    const ref = ac.value ? getFlowElementReferenceOrValue(ac.value[0], false).v : 'null';
    m.set(ac.name[0], ref);
  }

  return m;
}
