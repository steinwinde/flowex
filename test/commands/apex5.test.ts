import { run } from './apex-command-runner.js';

describe('apex5', () => {
  // Flow "SuperDecisionAllCreate" filters its incoming Account on OR. Some variables are input, some are output.
  // It contains first a decision with 4 ends, the first branch to have yet another decision (one branch with default)
  // Below positioned are all types of CreateRecord options.
  // Demonstrates basic working of:
  // - Input, Output (public, constructor params and variable assignments)
  // - Multi-option decision.
  // - All 3 types of CreateRecord
  void run('SuperDecisionAllCreate');
});
