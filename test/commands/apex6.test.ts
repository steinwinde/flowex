import {run} from './apex-command-runner.js';

describe('apex6', () => {
    // Flow "trigger_contract_date_termin" is RecordBeforeSave and has tricky characters in its name, therefore:
    // Demonstrates basic working of:
    // - Processing of RecordBeforeSave flows, in particular: no saving in RecordUpdate
    // - Camelize class name nicely
    run('trigger_contract_date_termin');
});
