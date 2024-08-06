import {FlowDynamicChoiceSet, FlowScreen, FlowScreenField} from '../../types/metadata.js';
import {getOrderByField, isOrderByDesc} from './record-lookup.js';
import {soql} from '../../result-builder/soql/soql-query.js';
import { ApexComment } from '../../result-builder/section/apex-comment.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { SoqlWhere } from '../../result-builder/soql/soql-where.js';
import { extractFilterVariables } from '../translators/query-filter.js';

export function getScreens(flowElem: FlowScreen): ApexSection {
    const apexSection = new ApexSection();
    const body = `UI "${flowElem.name}" begin (all assignments are stubs)`;
    apexSection.addSection(new ApexComment(body));
    if (flowElem.fields) {
        for (const field of flowElem.fields) {
            const type = field.fieldType[0];
            if (type === 'DropdownBox') {
                const name : string = field.choiceReferences[0];
                const dyn: FlowDynamicChoiceSet | undefined =
                    knowledge.name2node.get(name)?.flowElement as FlowDynamicChoiceSet;
                if (dyn === undefined) {
                    // e.g. the choiceReference can point to a "choices" element
                    continue;
                }

                if(!dyn.collectionReference && !dyn.picklistObject) {
                    // TODO: Don't we need to consider the field iterator here?
                    apexSection.addSection(new ApexComment(getQuery(dyn!)));
                } else {
                    apexSection.addSection(new ApexComment('... also based on List ' + name));
                }
            } else if (type === 'ComponentInstance' && field.storeOutputAutomatically && field.storeOutputAutomatically[0] === 'true') {
                // anything here?!
            }

            if (type !== 'DisplayText') {
                apexSection.addSection(new ApexComment(`${field.name[0]} = ${getStub(field)};`));
            }
        }
    }

    apexSection.addSection(new ApexComment('UI end'));
    return apexSection;
}

function getStub(field: FlowScreenField) : string {
    if (field.fieldType[0] === 'DropdownBox' && field.choiceReferences && knowledge.choices.has(field.choiceReferences[0])) {
        const choice = knowledge.choices.get(field.choiceReferences[0]);
        if (choice?.dataType[0] === 'String') {
            return `'${choice.value[0].stringValue![0]}'`;
        }

        if (choice?.dataType[0] === 'Number' || choice?.dataType[0] === 'Currency') {
            return `${choice.value[0].numberValue![0]}`;
        }

        if (choice?.dataType[0] === 'Boolean') {
            return `${choice.value[0].booleanValue![0]}`;
        }

        if (choice?.dataType[0] === 'Date') {
            return `${choice.value[0].dateValue![0]}`;
        }

        if (choice?.dataType[0] === 'DateTime') {
            return `${choice.value[0].dateTimeValue![0]}`;
        }

        return 'null';
    }

    if (field.dataType) {
        const dataType: string = field.dataType[0];
        if (dataType === 'Number') {
            if (field.scale[0] === 0) {
                return '0';
            }

            return '0.0';
        }

        const m: Map<string, string> = new Map<string, string>([['Boolean', 'true'], ['Currency', '0.0'], ['String', '\'\'']]);
        const val = m.get(field.dataType[0]);
        if (val === undefined) return 'null';
        return val;
    }

    // ComponentInstance
    return 'null';
}

function getQuery(dyn: FlowDynamicChoiceSet) : string {
    // Only one other case left: the FlowDynamicChoiceSet is in effect
    // a GetRecords element that does an implicit query whenever the screen is displayed,
    // see "Record Choice Set"
    // https://help.salesforce.com/s/articleView?id=sf.flow_ref_resources_recordchoice.htm&type=5
    // This makes the screen element be able to execute such:

    const obj: string = dyn.object[0];
    const fields : string[] = [dyn.displayField[0]];
    if (dyn.outputAssignments) {
        for (const oa of dyn.outputAssignments) {
            if (oa.field) {
                fields.push(oa.field[0]);
            }
        }
    }

    const soqlQuery = soql().select(fields).from(obj);
    if(dyn.filters) {
        const apexVariables = extractFilterVariables(dyn.filters);
        const soqlWhere = new SoqlWhere(dyn.filters, dyn.filterLogic[0], apexVariables);
        const where = soqlWhere;
        soqlQuery.where(where);
    }

    const orderByField = getOrderByField(dyn);
    if(orderByField !== null) {
        const orderByDesc = isOrderByDesc(dyn);
        soqlQuery.orderBy(orderByField, orderByDesc);
    }

    if(dyn.limit) {
        soqlQuery.limit(dyn.limit[0]);
    }

    const body = `${dyn.name[0]} = ${soqlQuery.build()};`;
    return body;
}
