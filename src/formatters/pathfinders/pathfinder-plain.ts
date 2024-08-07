import { ApexMethod } from '../../result-builder/section/apex-method.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { Targets } from '../../types/targets.js';

export function renderPlain(
  currentNodeName: string,
  apexMethod: ApexMethod | null,
  apexSection: ApexSection,
  fn: (target: null | string, apexMethod: ApexMethod | null) => ApexSection | undefined
): ApexSection | undefined {
  const targets: Targets | undefined = knowledge.name2node.get(currentNodeName)?.targets;
  const nextNodeName = targets && targets.hasPrimary() ? targets.getPrimary() : null;
  if (nextNodeName) {
    if (knowledge.name2node.get(currentNodeName)?.loop === nextNodeName) {
      return apexSection;
    }

    const apexSection2 = fn(nextNodeName, apexMethod);
    if (apexSection2 !== undefined) {
      apexSection.addSection(apexSection2);
    }
  }

  return apexSection;
}
