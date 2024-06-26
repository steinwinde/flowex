import { ApexMethodCall } from '../../result-builder/section/apex-method-call.js';
import { METHOD_PREFIXES } from '../../result-builder/section/apex-method.js';
import {FlowCollectionProcessor} from '../../types/metadata.js';

export function generateSorter(flowElem: FlowCollectionProcessor): ApexMethodCall | undefined {
    const ref: string = flowElem.collectionReference[0];
    const variableInfo = knowledge.var2type.get(ref)!;
    if (variableInfo === undefined) return undefined;
    const obj = variableInfo.type;
    const v: string = obj.charAt(0).toLowerCase();

    const comparableClass = knowledge.builder.getMainClass().registerComparableClass(obj);
    const lim: number[] | undefined = flowElem.limit;
    comparableClass.registerSortOptions(v, flowElem.sortOptions);

    // const methodName = 'sort' + flowElem.name[0];
    const apexMethod = knowledge.builder.getMainClass().registerMethod(
        flowElem, METHOD_PREFIXES.METHOD_PREFIX_SORT, flowElem.name[0]);
    const apexMethodComparable = comparableClass.getMethod(ref, lim);

    apexMethod.registerBody(apexMethodComparable);
    return new ApexMethodCall(apexMethod);
}
