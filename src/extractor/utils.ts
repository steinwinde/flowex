import { FlowCollectionProcessor, FlowElementReferenceOrValue, FlowRecordLookup } from '../types/metadata.js';
import { Variable } from '../types/variable.js';

export function isSingle(lookup: FlowRecordLookup, var2type: Map<string, Variable>): boolean {
  if (lookup.getFirstRecordOnly) {
    return lookup.getFirstRecordOnly[0] === 'true';
  }

  // outputAssignments can only be used with single records
  if (lookup.outputAssignments) {
    return true;
  }

  // Apparently it is possible to choose storeOutputAutomatically===false, but still make use of the
  // recordLookup variable later, because Salesforce offers this in the UI; e.g. I can assign the
  // result collection (despite existence of outputReference) to another variable in an assignment element.
  // Therefore we have to have it as an instance variable too. Strangely I think only outputReference tells
  // us, if this is a collection or not?!
  return !var2type.get(lookup.outputReference![0])?.isCollection;
}

function processObjects2Fields(obj: string, field: string, objects2Fields: Map<string, string[]>): void {
  let sanitizedField = field;
  if (sanitizedField.includes('.')) {
    sanitizedField = sanitizedField.split('.')[1];
  }

  const sar: string[] | undefined = objects2Fields.get(obj);
  if (sar) {
    if (!sar.includes(sanitizedField)) {
      objects2Fields.get(obj)?.push(sanitizedField);
    }
  } else {
    objects2Fields.set(obj, [sanitizedField]);
  }
}

export function addFlowElementReferenceOrValue2Object2FieldsMap(
  ferov: FlowElementReferenceOrValue,
  objects2Fields: Map<string, string[]>,
  var2type: Map<string, Variable>
): void {
  if (ferov.elementReference) {
    const elem: string = ferov.elementReference[0];
    // TODO: this is at the start of the called method repeated...
    if (elem.includes('.')) {
      const elemVar = elem.split('.')[0];
      const obj = var2type.get(elemVar)?.getTypeComplete();
      if (!obj) {
        // console.log('Could not determine object type of: ' + elemVar);
        return;
      }

      // console.log('adding to objects2Fields: ' + elem + ' as object: ' + obj);
      processObjects2Fields(obj, elem, objects2Fields);
    }
  }
}

export function add2Object2FieldsMaps(
  e: FlowCollectionProcessor,
  objects2Fields: Map<string, string[]>,
  obj: string
): void {
  if (e.collectionProcessorType[0] === 'FilterCollectionProcessor') {
    if (e.conditionLogic[0] === 'formula_evaluates_to_true') {
      // E.g.:
      // <formula>{!TodaysDate}={!currentItem_Filter_Simple.Birthdate}</formula>
      // "assignNextValueToReference" holds a string like "currentItem_Filter_Simple"
      const currFilter: string = e.assignNextValueToReference[0];
      const re = new RegExp(currFilter + '\\.[^}]*', 'g');
      const formula: string = e.formula[0];
      let matches: RegExpExecArray | null;
      // eslint-disable-next-line no-cond-assign
      while ((matches = re.exec(formula))) {
        const field: string = matches[0];
        processObjects2Fields(obj, field, objects2Fields);
      }
    } else {
      for (const condition of e.conditions!) {
        const field: string = condition.leftValueReference[0];
        // e.g. field = "currentItem_Filter_Cons.Birthdate"
        // TODO: "currentItem_Filter_Cons" is from assignNextValueToReference, not sure how this works
        processObjects2Fields(obj, field, objects2Fields);
      }
    }
  } else if (e.collectionProcessorType[0] === 'SortCollectionProcessor') {
    for (const sortOption of e.sortOptions) {
      const field: string = sortOption.sortField;
      // e.g. field = "AssistantName"
      processObjects2Fields(obj, field, objects2Fields);
    }
  }
}
