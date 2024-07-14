import {Args, Command, Flags } from '@oclif/core'
import { access, constants } from 'node:fs'
import convert from '../../main/index.js'
 
export default class Apex extends Command {

    static args = {
        pathToFlow: Args.string({description: 'Path to *.flow-meta.xml, the relevant Flow file', required: true}),
        // eslint-disable-next-line perfectionist/sort-objects
        directory: Args.directory({description: 'Directory to write the result to', required: false})
    }

    static flags = {
        localVariables: Flags.boolean({char: 'l', default: false, 
            description: 'Aim at making variables method local, i.e. not like in Flow execution', required: false}),
        // noversion is default in test runs
        noversion: Flags.boolean({char: 'n', default: false, 
            description: 'Do not include version information in output', required: false}),
        silent: Flags.boolean({char: 's', default: false, 
            description: 'Be silent. Do not write to standard output', required: false}),
        verbose: Flags.boolean({char: 'v', default: false, 
            description: 'Verbose debug output', required: false})
    }

    async run(): Promise<void> {
        const {args, flags} = await this.parse(Apex);
        if(args.directory !== undefined) {
            this.checkDirectoryWriteable(args.directory);
        }

        return convert(args, flags);
    }

    private checkDirectoryWriteable(directory: string): void {
        access(directory, constants.W_OK, (err) => {
            if(err) {
                throw new Error(`Can't write in the specified directory "${directory}" (or it doesn't exist)`);
            }
        });
    }
}
