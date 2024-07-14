import {Knowledge} from '../extractor/index.js';
import getOverall from '../formatters/composer.js';
import {getParser} from '../parsers/index.js'
import {writeFile} from 'node:fs';

export const VERSION = '0.1.3';

interface ArgsParam {
    directory: string | undefined;
    pathToFlow: string;
}
interface FlagsParam {
    localVariables: boolean;
    noversion: boolean;
    silent: boolean;
    verbose: boolean;
}

export default async function convert(args: ArgsParam, flags: FlagsParam) : Promise<void> {

    global.NL = '\n';
    
    const parser = getParser();
    const rawFlow = await parser.parse(args.pathToFlow, flags.verbose);

    // if (rawFlow.apiVersion[0] !== '54.0' || false) {
    //     throw new Error(`Only flows with apiVersion 54.0 are supported (this flow has version: ${rawFlow.apiVersion[0]})`);
    // }

    const isTestRun = typeof global.it === 'function';
    const version = (flags.noversion || isTestRun) ? null : VERSION;

    const knowledge = new Knowledge(rawFlow, version, flags.localVariables);
    global.knowledge = knowledge;

    const outputs: Map<string, string> = await getOverall();
    if (!flags.silent) {
        if(args.directory === undefined) {
            const oneOutput = [...outputs.values()].join(NL);
            console.log(oneOutput);
        } else {
            for(const [fileName, content] of outputs) {
                writeFile(args.directory + '/' + fileName + '.cls', content, (err) => {
                    if(err) {
                        throw new Error(`Can't write to "${args.directory}/${fileName}"`);
                    }
                });
            }
        }
    }
}