import {Knowledge} from '../extractor/index.js';
import getOverall from '../formatters/composer.js';
import {getParser} from '../parsers/index.js'

export const VERSION = '0.1.3';

// eslint-disable-next-line max-params
export default async function convert(pathToFlow: string, verbose: boolean, silent: boolean, 
                            noversion: boolean, localVariables: boolean) : Promise<string> {

    global.NL = '\n';
    
    const parser = getParser();
    const rawFlow = await parser.parse(pathToFlow, verbose);

    // if (rawFlow.apiVersion[0] !== '54.0' || false) {
    //     throw new Error(`Only flows with apiVersion 54.0 are supported (this flow has version: ${rawFlow.apiVersion[0]})`);
    // }

    const isTestRun = typeof global.it === 'function';
    const version = (noversion || isTestRun) ? null : VERSION;

    const knowledge = new Knowledge(rawFlow, version, localVariables);
    global.knowledge = knowledge;

    const outputs: string[] = await getOverall();
    const output = outputs.join('\n');
    if (!silent) console.log(output);
    return output;
}