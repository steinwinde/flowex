import { ApexVariable } from "../../result-builder/apex-variable.js";
import { FlowRecordFilter } from "../../types/metadata.js";
import { getFlowElementReferenceOrValue } from "./reference-or-value-translator.js";

// used also by condition-builder
export function concatFilters(wheres: string[], filterLogic: string) : string {
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

export function extractFilterVariables(filters: FlowRecordFilter[] | undefined) : Array<ApexVariable> {
    const variables = new Array<ApexVariable>();
    if(!filters) {
        return variables;
    }
    
    const variableNames = new Array<string>();
    const mainClass = knowledge.builder.getMainClass();
    for (const filter of filters) {
        // TODO: This is a hack to make it work for now
        if(filter.value[0].elementReference && !filter.value[0].elementReference[0].startsWith('$')) {
            const val: string = getFlowElementReferenceOrValue(filter.value[0], true).v;
            let variableName = val.slice(1);
            const index = variableName.indexOf('.');
            if(index > -1) {
                variableName = variableName.slice(0, index);
            }
            
            if(!variableNames.includes(variableName)) {
                variableNames.push(variableName);
                const variable = mainClass.getVariable(variableName);
                variables.push(variable);
            }
        }
    }

    return variables;
}