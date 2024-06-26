import {run} from './apex-command-runner.js';

describe('apex12', () => {
    // Flow "First_Error_Handler" has two try-catch (one below the catch of the other) and
    // and email-send action.
    // It also has a reference to CurrentStage that make the Apex fail to compile.
    // "mail.setPlainTextBody(CurrentStage);"
    // The failure to compile is expected, because the Flow author failed to configure and 
    // assign stages.
    run('First_Error_Handler');
});
