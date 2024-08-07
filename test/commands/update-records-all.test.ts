import { run } from './apex-command-runner.js';

const NAME = 'Update_Records_All';
const PATH = 'data-test\\elements\\';

describe('apex', () => {
  // All choices "Update Records" element
  void run(NAME, PATH);
});
