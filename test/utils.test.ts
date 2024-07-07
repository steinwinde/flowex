import {equal} from 'node:assert';

import {camelize, countOccurences, esc, escM, strFormat} from '../src/utils.js';

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

    it('Replace %s in string that has no %s', () => {
        const sar = ['Hello', 'World', 'Foo'];
        const actual: string = strFormat(sar, ' ');
        const expected = 'Hello World Foo';
        equal(actual, expected);
    });

    it('Replace 1 %s in string with no additional strings', () => {
        const sar = ['Hello %s', 'World'];
        const actual: string = strFormat(sar, ' ');
        const expected = 'Hello World';
        equal(actual, expected);
    });

    it('Replace 2 %s in string with 3 additional strings', () => {
        const sar = ['Hello %s', 'World', 'and', 'hello', 'Abel!'];
        const actual: string = strFormat(sar, ' ');
        const expected = 'Hello World and hello Abel!';
        equal(actual, expected);
    });

    it('Count 3 occurrences of %s', () => {
        const s = 'Hello %s, %s, %s!';
        const actual: number = countOccurences(s);
        const expected = 3;
        equal(actual, expected);
    });

    it('Count 0 occurrences of %s', () => {
        const s = 'Hello World Foo!';
        const actual: number = countOccurences(s);
        const expected = 0;
        equal(actual, expected);
    });
});
