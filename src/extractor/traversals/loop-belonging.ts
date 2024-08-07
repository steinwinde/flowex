import { FlowElement } from '../../types/metadata.js';
import { Targets } from '../../types/targets.js';
import { Knowledge } from '../index.js';

// How loops are modelled in flow-meta: The connector of the last element in the loop points to the loop element. It therefore
// has the same connector target as the element immediately before the loop element.

// TODO: 2024: All this currently achieves is to insert a call to the method with the loop in the code; I don't understand
// why loops must be placed in a method at all anymore, but even less why for this particular call the LoopBelongingsProcessor
// is needed. All methods should get their caller inserted the same way.
export class LoopBelongingsProcessor {
  public k: Knowledge;

  public constructor(k: Knowledge) {
    this.k = k;
  }

  public run(): void {
    const loopStarts: string[] = [];
    // TODO: 2024: Why is this not done in processLoops of independent-elements.ts anyway?
    for (const name of this.k.name2node.keys()) {
      if (this.k.name2node.get(name)?.type === 'loops') {
        loopStarts.push(name);
      }
    }

    const done: string[] = [];
    const walk = (currentNodeName: string, loopName: string): void => {
      if (done.includes(currentNodeName)) return;
      done.push(currentNodeName);
      const elem: FlowElement | undefined = this.k.name2node.get(currentNodeName)?.flowElement;
      if (!elem) {
        return;
      }

      // start what we're aiming at here
      if (currentNodeName !== loopName) {
        this.k.name2node.get(currentNodeName)!.loop = loopName;
      }

      if (this.k.name2node.get(currentNodeName)?.type === 'loops') {
        // the loop may still belong to another, but all its child elements
        // will belong to it, the former
        return;
      }

      // finish what we're aiming at here
      const ts: Targets | undefined = this.k.name2node.get(currentNodeName)?.targets;
      if (ts) {
        const regular = ts.getRegular();
        if (regular) {
          for (const nextNodeName of regular) {
            if (nextNodeName) {
              walk(nextNodeName, loopName);
            }
          }
        }

        const fault = ts.getFault();
        if (fault) {
          walk(fault, loopName);
        }
      }
    };

    for (const s of loopStarts) {
      const targets: Targets | undefined = this.k.name2node.get(s)?.targets;
      if (targets && targets.hasPrimary()) {
        walk(targets.getPrimary(), s);
      }
    }
  }
}
