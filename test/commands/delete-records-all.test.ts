import {run} from './apex-command-runner.js';

const NAME = 'Delete_Records_All';
const PATH = 'data-test\\elements\\';

describe('apex', () => {
    // "Delete Records" element
    run(NAME, PATH);
});
