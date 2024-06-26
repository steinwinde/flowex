import {equal} from 'node:assert';

import {VERSION} from '../../../src/main/index.js';
import {Knowledge} from '../../../src/extractor/index.js';
import {getRecordLookups} from '../../../src/formatters/elements/record-lookup.js';
import {Flow, FlowRecordLookup} from '../../../src/types/metadata.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny:any = global;

export const flow: Flow = {
    actionCalls: [],
    apiVersion: [],
    assignments: [],
    choices: [],
    collectionProcessors: [],
    constants: [],
    customErrors: [],
    decisions: [],
    dynamicChoiceSets: [],
    formulas: [],
    interviewLabel: [],
    label: [],
    loops: [],
    processMetadataValues: [],
    processType: [],
    recordCreates: [],
    recordDeletes: [],
    recordLookups: [],
    recordUpdates: [],
    runInMode: [],
    screens: [],
    stages: [],
    start: [],
    subflows: [],
    textTemplates: [],
    variables: [],
    waits: []
};

export const getMethods = () => {
    // eslint-disable-next-line prefer-destructuring
    const knowledge : Knowledge = globalAny.knowledge;
    const methods = knowledge.builder.getMainClass().getMethods();
    return methods;
};

describe('getRecordLookups', () => {

    beforeEach(() => {
        globalAny.NL = '\n';
        globalAny.knowledge = new Knowledge(flow, VERSION);
    });

    const flowElem: FlowRecordLookup = {
        assignNullValuesIfNoRecordsFound: ['false'],
        connector: [],
        description: [''],
        filterLogic: 'and',
        filters: [{
            field: ['AccountId'],
            operator: ['EqualTo'],
            value: [{
                elementReference: ['$Record.Id']}]}],
        getFirstRecordOnly: ['true'],
        label: ['Get Children A'],
        name: ['Get_Children_A'],
        object: ['Contact'],
        storeOutputAutomatically: ['true'],
    };

    it('Option1 Only the first record, Automatically store all fields', () => {
        const actual: string = getRecordLookups(flowElem);
        let expected = 'Get_Children_A = getContact();';
        equal(actual, expected);
        // const methods = globalAny.knowledge.programmer.getMethods();
        const methods = getMethods();
        equal(methods.length, 1);
        expected = `private Contact getContact() {
return [SELECT Id FROM Contact WHERE AccountId = :record.Id LIMIT 1] ?? null;
}`;
        equal(methods[0].build(), expected);
    });

    // same as previous, but fields queried according to input
    it('Option2 Only the first record, Choose fields and let Salesforce do the rest', () => {
        flowElem.queriedFields = ['Id', 'Birthdate'];

        const actual: string = getRecordLookups(flowElem);
        let expected = 'Get_Children_A = getContact();';
        equal(actual, expected);
        const methods = getMethods();
        equal(methods.length, 1);
        expected = `private Contact getContact() {
return [SELECT Id, Birthdate FROM Contact WHERE AccountId = :record.Id LIMIT 1] ?? null;
}`;
        equal(methods[0].build(), expected);
    });

    // same as previous, but not constituting a new variable, instead assigning to existing
    it('Option3a Only the first record, Choose fields and assign variables (advanced), Together in a record variable', () => {
        flowElem.queriedFields = ['Id', 'Department'];
        flowElem.getFirstRecordOnly = undefined;
        flowElem.outputReference = ['Get_Children_A'];
        flowElem.storeOutputAutomatically = ['false'];
        globalAny.knowledge.var2type.set('Get_Children_A', 'Contact');

        const actual: string = getRecordLookups(flowElem);
        let expected = 'populateContact();';
        equal(actual, expected);
        const methods = getMethods();
        equal(methods.length, 1);
        expected = `private void populateContact() {
List<Contact> l = [SELECT Id, Department FROM Contact WHERE AccountId = :record.Id LIMIT 1];
if(l.size()!=0) {
Get_Children_A.Id = l[0].Id;
Get_Children_A.Department = l[0].Department;
}
}`;
        equal(methods[0].build(), expected);
    });

    // same as previous, only with "When no records are returned, set specified variables to null"
    it('Option3b Only the first record, Choose fields and assign variables (advanced), Together in a record variable, When no records are returned, set specified variables to null.', () => {
        flowElem.queriedFields = ['Id', 'Department'];
        flowElem.getFirstRecordOnly = undefined;
        flowElem.outputReference = ['Get_Children_A'];
        flowElem.storeOutputAutomatically = undefined;
        flowElem.assignNullValuesIfNoRecordsFound = ['true'];
        globalAny.knowledge.var2type.set('Get_Children_A', 'Contact');

        const actual: string = getRecordLookups(flowElem);
        let expected = 'populateContact();';
        equal(actual, expected);
        const methods = getMethods();
        equal(methods.length, 1);
        expected = `private void populateContact() {
List<Contact> l = [SELECT Id, Department FROM Contact WHERE AccountId = :record.Id LIMIT 1];
if(l.size()!=0) {
Get_Children_A.Id = l[0].Id;
Get_Children_A.Department = l[0].Department;
} else {
Get_Children_A.Id = null;
Get_Children_A.Department = null;
}
}`;
        equal(methods[0].build(), expected);
    });

    // same as previous, but not constituting a new variable, instead assigning to existing
    it('Option4 Only the first record, Choose fields and assign variables (advanced), In separate variables, When no records are returned, set specified variables to null', () => {
        flowElem.queriedFields = ['Department'];
        flowElem.outputReference = undefined;
        flowElem.assignNullValuesIfNoRecordsFound = ['true'];
        flowElem.outputAssignments = [{assignToReference: ['MyDepartment'], field: ['Department']}];
        globalAny.knowledge.var2type.set('Get_Children_A', 'Contact');

        const actual: string = getRecordLookups(flowElem);
        let expected = 'populateContact();';
        equal(actual, expected);
        const methods = getMethods();
        equal(methods.length, 1);
        expected = `private void populateContact() {
List<Contact> l = [SELECT Department FROM Contact WHERE AccountId = :record.Id LIMIT 1];
if(l.size()!=0) {
MyDepartment = l[0].Department;
} else {
MyDepartment = null;
}
}`;
        equal(methods[0].build(), expected);
    });
});
