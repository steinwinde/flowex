import { run } from './apex-command-runner.js';

describe('apex8', () => {
  // Flow "Assign_Based_On_Parent" is a Flow set up by me and good for checking pathfinder calls, when several
  // terminate at the same end.
  void run('Assign_Based_On_Parent');
});
