import { run } from './apex-command-runner.js';

describe('apex2', () => {
  // Flow "Delete_Filtered_Child_Contacts" gets child Contacts of an updated Account, filters them and deletes them
  // according to a value on the Contact.
  // Demonstrates basic working of:
  // - GetRecords based on ID and other criteria, "All records", "Automatically store all fields"
  // - Collection Filter
  // - Assignment
  // - DeleteRecords

  // TODO: the Collection Filter leaves an unnecessary instance variable; pending StackExchange question, this should be removed
  // TODO: I have verified saving the file, but have not run it! All pending StackExchange
  void run('Delete_Filtered_Child_Contacts');
});
