import {Args, Command, Flags } from '@oclif/core'

import convert from '../../main/index.js'
 
export default class Apex extends Command {

    // TODO: 2024-05-11: Whish list:
    // - Command line parameter to make output variable names more like typical
    //   Java variableNames (starting with lower case letter, but maybe also remove underscores). At least when removing underscores,
    //   this necessitates a mapping of original names to new names, because uniqueness is only guaranteed before applying this change. But
    //   this mapping would only get relevant in the moment output is generated.

    static args = {
        pathToFlow: Args.string({description: 'Path to *.flow-meta.xml, the relevant Flow file', required: true}),
    }

    static flags = {
        globalVariables: Flags.boolean({char: 'g', default: false, description: 'Make all variables class fields, i.e. keep them global like in the Flow', required: false}),
        // noversion is default in test runs
        noversion: Flags.boolean({char: 'n', default: false, description: 'Do not include version information in output', required: false}),
        silent: Flags.boolean({char: 's', default: false, description: 'Be silent. Do not write to standard output', required: false}),
        verbose: Flags.boolean({char: 'v', default: true, description: 'Verbose debug output', required: false})
    }

    async run(): Promise<string> {
        const {args, flags} = await this.parse(Apex)
        return convert(args.pathToFlow, flags.verbose, flags.silent, flags.noversion, flags.globalVariables);
    }
}
