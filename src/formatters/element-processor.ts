import {FlowActionCall, FlowAssignment, FlowCollectionProcessor, FlowCustomError, FlowElement, FlowRecordCreate, FlowRecordDelete, FlowRecordLookup, 
    FlowRecordUpdate, FlowScreen, FlowSubflow, FlowWait} from '../types/metadata.js';
import {MyFlowElementReferenceOrValue, MyFlowNodeWithFault} from '../types/metadata-simple.js';
import getAction from './actions/action-builder.js';
import {getAssignments} from './elements/assignments.js';
import {getRecordCreates} from './elements/record-create.js';
import {getRecordDeletes} from './elements/record-delete.js';
import {getRecordLookups} from './elements/record-lookup.js';
import {getRecordUpdates} from './elements/record-update.js';
import {getScreens} from './elements/screens.js';
import {getSubflow} from './elements/subflow.js';
import { PathFinder } from './pathfinder.js';
import {getFiltered} from './translators/collection-filter.js';
import {generateSorter} from './translators/collection-sorter.js';
import { Variable } from '../types/variable.js';
import { getCustomErrors } from './elements/custom-errors.js';
import { ApexMethod } from '../result-builder/section/apex-method.js';
import { ApexSection } from '../result-builder/section/apex-section.js';
import { ApexTry } from '../result-builder/section/apex-try.js';
import { ApexComment } from '../result-builder/section/apex-comment.js';
import { ApexSectionLiteral } from '../result-builder/section/apex-section-literal.js';
import { ApexVariable } from '../result-builder/apex-variable.js';
import { getFlowElementReferenceOrValue } from './translators/reference-or-value-translator.js';

export class ElementProcessor {
    // private methodParameters: Map<string, Parameter[]>;
    private pf: PathFinder;

    constructor(/* methodParameters: Map<string, Parameter[]> */ pf: PathFinder) {
        // this.methodParameters = methodParameters;
        this.pf = pf;
    }

    public getCodeUnit(flowElem: FlowElement, elemType: string | undefined, apexMethod : ApexMethod | null): ApexSection | undefined {
        let mainPart : ApexSection | undefined;
        switch (elemType) {
            case undefined: {return undefined; }
            case 'actionCalls': {
                mainPart = this.getActionCalls(flowElem as FlowActionCall);
                break;
            }

            case 'assignments': {
                mainPart = getAssignments(flowElem as FlowAssignment, knowledge.var2type);
                break;
            }

            case 'collectionProcessors': {
                mainPart = this.getCollectionProcessor(flowElem as FlowCollectionProcessor);
                break;
            }

            case 'customErrors': {
                mainPart = getCustomErrors(flowElem as FlowCustomError);
                break;
            }

            case 'recordCreates': {
                mainPart = getRecordCreates(flowElem as FlowRecordCreate);
                break;
            }

            case 'recordDeletes': {
                mainPart = getRecordDeletes(flowElem as FlowRecordDelete);
                break;
            }

            case 'recordLookups': {
                mainPart = getRecordLookups(flowElem as FlowRecordLookup);
                break;
            }

            case 'recordUpdates': {
                mainPart = getRecordUpdates(flowElem as FlowRecordUpdate);
                break;
            }

            case 'screens': {
                mainPart = getScreens(flowElem as FlowScreen);
                break;
            }

            case 'subflows': {
                mainPart = getSubflow(flowElem as FlowSubflow);
                break;
            }

            default: {
                throw new Error('Could not identify element: ' + elemType);
            }
        }

        const HAVE_FAULT_CONNECTOR: string[] = ['actionCalls', 'recordCreates', 'recordDeletes', 'recordLookups', 'recordUpdates'];
        if (HAVE_FAULT_CONNECTOR.includes(elemType)) {
            const elem = flowElem as MyFlowNodeWithFault;
            if (elem.faultConnector) {
                const body: ApexSection | undefined = this.pf.processWithMethodOption(elem.faultConnector[0].targetReference[0], apexMethod);
                const apexTry = new ApexTry().addTryBlock(mainPart);
                if(body) {
                    apexTry.addCatchBlock(body);
                }

                return apexTry;
            }
        }

        return mainPart;
    }

    private getActionCalls(flowActionCall: FlowActionCall) : ApexSection {

        const apexMethod = knowledge.builder.getMainClass().registerMethod(flowActionCall);

        const action = getAction(flowActionCall);
        apexMethod.registerBody(new ApexSectionLiteral(action.getBody()));
        
        const args : Array<string> = new Array<string>();
        for(const param of flowActionCall.inputParameters) {
            const defaultFlowElementReferenceOrValue : MyFlowElementReferenceOrValue = {t: 'Object', v: 'null'};
            const referenceOrValue : MyFlowElementReferenceOrValue
                = param.value ? getFlowElementReferenceOrValue(param.value[0], false) : defaultFlowElementReferenceOrValue;
            // The key used in the Flow definition, at the same time the parameter name in the Apex method
            const parameterName = param.name[0];
            // The argument when calling the Apex method
            const value = referenceOrValue.v;
            // const beautifiedName: string = camelize(value.replace('.', ''), false);
            // const apexVariable = new ApexVariable(beautifiedName);
            const apexVariable = new ApexVariable(parameterName);
            let apexType = action.getParameterTypes().get(parameterName);
            if(apexType === undefined) {
                // Throwing an Error would crash for all unknown types of Actions (note: not types of parameters of 
                // Actions) prematurely
                // throw new Error('No type found for parameter: ' + parameterName 
                //     + ' of action: ' + flowActionCall.actionName[0]);
                apexType = 'Object';
            }

            apexVariable.registerType(apexType).registerLocal(knowledge.builder.getMainClass().getLastMethod());
            apexMethod.registerParameter(apexVariable);

            args.push(value);
        }

        // TODO: are there never any output parameters? method returns?

        return new ApexSectionLiteral(apexMethod.buildCall(args.join(', ')));
    }

    private getCollectionProcessor(flowElem: FlowCollectionProcessor): ApexSection | undefined {
        const variableInfo: Variable = knowledge.var2type.get(flowElem.collectionReference[0])!;
        if (flowElem.collectionProcessorType[0] === 'FilterCollectionProcessor') {
            return getFiltered(flowElem, variableInfo);
        }

        if (flowElem.collectionProcessorType[0] === 'SortCollectionProcessor') {
            return generateSorter(flowElem);
        }

        const apexComment = new ApexComment('RecommendationMapCollectionProcessor unsupported');
        return apexComment;
    }
}
