import * as fs from 'node:fs';
import { TestContext } from '@salesforce/core/testSetup';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { expect } from 'chai';
import Flowex from '../../src/commands/flowex.js';

export async function run(what: string, path: string = 'data', nameClassFile: string = what): Promise<void> {
  const $$ = new TestContext();

  it(what, async () => {
    const f = `${path}\\${nameClassFile}.cls`;
    const correctContent = fs.readFileSync(f, 'utf8');

    const sfCommandStubs: ReturnType<typeof stubSfCommandUx> = stubSfCommandUx($$.SANDBOX);

    await Flowex.run(['--input-file', `${path}\\${what}.flow-meta.xml`]);

    const stdout = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');

    expect(stdout).to.eql(correctContent);
  });
}
