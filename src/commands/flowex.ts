import { access, constants } from 'node:fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import convert from '../main/index.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('flowex', 'flowex');

export type FlowexResult = {
  result: string;
};

export default class Flowex extends SfCommand<FlowexResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'input-file': Flags.file({
      summary: messages.getMessage('flags.input-file.summary'),
      char: 'i',
      required: true,
      exists: true,
    }),
    'output-directory': Flags.directory({
      summary: messages.getMessage('flags.output-directory.summary'),
      // eslint-disable-next-line sf-plugin/dash-o
      char: 'o',
      exists: true,
    }),
    'local-variables': Flags.boolean({
      summary: messages.getMessage('flags.local-variables.summary'),
      char: 'l',
    }),
    'no-version': Flags.boolean({
      summary: messages.getMessage('flags.no-version.summary'),
      char: 'n',
    }),
    silent: Flags.boolean({
      summary: messages.getMessage('flags.silent.summary'),
      char: 's',
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
      char: 'v',
    }),
  };

  private static checkDirectoryWriteable(directory: string): void {
    access(directory, constants.W_OK, (err) => {
      if (err) {
        throw new Error(`Can't write in the specified directory "${directory}"`);
      }
    });
  }

  public async run(): Promise<FlowexResult> {
    const { flags } = await this.parse(Flowex);

    if (flags['output-directory']) {
      Flowex.checkDirectoryWriteable(flags['output-directory']);
    }

    await convert(flags);

    this.log(`Processing ${flags['input-file']}...`);

    return {
      result: 'bingo',
    };
  }
}
