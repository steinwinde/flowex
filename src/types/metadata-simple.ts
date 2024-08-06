import { ApexReference } from '../result-builder/section/apex-reference.js';
import * as md from './metadata.js';

// some short cuts for metadata types/interfaces

// for convenience, e.g. referring to connector
export interface MyFlowNode extends
    md.FlowStart,
    md.FlowActionCall,
    md.FlowAssignment,
    md.FlowDecision,
    md.FlowLoop,
    md.FlowRecordLookup,
    md.FlowRecordCreate,
    md.FlowRecordUpdate,
    md.FlowRecordDelete,
    md.FlowCollectionProcessor {}

export interface MyFlowNodeWithFault extends
    md.FlowActionCall,
    md.FlowRecordLookup,
    md.FlowRecordCreate,
    md.FlowRecordUpdate,
    md.FlowRecordDelete {}

export type MyFlowElementReferenceOrValue = {
    r?: ApexReference; // set, if type==='elementReference'
    t: string; // (which) type
    v: string; // value
}
