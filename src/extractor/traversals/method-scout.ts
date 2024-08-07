// import { Method } from "../../types/method.js";
// import { Knowledge } from "../index.js";
import { Node } from '../../types/node.js';
// import { FlowElement } from "../../types/metadata.js";
import { ApexMethod } from '../../result-builder/section/apex-method.js';

// This is demonstrating how methods are to be extracted from the Flow graph. Probably of no practical use,
// because the same is indirectly achieved by the PathFinder.

export class MethodScout {
  private readonly name2node: Map<string, Node>;
  private readonly methods: ApexMethod[];

  private avoidInfiniteLoop = 10;

  public constructor(name2node: Map<string, Node>, methods: ApexMethod[]) {
    this.name2node = name2node;
    this.methods = methods;
  }

  /**
   * The method first populates callingMethods of each method. It then makes sure those ApexVariables are
   * added to the list of variables of the method that are not used by the method itself,
   * but by methods called by this method.
   *
   * @returns void
   */
  public run(): void {
    this.populateCallingMethods();
    this.addVariables();
    // TODO: purely for debugging
    this.report();
  }

  private report(): void {
    for (const method of this.methods) {
      method.outputCallingMethods();
      method.outputVariables();
    }
  }

  /**
   * This method populates the calling methods of each method. What we have:
   * - each node belongs to a method (method on node)
   * - each node has targets (calling nodes)
   * - each target node represents a method
   *
   * @returns void
   */
  private populateCallingMethods(): void {
    // Get a map of target node (name) to calling nodes
    const target2origins = new Map<string, Node[]>();
    for (const node of this.name2node.values()) {
      if (!node.targets) continue;
      const targetNodes = node.targets.getAll();
      for (const targetNode of targetNodes) {
        const origins = target2origins.get(targetNode);
        if (origins) {
          // make sure we don't add the same Node twice
          if (origins.some((n) => n.name === node.name)) continue;
          target2origins.get(targetNode)!.push(node);
        } else {
          target2origins.set(targetNode, [node]);
        }
      }
    }

    for (const method of this.methods) {
      const nodeName = method.getNodeName();
      const nodes = target2origins.get(nodeName);
      if (!nodes) continue;
      for (const node of nodes) {
        if (!node.method) continue;
        method.registerCallingMethod(node.method);
      }
    }
  }

  /**
   * This method adds all variables to the methods. This includes variables that are not used by the method itself,
   * but by methods that are called by this method.
   * What we have:
   * - each method knows the variables used by itself
   * - each method knows the methods that call this method
   * What we need to do:
   * - For each method, add the variables that are used to the calling methods. Make sure not to add the same variable
   * twice. Remember if any variables were added to any of the (calling) methods.
   * - Repeat this process until no more variables are added.
   *
   * @returns void
   */
  private addVariables(): void {
    this.avoidInfiniteLoop--;
    assertNotAnInfiniteLoop(this.avoidInfiniteLoop);

    let added = false;
    for (const method of this.methods) {
      added = method.addVariablesToCallingMethods() || added;
    }

    if (added) {
      this.addVariables();
    }
  }

  // private registerCallingMethodsForEachMethod(node2methods : Map<string, Array<ApexMethod>>) {
  //     for(const method of this.methods) {
  //         const nodeName = method.getNodeName();
  //         const callingMethods = node2methods.get(nodeName);
  //         // (In May 2024) The run method is not registered and nodes belonging to it have no method.
  //         if(!callingMethods) continue;
  //         method.registerCallingMethods(callingMethods);
  //     }
  // }

  /**
   *
   * @returns A map of node names (key) to the method the node belongs to (value).
   */
  // private getNode2Method() : Map<string, ApexMethod> {
  //     const node2method = new Map<string, ApexMethod>();
  //     for(const node of this.name2node.values()) {
  //         const apexMethod = node.method;
  //         if(!apexMethod) continue;
  //         node2method.set(node.name, apexMethod);
  //     }

  //     return node2method;
  // }

  // knowledge: Knowledge;

  // constructor(knowledge : Knowledge) {
  //     this.knowledge = knowledge;
  // }

