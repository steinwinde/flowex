import { ApexMethod } from '../result-builder/section/apex-method.js';
import {FlowDecision, FlowElement, FlowLoop, FlowStart} from '../types/metadata.js';
import {Parameter} from '../types/parameter.js';
import {Targets} from '../types/targets.js';
import { Variable } from '../types/variable.js';
import {ElementProcessor} from './element-processor.js';
import {getStart} from './elements/start.js';
import {Node, START_NODE_NAME} from '../types/node.js';
import { ApexIf } from '../result-builder/section/apex-if.js';
import { ApexFor } from '../result-builder/section/apex-for.js';
import { ApexSection } from '../result-builder/section/apex-section.js';
import { ApexMethodCall } from '../result-builder/section/apex-method-call.js';
import { apexIfConditionFromFlowDecision } from '../result-builder/section/apex-if-condition.js';

export class PathFinder {
    public methodParameters: Map<string, Parameter[]> = new Map<string, Parameter[]>();
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
        const methodBody: ApexSection | undefined = this.processWithDecisionAndLoop(currentNodeName, apexMethod);
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
            // const methodCall: {callLine: string, globalVar: string} = this.getMethodCall(currentNodeName, methodName);
            // this.addReturnValueToGlobalVars(methodCall.globalVar);

            const apexMethodCall = new ApexMethodCall(apexMethod);
            return apexMethodCall;

            // const codeSoFar: string = methodCall.callLine;
            // return new ApexSection().addSection(codeSoFar);
        }

        this.setMethodOfNode(currentNodeName, parentApexMethod);
        const methodBody: ApexSection | undefined = this.processWithDecisionAndLoop(currentNodeName, parentApexMethod);
        return methodBody;
    }

    // TODO: make sure loops directly inside of if-conditions work; I removed respective conditions
    private processWithDecisionAndLoop(currentNodeName: null | string, apexMethod : ApexMethod | null) : ApexSection | undefined {
        if (currentNodeName === null) return undefined;
        const flowType = knowledge.name2node.get(currentNodeName)?.type;
        if (flowType === 'decisions') {
            const targets: Targets | undefined = knowledge.name2node.get(currentNodeName)?.targets;
            if (targets && targets.hasTarget()) {

                // render first rule
                const apexIf = new ApexIf();
                const decision: FlowDecision = knowledge.name2node.get(currentNodeName)!.flowElement as FlowDecision;
                const apexIfCondition = apexIfConditionFromFlowDecision(decision, 0);
                // this.registerVariableNames(apexIfCondition.getVariableNames(), apexMethod);

                const body = targets.hasSecondary() ? this.processWithMethodOption(targets.getRegular()[1]!, apexMethod) : undefined;
                apexIf.if(apexIfCondition, body);

                for (let i = 2; i < targets.getRegular().length; i++) {
                    const apexElseCondition = apexIfConditionFromFlowDecision(decision, i-1);
                    // this.registerVariableNames(apexElseCondition.getVariableNames(), apexMethod);

                    const bodyElse = this.processWithMethodOption(targets.getRegular()[i]!, apexMethod);
                    apexIf.if(apexElseCondition, bodyElse);
                }

                // the primary is the default, i.e. the else-block
                if (targets.hasPrimary()) {
                    const body = this.processWithMethodOption(targets.getPrimary(), apexMethod);
                    apexIf.default(body);
                }

                return apexIf;
            }

            // if both blocks contain no code, we don't render the if-else
            return undefined;
        }
        
        if (flowType === 'loops') {

            const currentNode = knowledge.name2node.get(currentNodeName);
            const flowLoop = currentNode!.flowElement as FlowLoop;
            const variableName = flowLoop.collectionReference[0];
            const variableType = knowledge.builder.getMainClass().getVariable(variableName).getApexType();
            knowledge.builder.getMainClass().registerVariableBasedOnFlowElement(flowLoop).registerType(variableType).registerLocal(apexMethod);

            const targets : Targets | undefined = currentNode?.targets;
            const apexSection = new ApexSection();
            if (targets && targets.hasTarget()) {
                // render loop
                if (targets.hasPrimary()) {
                    // codeSoFar += this.getLoopStart(currentNodeName);
                    const apexFor = this.getApexFor(currentNodeName);

                    const body = this.processWithMethodOption(targets.getPrimary(), apexMethod);
                    apexFor.set(body);
                    apexSection.addSection(apexFor);
                }

                // render code after closing bracket of loop
                if (targets.hasSecondary()) {
                    const body = this.processWithMethodOption(targets.getSecondary(), apexMethod);
                    if(body !== undefined) {
                        apexSection.addSection(body);
                    }
                }
            } else {
                // if the loop block is empty, we don't render it
            }

            return apexSection;
        }

        const flowElem: FlowElement | undefined = knowledge.name2node.get(currentNodeName)?.flowElement;
        const apexSection = this.elementProcessor.getCodeUnit(flowElem!, flowType, apexMethod);

        if(apexSection === undefined) {
            return undefined;
        }

        const targets : Targets | undefined = knowledge.name2node.get(currentNodeName)?.targets;
        const nextNodeName = targets && targets.hasPrimary() ? targets.getPrimary() : null;
        if (nextNodeName) {
            if (knowledge.name2node.get(currentNodeName)?.loop === nextNodeName) {
                return apexSection;
            }

            const apexSection2 = this.processWithMethodOption(nextNodeName, apexMethod);
            if(apexSection2 !== undefined) {
                apexSection.addSection(apexSection2);
            }
        }

        return apexSection;
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

    private getApexFor(currentNodeName: string) : ApexFor {
        const loop: FlowLoop = knowledge.name2node.get(currentNodeName)!.flowElement as FlowLoop;
        const collectionReference : string = loop.collectionReference[0];
        const variableInfo = knowledge.var2type.get(collectionReference)!;
        // if a method is called inside of the loop, the function building the method
        // must be able to retrieve the type of the loop variable; this variable
        // should start with List, but currentNodeName is the current item
        const otherVariableInfo = new Variable(currentNodeName, variableInfo.type, false);
        knowledge.var2type.set(currentNodeName, otherVariableInfo);
        // in Apex the loop variable can have the same name as the enclosing method
        const apexForStatement = new ApexFor().item(variableInfo.type).itemInstance(currentNodeName).items(collectionReference);
        return apexForStatement;
    }

    // private registerVariableNames(variableNames: Set<string>, apexMethod: ApexMethod | null): void {
    //     if (apexMethod === null) return;
    //     for (const variableName of variableNames) {
    //         const apexVariable = knowledge.builder.getMainClass().getVariable(variableName);
    //         apexMethod?.registerVariable(apexVariable);
    //     }
    // }
}
