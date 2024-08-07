import { run } from './apex-command-runner.js';

describe('apex3', () => {
  // Flow "Send Emails" gets all Contacts.
  // It then retrieves those that show a birthdate before 1968,
  // sorts them according to birthday and sends emails (Send Email Alert) to them,
  // before finishing it sorts 3 (!) Contacts according to AssistantName and calls a subflow
  // Demonstrates basic working of:
  // - GetRecords, "All records", "Automatically store all fields", with Birthday filter, Sorted DESC
  // - Loop
  // - Send Email Alert
  // - Collection Sort, empty string and null values first, limit sorting
  // - Subflow
  void run('Send_Emails');
});
