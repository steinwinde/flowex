import {promises as fs} from 'node:fs';
import {parseStringPromise} from 'xml2js';

import type {MyFlow} from './index.js';

type FileError = Error & {
    code: string
}

export const standard: MyFlow = {
    async parse (flowPath: string, _verbose: boolean) {

        try {
            const xml = await fs.readFile(flowPath, 'utf8')
    
            // opting for explicitArray, i.e. all child nodes are arrays; from what I can tell, more code would need to
            // be written, if array vs. non-array was not clear upfront
            const json = await parseStringPromise(xml, {explicitArray: true})
            const x = json.Flow
            delete x.$
            return x
        } catch(error) {
            if (error instanceof Error) {
                const fileError = error as FileError
                if(fileError.code === 'ENOENT') {
                    throw new Error(fileError.message)
                }
            }

            throw error
        }
    },
};
