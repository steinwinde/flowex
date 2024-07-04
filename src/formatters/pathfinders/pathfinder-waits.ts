import { ApexComment } from "../../result-builder/section/apex-comment.js";
import { apexIfConditionFromWaitCondition } from "../../result-builder/section/apex-if-condition.js";
import { ApexIf } from "../../result-builder/section/apex-if.js";
import { ApexMethod } from "../../result-builder/section/apex-method.js";
import { ApexSection } from "../../result-builder/section/apex-section.js";
import { FlowWait } from "../../types/metadata.js";
import { Targets } from "../../types/targets.js";

export function renderWaits(currentNodeName : string, apexMethod : ApexMethod | null, 
            fn: (target: null|string, apexMethod: ApexMethod | null) => ApexSection|undefined) : ApexSection {
    
    const result = new ApexComment('Limited support of Wait elements. Please adjust generated code.');
    const targets: Targets | undefined = knowledge.name2node.get(currentNodeName)?.targets;
        if (targets && targets.hasTarget()) {

            // render first rule; we render this as almost regular if-else
            const apexIf = new ApexIf();
            const flowWait: FlowWait = knowledge.name2node.get(currentNodeName)!.flowElement as FlowWait;
            const flowWaitEvent = flowWait.waitEvents[0];
            // if(flowWait.waitEvents[0].conditions) {
                // A "WAIT CONDITION" is specified
                const apexIfCondition = apexIfConditionFromWaitCondition(flowWaitEvent);
    
                const body = targets.hasSecondary() ? fn(targets.getRegular()[1]!, apexMethod) : undefined;
                apexIf.if(apexIfCondition, body);
    
                for (let i = 2; i < targets.getRegular().length; i++) {
                    const apexElseCondition = apexIfConditionFromWaitCondition(flowWait.waitEvents[i]);
    
                    const bodyElse = fn(targets.getRegular()[i]!, apexMethod);
                    apexIf.if(apexElseCondition, bodyElse);
                }
    
                // the primary is the default, i.e. the else-block
                if (targets.hasPrimary()) {
                    const body = fn(targets.getPrimary(), apexMethod);
                    apexIf.default(body);
                }
    
                result.addSection(apexIf);
            // }
        }

        // if both blocks contain no code, we don't render the if-else
        return result;
}