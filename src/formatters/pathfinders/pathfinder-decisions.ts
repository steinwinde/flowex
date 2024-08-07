import { apexIfConditionFromFlowDecision } from '../../result-builder/section/apex-if-condition.js';
import { ApexIf } from '../../result-builder/section/apex-if.js';
import { ApexMethod } from '../../result-builder/section/apex-method.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { FlowDecision } from '../../types/metadata.js';
import { Targets } from '../../types/targets.js';

export function renderDecisions(
  currentNodeName: string,
  apexMethod: ApexMethod | null,
  fn: (target: null | string, apexMethod: ApexMethod | null) => ApexSection | undefined
): ApexIf | undefined {
  const targets: Targets | undefined = knowledge.name2node.get(currentNodeName)?.targets;
  if (targets && targets.hasTarget()) {
    // render first rule
    const apexIf = new ApexIf();
    const decision: FlowDecision = knowledge.name2node.get(currentNodeName)!.flowElement as FlowDecision;
    const apexIfCondition = apexIfConditionFromFlowDecision(decision, 0);

    let body = targets.hasSecondary() ? fn(targets.getRegular()[1]!, apexMethod) : undefined;
    apexIf.if(apexIfCondition, body);

    for (let i = 2; i < targets.getRegular().length; i++) {
      const apexElseCondition = apexIfConditionFromFlowDecision(decision, i - 1);

      const bodyElse = fn(targets.getRegular()[i]!, apexMethod);
      apexIf.if(apexElseCondition, bodyElse);
    }

    // the primary is the default, i.e. the else-block
    if (targets.hasPrimary()) {
      body = fn(targets.getPrimary(), apexMethod);
      apexIf.default(body);
    }

    return apexIf;
  }

  // if both blocks contain no code, we don't render the if-else
  return undefined;
}
