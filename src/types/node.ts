import { ApexMethod } from '../result-builder/section/apex-method.js';
import { FlowElement } from './metadata.js';
import { Targets } from './targets.js';

export const START_NODE_NAME = '_start';

export class Node {
  /**
   * The name of the node in the flow-meta, or START_NODE_NAME if it is the start node
   */
  public readonly name: string;

  public readonly flowElement: FlowElement;

  /**
   * The targets of the node, i.e. the nodes that can be reached from this node.
   */
  public targets: Targets | undefined = undefined;

  // TODO: This could be made more precise
  /**
   * The type of the node, e.g. 'loops'
   */
  public type: string | undefined = undefined;

  /**
   * The loop that this node is part of, i.e. the name of the loop start node
   */
  public loop: string | undefined = undefined;

  /**
   * The ApexMethod this node is part of, i.e. the name of the method start node
   */
  public method: ApexMethod | undefined = undefined;

  public constructor(flowElement: FlowElement) {
    this.name = flowElement.name === undefined ? START_NODE_NAME : flowElement.name[0];
    this.flowElement = flowElement;
  }
}
