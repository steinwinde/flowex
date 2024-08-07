import { ApexFor } from '../../result-builder/section/apex-for.js';
import { ApexMethod } from '../../result-builder/section/apex-method.js';
import { ApexSection } from '../../result-builder/section/apex-section.js';
import { FlowLoop } from '../../types/metadata.js';
import { Targets } from '../../types/targets.js';
import { Variable } from '../../types/variable.js';

export function renderLoops(
  currentNodeName: string,
  apexMethod: ApexMethod | null,
  fn: (target: null | string, apexMethod: ApexMethod | null) => ApexSection | undefined
): ApexSection | undefined {
  const currentNode = knowledge.name2node.get(currentNodeName);
  const flowLoop = currentNode!.flowElement as FlowLoop;
  const variableName = flowLoop.collectionReference[0];
  const variableType = knowledge.builder.getMainClass().getVariable(variableName).getApexType();
  knowledge.builder
    .getMainClass()
    .registerVariableBasedOnFlowElement(flowLoop)
    .registerType(variableType)
    .registerLocal(apexMethod);

  const targets: Targets | undefined = currentNode?.targets;
  const apexSection = new ApexSection();
  if (targets && targets.hasTarget()) {
    // render loop
    if (targets.hasPrimary()) {
      // codeSoFar += this.getLoopStart(currentNodeName);
      const apexFor = getApexFor(currentNodeName);

      const body = fn(targets.getPrimary(), apexMethod);
      apexFor.set(body);
      apexSection.addSection(apexFor);
    }

    // render code after closing bracket of loop
    if (targets.hasSecondary()) {
      const body = fn(targets.getSecondary(), apexMethod);
      if (body !== undefined) {
        apexSection.addSection(body);
      }
    }
  } else {
    // if the loop block is empty, we don't render it
  }

  return apexSection;
}

function getApexFor(currentNodeName: string): ApexFor {
  const loop: FlowLoop = knowledge.name2node.get(currentNodeName)!.flowElement as FlowLoop;
  const collectionReference: string = loop.collectionReference[0];
  const variableInfo = knowledge.var2type.get(collectionReference)!;
  // if a method is called inside of the loop, the function building the method
  // must be able to retrieve the type of the loop variable; this variable
  // should start with List, but currentNodeName is the current item
  const otherVariableInfo = new Variable(currentNodeName, variableInfo.type, false);
  knowledge.var2type.set(currentNodeName, otherVariableInfo);
  // in Apex the loop variable can have the same name as the enclosing method
  const apexForStatement = new ApexFor()
    .item(variableInfo.type)
    .itemInstance(currentNodeName)
    .items(collectionReference);
  return apexForStatement;
}
