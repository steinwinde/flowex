// /* eslint-disable perfectionist/sort-objects */
// import {FlowRecordFilter} from '../../types/metadata.js';
// import {ApexReference} from '../../result-builder/apex-reference.js';
// import {getFlowElementReferenceOrValue} from './reference-or-value-translator.js';
// // this is to build a single if-condition for the decision: "either update this record or not!"
// // only necessary when run in non-bulkified mode, in the context of UpdateRecord

// // this is taken from rules-translator (!)
// const CONDITION_LOGIC: Record<string, string> = {
//     or: '||',
//     and: '&&',
// } as const;

// // this is the list for the FlowRecordFilterOperators (!)
// const OPERATOR_TRANSLATIONS: Record<string, string> = {
//     EqualTo: '==',
//     NotEqualTo: '!=',
//     GreaterThan: '>',
//     LessThan: '<',
//     GreaterThanOrEqualTo: '>=',
//     LessThanOrEqualTo: '<=',
// } as const;

// // this is similar to if-condition creation
// export function getIfCondition(filterLogic: string, filters: FlowRecordFilter[], ref:string): string {
//     let result = '';
//     const overallOper = CONDITION_LOGIC[filterLogic];
//     const ar: string[] = [];
//     let a = '';
//     let b = '';
//     if (filters.length > 1) {
//         a = '(';
//         b = ')';
//     }

//     for (const filter of filters) {
//         // e.g. "$Record.FirstName"
//         const apexReference = new ApexReference(filter.field[0]);
//         const leftValueReference: string = apexReference.build();

//         if (leftValueReference.includes('.')) {
//             const obj: string = leftValueReference.split('.')[0];
//             ar.push(obj + ' != null');
//         }

//         const oper: string = OPERATOR_TRANSLATIONS[filter.operator[0]];
//         // TODO: this might need quoting - add to parameters of getFlowElementReferenceOrValue ?
//         const rightValue: string = getFlowElementReferenceOrValue(filter.value[0], false).v;
//         let val = '';
//         if (oper) {
//             val = `${a}${ref}.${leftValueReference} ${oper} ${rightValue}${b}`;
//         } else {
//             switch (filter.operator[0]) {
//                 case 'IsNull': {
//                     const eqOrNot = (rightValue === 'true' ? '==' : '!=');
//                     val = `${a}${ref}.${leftValueReference} ${eqOrNot} null${b}`;
//                     break;
//                 }

//                 case 'StartsWith': {
//                     // TODO: don't we need something similiar to IsNull: eqOrNot...?!
//                     val = `${ref}.${leftValueReference}.startsWith(${rightValue})`;

//                     break;
//                 }

//                 case 'EndsWith': {
//                     // TODO: don't we need something similiar to IsNull: eqOrNot...?!
//                     val = `${ref}.${leftValueReference}.endsWith(${rightValue})`;

//                     break;
//                 }

//                 case 'Contains': {
//                     // TODO: don't we need something similiar to IsNull: eqOrNot...?!
//                     val = `${ref}.${leftValueReference}.contains(${rightValue})`;

//                     break;
//                 }

//                 default: {
//                     val = '???';
//                     break;
//                 }
//             }
//         }

//         ar.push(val);
//     }

//     result = ar.join(' ' + overallOper + ' ');

//     return result;
// }
