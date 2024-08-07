import { FlowRecordDelete } from '../../types/metadata.js';
import { soql } from '../../result-builder/soql/soql-query.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { ApexVariable } from '../../result-builder/apex-variable.js';
import { ApexSectionLiteral } from '../../result-builder/section/apex-section-literal.js';
import { SoqlWhere } from '../../result-builder/soql/soql-where.js';
import { extractFilterVariables } from '../translators/query-filter.js';

export function getRecordDeletes(flowElem: FlowRecordDelete): ApexSection {
  // 2 options:

  // a) "Use the IDs stored in a record variable or record collection variable", only inputReference,
  //    e.g. "Get_Children" from the GetRecords; this is basically two choices: one for single
  //    record, the other for a list of records
  if (flowElem.inputReference) {
    const variableName = flowElem.inputReference[0];
    const apexVariable = knowledge.builder.getMainClass().getVariable(variableName);
    return new ApexSectionLiteral(`delete ${flowElem.inputReference[0]};`).registerVariable(apexVariable);
    // return `delete ${flowElem.inputReference[0]};`;
  }

  // b) "Specify conditions" => Object, Filters, i.e. filterLogic, filters, object

  const obj: string = flowElem.object[0];
  let where = '';
  let variables = new Array<ApexVariable>();
  if (flowElem.filters) {
    variables = extractFilterVariables(flowElem.filters);
    const soqlWhere = new SoqlWhere(flowElem.filters, flowElem.filterLogic, variables);

    where = soqlWhere.build();
  }

  const soqlStatement = soql().select('Id').from(obj).where(where);
  return new ApexSectionLiteral('delete %s;', [soqlStatement]);
}
