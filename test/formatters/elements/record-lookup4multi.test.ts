import {equal} from 'node:assert';

import {VERSION} from '../../../src/main/index.js';
import {Knowledge} from '../../../src/extractor/index.js';
import {getRecordLookups} from '../../../src/formatters/elements/record-lookup.js';
import {FlowRecordLookup} from '../../../src/types/metadata.js';
import {flow, getMethods} from './record-lookup.test.js';

// this tests the three GetRecord cases for "How Many Records to Store": "All records"

describe('getRecordLookups "All records"', () => {
    const flowElem: FlowRecordLookup = {
        assignNullValuesIfNoRecordsFound: ['false'],
        connector: [],
        description: [''],
        filterLogic: 'and',
        filters: [{
            field: ['AssistantName'],
            operator: ['EqualTo'],
            value: [{
                stringValue: ['Felix'],
            }]}],
        getFirstRecordOnly: ['false'],
        label: ['Get Children A'],
        name: ['Get_Children_A'],
        object: ['Contact'],
        storeOutputAutomatically: ['true'],
    };

    // beforeEach(function () {
    //     knowledge = new Knowledge(flow, VERSION);
    // });

    it('AA All records, Automatically store all fields', () => {
        global.knowledge = new Knowledge(flow, VERSION);
        const actual: string = getRecordLookups(flowElem);
        const expected = 'Get_Children_A = [SELECT Id FROM Contact WHERE AssistantName = \'Felix\'];';
        const methods = getMethods();
        equal(actual, expected);
        equal(methods.length, 0);
    });

    it('BB All records, Automatically store all fields, Need fields later', () => {
        global.knowledge = new Knowledge(flow, VERSION);
        // when this is chosen, we limit the fields to those that are used by other elements
        global.knowledge.objects2Fields.set('Contact', ['FirstName', 'LastName']);
        const actual: string = getRecordLookups(flowElem);
        const expected = 'Get_Children_A = [SELECT FirstName, LastName FROM Contact WHERE AssistantName = \'Felix\'];';
        const methods = getMethods();
        equal(actual, expected);
        equal(methods.length, 0);
    });

    it('CC All records, Choose fields and let Salesforce do the rest', () => {
        flowElem.queriedFields = ['Id', 'AssistantName'];
        global.knowledge = new Knowledge(flow, VERSION);
        const actual: string = getRecordLookups(flowElem);
        const expected = 'Get_Children_A = [SELECT Id, AssistantName FROM Contact WHERE AssistantName = \'Felix\'];';
        const methods = getMethods();
        equal(actual, expected);
        equal(methods.length, 0);
    });

    it('DD All records, Choose fields and assign variables (advanced)', () => {
        flowElem.queriedFields = ['Id', 'CleanStatus', 'Birthdate'];
        flowElem.outputReference = ['Get_Children_E'];
        global.knowledge = new Knowledge(flow, VERSION);
        const actual: string = getRecordLookups(flowElem);
        const methods = getMethods();
        equal(methods.length, 0);
        const expected = 'Get_Children_E = [SELECT Id, CleanStatus, Birthdate FROM Contact WHERE AssistantName = \'Felix\'];';
        equal(actual, expected);
    });

    // it('All records, Choose fields and assign variables (advanced), When no records are returned, set specified variables to null.', () => {
    // TODO: not sure what this option means in the UI - does it have any effect?! skipping for now
    // });
});
