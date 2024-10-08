import { FlowDynamicChoiceSet, FlowRecordLookup } from '../../types/metadata.js';
import {
  translateAssignments4LookupAss,
  translateAssignments4LookupRef,
} from '../translators/assignment-translator.js';
import { SoqlQuery } from '../../result-builder/soql/soql-query.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { VAR_L, apexVariableFromResourceName } from '../../result-builder/apex-variable.js';
import { ApexAssignment } from '../../result-builder/section/apex-assignment.js';
import { apexIf } from '../../result-builder/section/apex-if.js';
import { apexIfConditionFromString } from '../../result-builder/section/apex-if-condition.js';
import { ApexSectionLiteral } from '../../result-builder/section/apex-section-literal.js';
import { ApexMethodCall } from '../../result-builder/section/apex-method-call.js';
import { METHOD_PREFIXES } from '../../result-builder/section/apex-method.js';
import { ApexLeftHand } from '../../result-builder/section/apex-left-hand.js';
import { ApexRightHand } from '../../result-builder/section/apex-right-hand.js';
import { getSoqlFromFilter } from '../translators/query-filter.js';

// First choice: "How many records to store"
// - Only the first record
// - All records

// Second choice: "How to Store Record Data"
// - "Automatically store all fields" (default, no further choices)
// - "Choose fields and let Salesforce do the rest" ("Select Contact Fields to Store in Variable" - one just selects these fields)
// - "Choose fields and assign variables (advanced)"

// From above result the following combinations:

// 1 "Only the first record" - "Automatically store all fields"
// 2 "Only the first record" - "Choose fields and let Salesforce do the rest"
// 3 "Only the first record" - "Choose fields and assign variables (advanced)" - "Together in a record variable"
// 4 "Only the first record" - "Choose fields and assign variables (advanced)" - "In separate variables"

// 5 "All records" - "Automatically store all fields"
// 6 "All records" - "Choose fields and let Salesforce do the rest"
// 7 "All records" - "Choose fields and assign variables (advanced)"

export function getRecordLookups(flowElem: FlowRecordLookup): ApexSection {
  // always present
  const obj: string = flowElem.object[0];

  // TODO: Not sure what this means in case of "All records"
  // I assume this defaults to false
  const assignNull: boolean = flowElem.assignNullValuesIfNoRecordsFound[0] === 'true';

  const ref: string | undefined = flowElem.outputReference ? flowElem.outputReference[0] : undefined;

  const firstRecordOnly = getFirstRecordOnly(flowElem, ref);
  const soqlStatement = getSoqlStatement(flowElem, obj, firstRecordOnly);

  // const soqlWhereApexVariables = soqlWhereApexVariablesByName.map(e => knowledge.builder.getMainClass().getVariable(e.getName()));

  const name: string = flowElem.name[0];

  // const assignments: string | undefined = ref ? getAssignments(flowElem.outputAssignments, ref) : undefined;
  if (firstRecordOnly) {
    // we always need a separate method, because the query might return no elements
    if (flowElem.outputReference === undefined && flowElem.outputAssignments === undefined) {
      // option 1 & 2
      const apexMethod = knowledge.builder
        .getMainClass()
        .registerMethod(flowElem, METHOD_PREFIXES.METHOD_PREFIX_GET, obj)
        .registerReturnType(obj);
      // the class figured out the final name
      const methodName = apexMethod.getName();
      // TODO: Due to the null coalescing operator this got so short we don't need a separate method anymore
      const apexSection = new ApexSectionLiteral('return %s ?? null;', [soqlStatement]);
      apexMethod.registerBody(apexSection);
      const apexVariable = knowledge.builder.getMainClass().getVariable(name);
      const apexLeftHand = new ApexLeftHand(name, [apexVariable]);
      // TODO: Maybe nicer to have ApexSection as the second parameter as a possibility
      const apexAssignment = new ApexAssignment(apexLeftHand, `${methodName}()`);
      // return `${name} = ${methodName}();`;
      return apexAssignment;
    }

    if (flowElem.outputReference !== undefined) {
      // option 3
      const currentMethod = knowledge.builder.getMainClass().getLastMethod();
      const apexVariable = knowledge.builder
        .getMainClass()
        .registerVariable(VAR_L)
        .registerType(obj)
        .registerIsCollection()
        .registerLocal(currentMethod);

      let ass = translateAssignments4LookupRef(flowElem.queriedFields!, ref!, VAR_L + '[0]');
      const assignmentsSection = new ApexSection().addSections(ass);
      const apexMethod = knowledge.builder
        .getMainClass()
        .registerMethod(flowElem, METHOD_PREFIXES.METHOD_PREFIX_POPULATE, obj);
      const leftHand = new ApexLeftHand(`List<${obj}> ${VAR_L}`, [apexVariable]);
      const rightHand = new ApexRightHand().setSoqlQuery(soqlStatement);
      const apexAssignment = new ApexAssignment(leftHand, rightHand);
      const apexIfCondition = apexIfConditionFromString(VAR_L + '.size()!=0', [apexVariable]);
      const apexIfExpression = apexIf().if(apexIfCondition, assignmentsSection);

      const apexSection = new ApexSection().addSections([apexAssignment, apexIfExpression]);
      if (assignNull) {
        ass = translateAssignments4LookupRef(flowElem.queriedFields!, ref!);
        apexIfExpression.default(new ApexSection().addSections(ass));
      }

      apexMethod.registerBody(apexSection);
      return new ApexMethodCall(apexMethod);
    }

    if (flowElem.outputAssignments !== undefined) {
      const currentMethod = knowledge.builder.getMainClass().getLastMethod();
      const apexVariable = knowledge.builder
        .getMainClass()
        .registerVariable(VAR_L)
        .registerType(obj)
        .registerIsCollection()
        .registerLocal(currentMethod);

      let ass = translateAssignments4LookupAss(flowElem.outputAssignments, VAR_L + '[0]', false);
      const assignmentsSection = new ApexSection().addSections(ass);
      // option 4
      const apexMethod = knowledge.builder
        .getMainClass()
        .registerMethod(flowElem, METHOD_PREFIXES.METHOD_PREFIX_POPULATE, obj);

      const leftHand = new ApexLeftHand(`List<${obj}> ${VAR_L}`, [apexVariable]);
      const rightHand = new ApexRightHand().setSoqlQuery(soqlStatement);
      const apexAssignment = new ApexAssignment(leftHand, rightHand);
      const apexIfCondition = apexIfConditionFromString(VAR_L + '.size()!=0', [apexVariable]);
      const apexIfExpression = apexIf().if(apexIfCondition, assignmentsSection);

      const apexSection = new ApexSection().addSections([apexAssignment, apexIfExpression]);

      if (assignNull) {
        ass = translateAssignments4LookupAss(flowElem.outputAssignments, VAR_L + '[0]', true);
        apexIfExpression.default(new ApexSection().addSections(ass));
      }

      apexMethod.registerBody(apexSection);
      return new ApexMethodCall(apexMethod);
    } // firstRecordOnly
  }

  // "All Records"
  if (flowElem.outputReference === undefined) {
    const apexVariable = apexVariableFromResourceName(name);
    const leftHand = new ApexLeftHand(name, [apexVariable]);
    const rightHand = new ApexRightHand().setSoqlQuery(soqlStatement);
    const result = new ApexAssignment(leftHand, rightHand);
    // option 5 & 6, only difference to option 1 & 2: getFirstRecordOnly==false
    // return `${name} = ${soqlStatement};`;
    return result;
  }

  const apexVariable = apexVariableFromResourceName(flowElem.outputReference[0]);
  const leftHand = new ApexLeftHand(flowElem.outputReference[0], [apexVariable]);
  const rightHand = new ApexRightHand().setSoqlQuery(soqlStatement);
  const result = new ApexAssignment(leftHand, rightHand);
  // return `${flowElem.outputReference[0]} = ${soqlStatement};`;
  return result;
}

