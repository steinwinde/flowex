import { run } from './apex-command-runner.js';

describe('apex4', () => {
  // Flow "Update_Conditional" starts with letting only Accounts with a complex condition enter the flow.
  // It then updates the incoming Account, if it conforms to a filter, assigning it a value.
  // Demonstrates basic working of:
  // - Header comment regarding flow input when filtered.
  // - Filter of UpdateRecord applied to incoming record (non-bulkified)
  // - Assigning a value to the record that is being updated (non-bulkified)
  void run('Update_Conditional');
});
