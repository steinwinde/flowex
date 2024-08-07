import { run } from './apex-command-runner.js';

describe('apex9', () => {
  // Flow "Run_Subflows" is built to demonstrate subflow working, even if two different
  // subflows are called, one of them twice.
  void run('Run_Subflows', 'data', 'RunSubflows');
});