function getSoqlStatement(flowElem: FlowRecordLookup, obj: string, firstRecordOnly: boolean): SoqlQuery {
  // TODO: write a test case that tests fields required by other elements...
  const fields = getFields(flowElem, knowledge.objects2Fields);

  const query = getSoqlFromFilter(
    fields,
    obj,
    flowElem.filters,
    flowElem.filterLogic,
    flowElem.sortField,
    flowElem.sortOrder,
    firstRecordOnly ? 1 : undefined
  );
  return query;
}

function getFields(flowElem: FlowRecordLookup, objects2Fields: Map<string, string[]>): string[] {
  if (flowElem.queriedFields) {
    return flowElem.queriedFields;
  }

  if (flowElem.outputAssignments) {
    return flowElem.outputAssignments.map((e) => e.field[0]);
  }

  if (objects2Fields && objects2Fields.size > 0) {
    // console.log('Scouring objects2Fields for: ' + flowElem.object[0]);
    const s: string[] | undefined = objects2Fields.get(flowElem.object[0]);
    if (s) {
      return s;
    }
  }

  return ['Id'];
}

// "getFirstRecordOnly" is often not present at all - both for "Only the first" and for "all", see
// https://developer.salesforce.com/docs/atlas.en-us.232.0.api_meta.meta/api_meta/meta_visual_workflow.htm
// "When storeOutputAutomatically is false, what determines whether one or multiple records are stored is whether
// outputReference specifies a record variable or a record collection variable."
// Note also:
// - outputAssignments does only exist for single records, can't work for more than one.
// - storeOutputAutomatically exists for multi-record too.
function getFirstRecordOnly(flowElem: FlowRecordLookup, ref: string | undefined): boolean {
  if (flowElem.outputAssignments) {
    return true;
  }

  const storeOutput: boolean =
    Boolean(flowElem.storeOutputAutomatically) && flowElem.storeOutputAutomatically![0] === 'true';
  let f = false;
  // eslint-disable-next-line unicorn/prefer-ternary
  if (storeOutput) {
    f = Boolean(flowElem.getFirstRecordOnly) && flowElem.getFirstRecordOnly![0] === 'true';
  } else {
    f = !knowledge.builder.getMainClass().getVariable(ref!).isCollectionVariable();
  }

  return f;
}

export function getOrderByField(flowElem: FlowDynamicChoiceSet | FlowRecordLookup): null | string {
  if (flowElem.sortField) {
    return flowElem.sortField[0];
  }

  return null;
}

export function isOrderByDesc(flowElem: FlowDynamicChoiceSet | FlowRecordLookup): boolean {
  // We only consider sortOrder, if sortField is present
  if (flowElem.sortField && flowElem.sortOrder) {
    return flowElem.sortOrder.length > 0 && flowElem.sortOrder[0].toUpperCase() === 'DESC';
  }

  return false;
}
