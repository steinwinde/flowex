import {runCommand} from '@oclif/test'
import * as fs from 'node:fs';
import {expect} from 'chai'

export async function run(what: string, path: string = 'data', nameClassFile: string = what) {

    it(what, async () => {
    
        const f = `${path}\\${nameClassFile}.cls`;
        const correctContent = fs.readFileSync(f, 'utf8');

        const {stdout} = await runCommand(['apex', `${path}\\${what}.flow-meta.xml`]);
        expect(stdout).to.eql(correctContent);
    });
}