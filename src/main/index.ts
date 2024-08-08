import { writeFile } from 'node:fs';
import { Knowledge } from '../extractor/index.js';
import getOverall from '../formatters/composer.js';
import { getParser } from '../parsers/index.js';

export const VERSION = '1.0.2';

type FlagsParam = {
  'input-file': string;
  'output-directory': string | undefined;
  'local-variables': boolean;
  'no-version': boolean;
  silent: boolean;
  verbose: boolean;
};

export default async function convert(flags: FlagsParam): Promise<string> {
  global.NL = '\n';

  const parser = getParser();
  const rawFlow = await parser.parse(flags['input-file'], flags.verbose);

  // if (rawFlow.apiVersion[0] !== '54.0' || false) {
  //     throw new Error(`Only flows with apiVersion 54.0 are supported (this flow has version: ${rawFlow.apiVersion[0]})`);
  // }

  const isTestRun = typeof global.it === 'function';
  const version = flags['no-version'] || isTestRun ? null : VERSION;

  const knowledge = new Knowledge(rawFlow, version, flags['local-variables']);
  global.knowledge = knowledge;

  const outputs: Map<string, string> = getOverall();
  if (!flags.silent) {
    const outputDir = flags['output-directory'];
    if (outputDir === undefined) {
      return [...outputs.values()].join(NL) + NL;
    } else {
      for (const [fileName, content] of outputs) {
        writeFile(outputDir + '/' + fileName + '.cls', content, (err) => {
          if (err) {
            throw new Error(`Can't write to "${outputDir}/${fileName}"`);
          }
        });
      }
    }
  }

  return '';
}
