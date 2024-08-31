import { FlowRecordDelete } from '../../types/metadata.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { ApexSectionLiteral } from '../../result-builder/section/apex-section-literal.js';
import { getSoqlFromFilter } from '../translators/query-filter.js';

export function getRecordDeletes(flowElem: FlowRecordDelete): ApexSection {
  // 2 options:

  // a) "Use the IDs stored in a record variable or record collection variable", only inputReference,
  //    e.g. "Get_Children" from the GetRecords; this is basically two choices: one for single
  //    record, the other for a list of records
  if (flowElem.inputReference) {
    const variableName = flowElem.inputReference[0];
    if (variableName === '$Record') {
      // not a real use case, but we handle it
      return new ApexSectionLiteral('delete Trigger.new[0];');
    }

    const apexVariable = knowledge.builder.getMainClass().getVariable(variableName);
    return new ApexSectionLiteral(`delete ${flowElem.inputReference[0]};`).registerVariable(apexVariable);
  }

  // b) "Specify conditions" => Object, Filters, i.e. filterLogic, filters, object

  const obj: string = flowElem.object[0];
  const fields = ['Id'];
  const query = getSoqlFromFilter(fields, obj, flowElem.filters, flowElem.filterLogic);

  return new ApexSectionLiteral('delete %s;', [query]);
}
