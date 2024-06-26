import {run} from './apex-command-runner.js';

describe('apex7', () => {
    // Flow "All-GetRecords-Element" is RecordBeforeSave and has all 7 possible recordLookups elements.
    // Demonstrates basic working of:
    // - Processing of GetRecords elements
    run('All-GetRecords-Element');
});
