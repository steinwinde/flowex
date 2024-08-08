import * as fs from 'node:fs';
import { expect } from 'chai';
import Flowex from '../../src/commands/flowex.js';

export async function run(what: string, path: string = 'data', nameClassFile: string = what): Promise<void> {
  it(what, async () => {
    const f = `${path}\\${nameClassFile}.cls`;
    const correctContent = fs.readFileSync(f, 'utf8');

    const stdout = await Flowex.run(['--input-file', `${path}\\${what}.flow-meta.xml`]);

    expect(stdout).to.eql(correctContent);
  });
}
