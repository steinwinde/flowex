import { run } from './apex-command-runner.js';

describe('apex10', () => {
  // Flow "Tricky_Decisions" is a start to test decisions:
  // - no right hand values in conditions and/or assignments
  void run('Tricky_Decisions');
});
