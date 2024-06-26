import { FlowNode } from "../../types/metadata.js";
import { Targets } from "../../types/targets.js";
import { Knowledge } from "../index.js";
import { Node } from "../../types/node.js";

export class BasicElementProcessor {

    protected knowledge: Knowledge;
    private target2makeMethod= new Map<string, boolean>();

    constructor(knowledge: Knowledge) {
        this.knowledge = knowledge;
    }

    protected prepare4Retrieval(e: FlowNode, p: string) : string {
        
        const node = new Node(e);
        this.knowledge.name2node.set(node.name, node);
        node.type = p;

        // anything called from two points is marked as "must be method"
        node.targets = Targets.fromFlowNode(e, p);
        // if (targets.hasTarget()) {
        //     this.add2TargetNumbers(targets);
        // }

        return node.name;
    }

    // private add2TargetNumbers(targets: Targets): void {
    //     for (const s of [targets.getPrimary(), targets.getSecondary()]) {
    //         if (!s) continue;
    //         if (this.knowledge.target2makeMethod.has(s)) {
    //             this.knowledge.target2makeMethod.set(s, true);
    //         } else {
    //             this.knowledge.target2makeMethod.set(s, false);
    //         }
    //     }
    // }

    protected assignQueryObject2Fields(s: string, mergeField: boolean, queryObject2fields : Map<string, string[]>) : void {
        // TODO: we now have the better method addQueryObject2fields
        function add2Map(item: string) : void {
            const [obj, field] = item.split('.');
            if (queryObject2fields.has(obj)) {
                queryObject2fields.get(obj)!.push(field);
            } else {
                queryObject2fields.set(obj, [field]);
            }
        }

        // if (s.includes('$Organization.') || s.includes('$User.')) {
        if (s.includes('$Organization.')) {
            if (mergeField) {
                // expression is like "{!$Foo.Bar}"
                // TODO: make this a literal
                // eslint-disable-next-line prefer-regex-literals
                const re = new RegExp('{\\!\\$([A-z.]*)}', 'g');
                let ar : null | string[] = [];
                while ((ar = re.exec(s)) !== null) {
                    if (ar[1].includes('.')) {
                        add2Map(ar[1]);
                    }
                }
            } else {
                // expression is like "$Foo.Bar"
                // if (s.startsWith('$Organization.')) {
                add2Map(s.slice(1));
                // }

                // if (s.startsWith('$User.')) {
                //     add2Map(s.slice(1));
                // }
            }
        }
    }
}