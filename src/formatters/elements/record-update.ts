import {FlowRecordUpdate} from '../../types/metadata.js';
import {translateAssignments4Update} from '../translators/assignment-translator.js';
import {soql} from '../../result-builder/soql/soql-query.js';
import { apexIf } from '../../result-builder/section/apex-if.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { ApexIfCondition, apexIfConditionFromFlowRecordFilter } from '../../result-builder/section/apex-if-condition.js';
import { ApexSectionLiteral } from '../../result-builder/section/apex-section-literal.js';
import { ApexAssignment } from '../../result-builder/section/apex-assignment.js';
import { ApexVariable, VAR_RECORD } from '../../result-builder/apex-variable.js';
import { apexFor } from '../../result-builder/section/apex-for.js';
import { ApexMethodCall } from '../../result-builder/section/apex-method-call.js';
import { SoqlWhere } from '../../result-builder/soql/soql-where.js';
import { METHOD_PREFIXES } from '../../result-builder/section/apex-method.js';
import { ApexLeftHand } from '../../result-builder/section/apex-left-hand.js';
import { ApexRightHand } from '../../result-builder/section/apex-right-hand.js';

// in case of RecordBeforeSave, required inputReference ("$Record"), triggerTypes, assignments, but no updates
export function getRecordUpdates(flowElem: FlowRecordUpdate): ApexSection | undefined {
    // 3 options:

    // a) "Use the account record that triggered the flow" => Filter Conditions and Field Values
    //    has filterLogic, filters; inputAssignments for the assignments; inputReference e.g. $Record
    //    Requires filtering of present records
    if (flowElem.inputReference) {
        // commented 22/4/2022: getLeftHand seems unnecessary - it's just the plain string we need
        // const inputReference : string = getLeftHand(flowElem.inputReference[0]);
        
        let inputReference = flowElem.inputReference[0];
        if(flowElem.inputReference[0] === '$Record') {
            inputReference = VAR_RECORD;
        } else if(flowElem.inputReference[0].startsWith('$Record.')) {
            inputReference = 'record.' + flowElem.inputReference[0].slice(8);
        }

        // const updateLine = knowledge.recordBeforeSave ? '' : `update ${inputReference};`;
        let apexSectionLiteral : ApexSectionLiteral | undefined;
        if(!knowledge.recordBeforeSave) {
            apexSectionLiteral = new ApexSectionLiteral(`update ${inputReference};`);
        }

        let assignments = new Array<ApexAssignment>();
        if (flowElem.inputAssignments) {
            assignments = translateAssignments4Update(flowElem.inputAssignments, VAR_RECORD);
        }

        if (flowElem.filters) {
            // Have not bulkified Apex yet; therefore this filter condition is for a single record.
            // FlowRecordFilterOperators (here to apply) are identical with FlowComparisonOperators
            // in the picklist seen at this point (UI provides a subset); therefore can use the
            // latter to build a filter without SOQL.
            const condition : ApexIfCondition = apexIfConditionFromFlowRecordFilter(flowElem.filterLogic, flowElem.filters, VAR_RECORD);
            const apexSection = new ApexSection().addSections(assignments);
            if(apexSectionLiteral !== undefined) {
                apexSection.addSection(apexSectionLiteral);
            }

            // const body = `${assignments}${updateLine}`;
            return apexIf().if(condition, apexSection);
        }

        if (assignments.length > 0) {
            const apexSection = new ApexSection().addSections(assignments);
            if(apexSectionLiteral !== undefined) {
                apexSection.addSection(apexSectionLiteral);
            }
            // return `${assignments}${updateLine}`;

            return apexSection;
        }

        // b) "Use the IDs and all field values from a record or record collection" => just:
        //    inputReference, e.g. Get_Children (from a GetRecords element)
        return apexSectionLiteral;
    }

    // TODO: where statement might refer to variables, or not?
    // c) "Specify conditions to identify records, and set fields individually" => Object, Filter Conditions and Field Values
    //    has filterLogic, filters; inputAssignments for the assignments; object (NO inputReference)
    //    Requires to load a list of unrelated objects, which the flow can't refer to later. Separate method!
    const soqlWhere = new SoqlWhere(flowElem.filters, flowElem.filterLogic);
    const whereVariables = soqlWhere.getVariableNames().map(name => new ApexVariable(name));
    const where: string = soqlWhere.build();
    const assignments = translateAssignments4Update(flowElem.inputAssignments, 'item');
    const obj: string = flowElem.object[0];

    const apexMethod = knowledge.builder.getMainClass().registerMethod(flowElem, METHOD_PREFIXES.METHOD_PREFIX_UPDATE, 
            flowElem.name[0]);
    const soqlStatement = soql().select('Id').from(obj).where(where).build();
    const leftHand = new ApexLeftHand(`List<${obj}> l`, [new ApexVariable(obj).registerIsCollection()]);
    const rightHand = new ApexRightHand(soqlStatement, whereVariables);
    const assignmentForList = new ApexAssignment(leftHand, rightHand);
    const apexForExpression = apexFor().item(obj).itemInstance('item').items('l').set(assignments);
    const apexVariable = new ApexVariable('l').registerType(obj).registerIsCollection();
    const updateStatement = new ApexSectionLiteral('update l;').registerVariable(apexVariable);
    const apexSection = new ApexSection()
        .addSection(assignmentForList)
        .addSection(apexForExpression).
        addSection(updateStatement);
    
// const m = `List<${obj}> l = ${soqlStatement};
// for(${obj} item: l) {
// ${assignments}
// }
// update l;
// `;
    
    apexMethod.registerBody(apexSection);
    return new ApexMethodCall(apexMethod);
}
