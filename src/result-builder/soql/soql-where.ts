/* eslint-disable perfectionist/sort-objects */

import { concatFilters } from "../../formatters/translators/query-filter.js";
import { getFlowElementReferenceOrValue } from "../../formatters/translators/reference-or-value-translator.js";
import { FlowRecordFilter } from "../../types/metadata.js";
import { ApexVariable } from "../apex-variable.js";
import { ApexSection, VariableUse } from "../section/apex-section.js";

// TODO: why do I have fewer here than in the list of metadata?
// see FlowRecordFilterOperators
const OPERATOR_TRANSLATIONS: Record<string, string> = {
    EqualTo: '=',
    NotEqualTo: '!=',
    GreaterThan: '>',
    LessThan: '<',
    GreaterThanOrEqualTo: '>=',
    LessThanOrEqualTo: '<=',
} as const;

export class SoqlWhere extends ApexSection {

    private body: string = '';
    // private variableNames = new Array<string>();

    constructor(filters: FlowRecordFilter[], filterLogic: string, apexVariables: Array<ApexVariable>) {
        super();
        for (const apexVariable of apexVariables) {
            this.addVariable(apexVariable, VariableUse.Read);
        }
        
        this.body = this.compileWhere(filters, filterLogic);
    }

    build(): string {
        return this.body;
    }

    // getVariableNames(): Array<string> {
    //     return this.variableNames;
    // }

    private compileWhere(filters: FlowRecordFilter[], filterLogic: string): string {
        if (!filters) return '';
        const wheres: string[] = [];
        for (const filter of filters) {
            
            let val: string = getFlowElementReferenceOrValue(filter.value[0], true).v;
            
            // TODO: This is a hack to make it work for now
            // let variableName : null | string = null;
            // if(filter.value[0].elementReference) {
            //     variableName = val.slice(1);
            //     const index = variableName.indexOf('.');
            //     if(index > -1) {
            //         variableName = variableName.slice(0, index);
            //     }
                
            //     if(!this.variableNames.includes(variableName)) {
            //         this.variableNames.push(variableName);
            //     }
            // }
    
            const oper: string = OPERATOR_TRANSLATIONS[filter.operator[0]];
            const field = filter.field[0];
            if (oper) {
                wheres.push(String(field + ' ' + oper + ' ' + val));
            } else switch (filter.operator[0]) {
                case 'StartsWith': {
                    val = val.slice(1,  -1);
                    wheres.push(`${field} LIKE '${val}%'`);
    
                    break;
                }
    
                case 'EndsWith': {
                    val = val.slice(1,  -1);
                    wheres.push(`${field} LIKE '%${val}'`);
    
                    break;
                }
    
                case 'Contains': {
                    val = val.slice(1,  -1);
                    wheres.push(`${field} LIKE '%${val}%'`);
    
                    break;
                }
    
                case 'IsChanged': {
                    // TODO
                    wheres.push('Not yet supported');
                    break;
                }
    
                case 'IsNull': {
                    if (val === 'false') {
                        wheres.push(String(field + ' != NULL'));
                    } else {
                        wheres.push(String(field + ' = NULL'));
                    }
    
                    break;
                }
                // No default
                }
        }
    
        if (!filterLogic) return wheres.join(' AND ');
        return concatFilters(wheres, filterLogic[0]);
    }
}