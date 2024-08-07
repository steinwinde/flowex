import { FlowElementReferenceOrValue } from '../../types/metadata.js';
import { MyFlowElementReferenceOrValue } from '../../types/metadata-simple.js';
import { esc } from '../../utils.js';
import { ApexReference } from '../../result-builder/section/apex-reference.js';

export function getFlowElementReferenceOrValue(
  val: FlowElementReferenceOrValue,
  whereContext: boolean
): MyFlowElementReferenceOrValue {
  const prefix: string = whereContext ? ':' : '';
  // if formula, the choice of the data type in the UI is just to limit the choice of formulas; the entry
  // will be elementReference whatever data type is chosen
  if (val.elementReference) {
    const apexReference = new ApexReference().set(val.elementReference[0]);
    // TODO: This should not be built here, but inside the ApexSection that uses it
    const variable: string = apexReference.build();
    // TODO: variable can be "null", for instance; this must be translated to a valid name in Apex
    // TODO: This can be a variable, but it can also be an expression like "[SELECT Id FROM Organization]",
    // which is not something all the code that called this method is prepared to handle
    return { r: apexReference, t: 'elementReference', v: prefix + variable };
  }

  if (val.stringValue) {
    // ok
    return { t: 'stringValue', v: "'" + esc(val.stringValue[0]) + "'" };
  }

  // unsupported for now
  if (val.apexValue) {
    return { t: 'apexValue', v: val.apexValue[0] };
  }

  if (val.booleanValue) {
    return { t: 'booleanValue', v: String(val.booleanValue[0]) };
  }

  if (val.dateValue) {
    // ok
    const sar: string[] = val.dateValue[0].split('-');
    const year = Number(sar[0]);
    const month = Number(sar[1]);
    const day = Number(sar[2]);
    const s = prefix + `Date.newInstance(${year}, ${month}, ${day})`;
    return { t: 'dateValue', v: s };
  }

  if (val.dateTimeValue) {
    // ok
    const sar: string[] = val.dateTimeValue[0].split('T');
    const datePart: string[] = sar[0].split('-');
    const year = Number(datePart[0]);
    const month = Number(datePart[1]);
    const day = Number(datePart[2]);
    const timePart: string[] = sar[1].split(':');
    const hour = Number(timePart[0]);
    const minute = Number(timePart[1]);
    // couldn't enter this in the UI, i.e. always 0
    const second = Number(0);
    const s = prefix + `DateTime.newInstance(${year}, ${month}, ${day}, ${hour}, ${minute}, ${second})`;
    return { t: 'dateTimeValue', v: s };
  }

  if (val.numberValue) {
    return { t: 'numberValue', v: String(val.numberValue[0]) };
  }

  if (val.sobjectValue) {
    return { t: 'sobjectValue', v: val.sobjectValue[0] };
  }

  throw new Error('Unknown variable or literal.');
}
