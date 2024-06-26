import {Knowledge} from './extractor/index.js';

export {};

declare global {
    // eslint-disable-next-line no-var
    var NL: string;
    // eslint-disable-next-line no-var
    var knowledge: Knowledge;
}
