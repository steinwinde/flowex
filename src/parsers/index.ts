import {Flow} from '../types/metadata.js';
import {standard} from './standard.js';

export type MyFlow = {
    parse: (flowPath: string, verbose: boolean) => Promise<Flow>;
};

export function getParser(): MyFlow {
    return standard;
}
