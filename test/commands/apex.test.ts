import { run } from './apex-command-runner.js';

describe('apex', () => {
  // Flow "Create Contact Conditionally" creates a Contact for each Account that is created or updated, if it not
  // already exists. The Contact refers to the Account, has the FirstName "Felix" and diverse other fields.
  // Demonstrates basic working of:
  // - GetRecords based on ID and Date criteria, "Only the first record", "Automatically store all fields" (the
  //   latter not subject of testing)
  // - Decision with simple check
  // - CreateRecords
  // - Field rendering of the Contact ($Api, $Organization, $Profile, $Record, $User, picklist, simple text, date, )
  void run('Create_Contact_Conditionally');
});
