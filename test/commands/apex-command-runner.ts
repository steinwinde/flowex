import * as fs from 'node:fs';
import { expect } from 'chai';
import Flowex from '../../src/commands/flowex.js';

export async function run(what: string, path: string = 'data', nameClassFile: string = what): Promise<void> {
  it(what, async () => {
    const f = `${path}\\${nameClassFile}.cls`;
    let correctContent = fs.readFileSync(f, 'utf8');

    // Remove the last character, because this.log() adds a newline to the stdout; we compare the returned value with
    // what had been stdout
    correctContent = correctContent.slice(0, -1);

    const result = await Flowex.run(['--input-file', `${path}\\${what}.flow-meta.xml`]);
    expect(result).to.eql(correctContent);
  });
}
