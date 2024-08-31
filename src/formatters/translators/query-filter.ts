import { ApexVariable } from '../../result-builder/apex-variable.js';
import { SoqlQuery, soql } from '../../result-builder/soql/soql-query.js';
import { FlowRecordFilter } from '../../types/metadata.js';
import { SoqlWhere } from '../../result-builder/soql/soql-where.js';
import { getFlowElementReferenceOrValue } from './reference-or-value-translator.js';

// used also by condition-builder
export function concatFilters(wheres: string[], filterLogic: string): string {
  if (filterLogic.includes('1')) {
    // filterLogic e.g. '(1 AND 2) OR 3'
    // can contain AND, OR, NOT
    let result: string = filterLogic.replaceAll(/(\d)/g, '_W$&W_');
    for (const [i, where] of wheres.entries()) {
      const s: string = Number(1 + i).toString();
      const regexp = new RegExp('_W' + s + 'W_', 'g');
      result = result.replace(regexp, where);
    }

    return result;
  }

  // filterLogic 'and' or 'or' (or something else?!)
  const u: string = filterLogic.toUpperCase();
  return wheres.join(` ${u} `);
}

export function extractFilterVariables(filters: FlowRecordFilter[] | undefined): ApexVariable[] {
  const variables = new Array<ApexVariable>();
  if (!filters) {
    return variables;
  }

  const variableNames = new Array<string>();
  const mainClass = knowledge.builder.getMainClass();
  for (const filter of filters) {
    // TODO: This is a hack to make it work for now
    if (filter.value[0].elementReference && !filter.value[0].elementReference[0].startsWith('$')) {
      const val: string = getFlowElementReferenceOrValue(filter.value[0], true).v;
      let variableName = val.slice(1);
      const index = variableName.indexOf('.');
      if (index > -1) {
        variableName = variableName.slice(0, index);
      }

      if (!variableNames.includes(variableName)) {
        variableNames.push(variableName);
        const variable = mainClass.getVariable(variableName);
        variables.push(variable);
      }
    }
  }

  return variables;
}

export function getSoqlFromFilter(
  fields: string[],
  obj: string,
  filters: FlowRecordFilter[],
  filterLogic: string,
  orderByField?: string[],
  sortOrder?: Array<'Asc' | 'Desc'>,
  limit?: number
): SoqlQuery {
  let soqlWhereVariables = new Array<ApexVariable>();
  const query = soql().select(fields).from(obj);

  if (filters) {
    soqlWhereVariables = extractFilterVariables(filters);
    const soqlWhere = new SoqlWhere(filters, filterLogic, soqlWhereVariables);
    query.where(soqlWhere);
  }

  if (orderByField) {
    const isOrderByDesc = sortOrder && sortOrder.length > 0 && sortOrder[0] === 'Desc';
    query.orderBy(orderByField, isOrderByDesc);
  }

  // Salesforce also specifies a "limit" field on FlowRecordLookup, but I didn't see it in the XML, nor
  // in the metadata API; but see here:
  // https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_visual_workflow.htm#FlowRecordLookup
  if (limit && limit > 0) {
    query.limit(limit);
  }

  return query;
}
