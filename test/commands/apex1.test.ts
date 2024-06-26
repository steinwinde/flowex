import {run} from './apex-command-runner.js';


describe('apex1', () => {
    // Flow "Update All Child Records" iterates over the child Contacts of an updated Account and updates them
    // according to a value on the Account.
    // Demonstrates basic working of:
    // - GetRecords based on ID and ID criteria, "All records", "Automatically store all fields" (the latter not
    //   subject of testing)
    // - Loop
    // - Assignment
    // - UpdateRecords
    run('Update_All_Child_Records');

});
