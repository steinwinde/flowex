import {equal} from 'node:assert';

import {camelize, esc, escM} from '../src/utils.js';

describe('Test basic utils', () => {
    it('Escape single quotes in single string', () => {
        const s = 'He said \'Hello!\'!';
        const actual: string = esc(s);
        const expected = 'He said \\\'Hello!\\\'!';
        equal(actual, expected);
    });

    it('Escape single quotes in many strings', () => {
        const sar = ['He\'A!\'!', '', 'ABC\''];
        const actual: string[] = escM(sar);
        const expected = ['He\\\'A!\\\'!', '', 'ABC\\\''];
        equal(actual[0], expected[0]);
        equal(actual[1], expected[1]);
        equal(actual[2], expected[2]);
    });

    it('Camelize underscore and blanks', () => {
        const s = 'Foobar_Bla Blub';
        const actual: string = camelize(s, false);
        const expected = 'foobarBlaBlub';
        equal(actual, expected);
    });
});
