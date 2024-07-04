import { MyFlowNode } from "./metadata-simple.js";
import { FlowDecision, FlowLoop, FlowNode, FlowWait } from "./metadata.js";

export class Targets {

    static fromStartElementReference(targetName : string): Targets {
        const t: Targets = new Targets();
        t.regular[0] = targetName;
        return t;
    }

    static fromFlowNode(flowNode: FlowNode, p: string): Targets {

        const t: Targets = new Targets();
        switch (p) {
            case 'decisions': {
                const fn : FlowDecision = flowNode as FlowDecision;
                t.regular[0] = (fn.defaultConnector ? fn.defaultConnector[0].targetReference[0] : undefined);
                for (let i = 0; i < fn.rules.length; i++) {
                    const rule = fn.rules[i];
                    if (rule.connector && rule.connector[0].targetReference) {
                        t.regular[i + 1] = rule.connector[0].targetReference[0];
                    }
                }
                
            break;
            }

            case 'loops': {
                // loop itself has no fault connector
                const fn : FlowLoop = flowNode as FlowLoop;
                // first node in the loop (starting with "For Each")
                t.regular[0] = fn.nextValueConnector[0].targetReference[0];
                if (fn.noMoreValuesConnector) {
                    // "After Last" node configured for the loop
                    t.regular[1] = fn.noMoreValuesConnector[0].targetReference[0];
                }
            
            break;
            }

            case 'waits': {
                const fn : FlowWait = flowNode as FlowWait;
                t.regular[0] = (fn.defaultConnector ? fn.defaultConnector[0].targetReference[0] : undefined);
                for (let i = 0; i < fn.waitEvents.length; i++) {
                    const waitEvent = fn.waitEvents[i];
                    if (waitEvent.connector && waitEvent.connector[0].targetReference) {
                        t.regular[i + 1] = waitEvent.connector[0].targetReference[0];
                    }
                }

                break;
            }

            default: {
            // e.g. recordCreates
                const fn: MyFlowNode = flowNode as MyFlowNode;
                if (fn.connector && fn.connector[0].targetReference) {
                    t.regular[0] = fn.connector[0].targetReference[0];
                }

                if (fn.faultConnector && fn.faultConnector[0].targetReference) {
                    t.fault = fn.faultConnector[0].targetReference[0];
                }
            }
        }

        return t;
    }

    private fault: string | undefined;

    // it's possible the first element is undefined, but a later is not
    private regular: (string | undefined) [] = [undefined, undefined];

    getPrimary(): string {
        return this.regular[0]!;
    }

    // Apparently only used for loops (!)
    getSecondary(): string {
        return this.regular[1]!;
    }

    hasPrimary(): boolean {
        return this.regular[0] !== undefined;
    }

    hasSecondary(): boolean {
        return this.regular[1] !== undefined;
    }

    /**
     * 
     * @returns True if there is at least one (not undefined, but possibly fault) target, false otherwise
     */
    hasTarget(): boolean {
        return this.getAll().length > 0;
    }

    /**
     * 
     * @returns All regular targets, excluding the fault target, but including undefined ones
     */
    getRegular(): (string | undefined) [] {
        return [...this.regular];
    }

    /**
     * 
     * @returns The fault target, or undefined if there is none
     */
    getFault(): string | undefined {
        return this.fault;
    }

    /**
     * 
     * @returns All targets, including the fault target, but excluding undefined ones
     */
    getAll(): string[] {
        const res: string[] = [];
        for (const elem of this.regular) {
            if (elem) {
                res.push(elem);
            }
        }

        if (this.fault) {
            res.push(this.fault);
        }

        return res;
    }
}