  // run() {
  //     const methods = MethodScout.createMethods(this.knowledge.name2node);
  //     this.knowledge.methods = methods;
  // }

  // private static createMethods(name2node : Map<string, Node>) : Map<string, Method> {

  //     const nodeNameToNodeNames = MethodScout.getNodesMappedToCallingNodes(name2node);
  //     const methods = MethodScout.getMethodMap(nodeNameToNodeNames, name2node);
  //     new Walker(name2node, methods);

  //     return methods;
  // }

  // /**
  //  * @param name2node (initial, preliminary) name to node mapping
  //  * @returns Map node name (key) to calling node names (value). The key (called node) is a candidate for a method.
  //  */
  // private static getNodesMappedToCallingNodes(name2node : Map<string, Node>) : Map<string, Set<string>> {
  //     const nodeNameToNodeNames = new Map<string, Set<string>>();
  //     for(const [name, node] of name2node) {
  //         if(!node.targets) continue;
  //         const targetNodes = node.targets.getAll();
  //         for(const targetNode of targetNodes) {
  //             if(nodeNameToNodeNames.has(targetNode)) {
  //                 nodeNameToNodeNames.get(targetNode)!.add(name);
  //             } else {
  //                 nodeNameToNodeNames.set(targetNode, new Set([name]));
  //             }
  //         }
  //     }

  //     return nodeNameToNodeNames;
  // }

  // private static getMethodMap(nodeNameToNodeNames : Map<string, Set<string>>, name2node : Map<string, Node>) : Map<string, Method> {
  //     const methods = new Map<string, Method>();
  //     for(const method of nodeNameToNodeNames) {
  //         const [name, callingNodes] = method;

  //         // In case of a loop element, both the element preceding the loop element and the last element in the loop
  //         // will be calling the loop element. In that case, no need to spawn a method; instead three referring nodes
  //         // are required, if a method is to be created.
  //         // In case of an action element, always spawn a method.
  //         const currentNode = name2node.get(name)!;
  //         const isLoop = currentNode.type === 'loops';
  //         const isAction = currentNode.type === 'actionCalls';

  //         if((isLoop && callingNodes.size < 3) || (!isLoop && !isAction && callingNodes.size < 2)) continue;

  //         const methodObject = new Method(name);
  //         methods.set(name, methodObject);
  //     }

  //     return methods;
  // }
}

// /**
//  * This class walks through the Flow graph,
//  * - assigns method names to nodes and
//  * - Not anymore: adds variables to methods.
//  */
// class Walker {

//     private name2node : Map<string, Node>;
//     private methods: Map<string, Method>;
//     private currentNode: Node;
//     private currentMethodName: string = START_NODE_NAME;

//     constructor(name2node : Map<string, Node>, methods : Map<string, Method>) {
//         this.name2node = name2node;
//         this.methods = methods;

//         this.currentNode = name2node.get(START_NODE_NAME)! as Node;
//         this.processWithMethodOption();
//     }

//     private processWithMethodOption() : void {
//         if(this.methods.has(this.currentNode.name)) {
//             this.currentMethodName = this.currentNode.name;
//         }

//         // purpose of this class
//         this.currentNode.method = this.currentMethodName;

//         // second purpose of this class
//         // const method = this.methods.get(this.currentMethodName)!;
//         // const variables = this.getVariables(this.currentNode.flowElement);
//         // method.addVariables(variables);

//         const targets = this.currentNode.targets?.getAll();
//         if(!targets) return;
//         for(const target of targets) {
//             this.currentNode = this.name2node.get(target)! as Node;
//         }
//     }

//     // TODO: move to separate file
//     // private getVariables(flowElement : FlowElement | undefined) : Set<string> {
//     //     const variables = new Set<string>();
//     //     if(!flowElement) {
//     //         return variables;
//     //     }

//     //     // TODO: depending on the type of the flow element, variables are to be extracted in different ways

//     //     return variables;
//     // }

// }

function assertNotAnInfiniteLoop(avoidInfiniteLoop: number): asserts avoidInfiniteLoop {
  if (avoidInfiniteLoop < 0) {
    throw new Error('Infinite loop detected');
  }
}
