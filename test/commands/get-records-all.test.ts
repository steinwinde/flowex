import { run } from './apex-command-runner.js';

const NAME = 'Get_Records_All';
const PATH = 'data-test\\elements\\';

describe('apex', () => {
  // All choices "Get Records" element
  void run(NAME, PATH);
});
