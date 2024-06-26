// some stuff can't be dealt with in a top-to-bottom scan and needs a "network approach", but
// neither should be dealt with in the context of the already complex "formatter"; we therefore
// traverse the network here, gleaning information from FlowCollectionProcessor

import {Knowledge} from '../index.js';
import {FlowCollectionProcessor, FlowElement} from '../../types/metadata.js';
import {Targets} from '../../types/targets.js';
import * as utils from '../utils.js';
import { Variable } from '../../types/variable.js';
import { START_NODE_NAME } from '../../types/node.js';

export class CollectionProcessorVarProcessor {
    k: Knowledge;

    constructor(k: Knowledge) {
        this.k = k;
    }

    run() : void {
        const done: string[] = [];
        const walk =  (name: string | undefined): void => {

            if (!name || done.includes(name)) return;
            done.push(name);
            const elem: FlowElement | undefined = this.k.name2node.get(name)?.flowElement;
            if (!elem) {
                return;
            }

            // start what we're aiming at here
            if (Object.hasOwn(elem, 'collectionProcessorType')) {
                const cpt: FlowCollectionProcessor = elem as FlowCollectionProcessor;
                const variable = this.k.var2type.get(cpt.collectionReference[0])!;
                const typeComplete = variable.getTypeComplete();
                const collectionVariable = new Variable(name, typeComplete, true);
                this.k.var2type.set(name, collectionVariable);
                const objWithoutList = variable.type;
                this.k.builder.getMainClass().registerVariable(name).registerType(objWithoutList).registerIsCollection();

                // the GetRecord element needs to know which fields collection processors and possibly others
                // require for its SELECT statement
                utils.add2Object2FieldsMaps(cpt, this.k.objects2Fields, objWithoutList);
            }

            // finish what we're aiming at here
            const ts: Targets | undefined = this.k.name2node.get(name)?.targets;
            if (ts) {
                const regular = ts.getRegular();
                if (regular) {
                    for (const r of regular) {
                        walk(r);
                    }
                }

                walk(ts.getFault());
            }
        };

        const ts: Targets | undefined = this.k.name2node.get(START_NODE_NAME)?.targets;
        if (ts) {
            walk(ts.getPrimary());
        }
    }
}
