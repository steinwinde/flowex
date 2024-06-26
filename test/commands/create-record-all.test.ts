import {run} from './apex-command-runner.js';

const NAME = 'Create_Record_All';
const PATH = 'data-test\\elements\\';

describe('apex', () => {
    // All choices "Create Records" element
    run(NAME, PATH);
});
