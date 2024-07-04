import { ApexMethod } from '../result-builder/section/apex-method.js';
import {FlowElement, FlowStart} from '../types/metadata.js';
import {ElementProcessor} from './element-processor.js';
import {getStart} from './elements/start.js';
import {Node, START_NODE_NAME} from '../types/node.js';
import { ApexSection } from '../result-builder/section/apex-section.js';
import { ApexMethodCall } from '../result-builder/section/apex-method-call.js';
import { renderDecisions } from './pathfinders/pathfinder-decisions.js';
import { renderLoops } from './pathfinders/pathfinder-loops.js';
import { renderPlain } from './pathfinders/pathfinder-plain.js';
import { renderWaits } from './pathfinders/pathfinder-waits.js';
import { ApexTry } from '../result-builder/section/apex-try.js';
import { MyFlowNodeWithFault } from '../types/metadata-simple.js';

export class PathFinder {
    public variables: string[] = [];

    private elementProcessor: ElementProcessor;

    constructor() {
        this.elementProcessor =
            new ElementProcessor(
                this,
            );
    }

    public walk(): void {
        const node = knowledge.name2node.get(START_NODE_NAME)! as Node;
        const flowStart: FlowStart = node.flowElement as FlowStart;
        getStart(flowStart);
        const currentNodeName = node.targets!.getPrimary();
        
        const apexMethod = knowledge.builder.getMainClass().registerMethod(node!.flowElement);
        // const body = this.processWithMethodOption(currentNodeName, apexMethod);
        const methodBody = this.processWithMethodOption(currentNodeName, apexMethod);
        // const methodBody: ApexSection | undefined = this.processWithDecisionAndLoop(currentNodeName, apexMethod);
        apexMethod.registerBody(methodBody);

        // if(body !== undefined) {
        //     knowledge.builder.getMainClass().addToBody(body);
        // }
    }

    processWithMethodOption(currentNodeName: null|string, parentApexMethod: ApexMethod | null) : ApexSection | undefined {
        if (currentNodeName === null) return undefined;

        const mustBeMethod = knowledge.requiredMethods.has(currentNodeName);
        if (mustBeMethod) {
            // First we build the method, then the call.
            let apexMethod = knowledge.builder.getMainClass().getMethodFromNode(currentNodeName);
            if (apexMethod === undefined) {
                const node = knowledge.name2node.get(currentNodeName);
                apexMethod = knowledge.builder.getMainClass().registerMethod(node!.flowElement);
                const methodBody: ApexSection | undefined = this.processWithDecisionAndLoop(currentNodeName, apexMethod);
                apexMethod.registerBody(methodBody);
            }

            this.setMethodOfNode(currentNodeName, apexMethod);
            const apexMethodCall = new ApexMethodCall(apexMethod);
            return apexMethodCall;
        }

        this.setMethodOfNode(currentNodeName, parentApexMethod);
        const methodBody: ApexSection | undefined = this.processWithDecisionAndLoop(currentNodeName, parentApexMethod);
        return methodBody;
    }

    // TODO: make sure loops directly inside of if-conditions work; I removed respective conditions
    private processWithDecisionAndLoop(currentNodeName: null | string, apexMethod : ApexMethod | null) : ApexSection | undefined {
        if (currentNodeName === null) return undefined;
        const flowType = knowledge.name2node.get(currentNodeName)?.type;

        const HAVE_FAULT_CONNECTOR: string[] = ['actionCalls', 'recordCreates', 'recordDeletes', 'recordLookups', 'recordUpdates', 'waits'];
        if (flowType && HAVE_FAULT_CONNECTOR.includes(flowType)) {
            const flowElem: FlowElement | undefined = knowledge.name2node.get(currentNodeName)?.flowElement;
            const elem = flowElem as MyFlowNodeWithFault;
            if (elem.faultConnector) {
                const apexSection = this.elementProcessor.getCodeUnit(flowElem!, flowType, apexMethod)!;
                const tryBlock: ApexSection | undefined = renderPlain(currentNodeName, apexMethod, apexSection, this.processWithMethodOption.bind(this));
                const catchBlock: ApexSection | undefined = this.processWithMethodOption(elem.faultConnector[0].targetReference[0], apexMethod);
                const apexTry = new ApexTry().addTryBlock(tryBlock);
                if(catchBlock) {
                    apexTry.addCatchBlock(catchBlock);
                }

                return apexTry;
            }
        }

        if (flowType === 'decisions') {
            return renderDecisions(currentNodeName, apexMethod, this.processWithMethodOption.bind(this));
        }
        
        if (flowType === 'loops') {
            return renderLoops(currentNodeName, apexMethod, this.processWithMethodOption.bind(this));
        }

        if (flowType === 'waits') {
            return renderWaits(currentNodeName, apexMethod, this.processWithMethodOption.bind(this));
        }

        const flowElem: FlowElement | undefined = knowledge.name2node.get(currentNodeName)?.flowElement;
        const apexSection = this.elementProcessor.getCodeUnit(flowElem!, flowType, apexMethod);

        if(apexSection === undefined) {
            return undefined;
        }

        return renderPlain(currentNodeName, apexMethod, apexSection, this.processWithMethodOption.bind(this));
    }

    private setMethodOfNode(currentNodeName: string, parentApexMethod: ApexMethod | null): void {
        if(parentApexMethod === null) return;
        const node = knowledge.name2node.get(currentNodeName);
        if (node !== undefined) {
            node.method = parentApexMethod;
        }
    }

    // TODO: do we need this at all?!
    addReturnValueToGlobalVars(globalVar: string): void {
        this.variables.push(globalVar);
    }

    // private registerVariableNames(variableNames: Set<string>, apexMethod: ApexMethod | null): void {
    //     if (apexMethod === null) return;
    //     for (const variableName of variableNames) {
    //         const apexVariable = knowledge.builder.getMainClass().getVariable(variableName);
    //         apexMethod?.registerVariable(apexVariable);
    //     }
    // }
}
