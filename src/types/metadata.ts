// see metadata.xml
// definitions are roughly in growing complexity; last definition is the one of the
// complete Flow
export interface FlowElement {
    description: string[]
    name: string[],
}

// FlowNode is a FlowElement with a location and label, i.e. can be draged in the Flow Builder
export interface FlowNode extends FlowElement {
    label: string[]
}

export interface FlowElementReferenceOrValue {
    apexValue?: string [],
    booleanValue?: boolean[],
    dateTimeValue?: string[],
    dateValue?: string[],
    elementReference?: string[],
    numberValue?: number[],
    sobjectValue?: string[],
    stringValue?: string[]
}

export interface FlowMetadataValue {
    name: string,
    value: FlowElementReferenceOrValue
}

export interface FlowInputFieldAssignment {
    field: string,
    value: FlowElementReferenceOrValue[]
}

export interface FlowOutputFieldAssignment {
    assignToReference: string[],
    field: string[]
}

export interface FlowSubflowInputAssignment {
   name: string[],
   value: FlowElementReferenceOrValue[]
}

export interface FlowSubflowOutputAssignment {
    assignToReference: string[],
    name: string[]
}

export const SortOrders = ['Asc', 'Desc'] as const;

export type SortOrder = typeof SortOrders[number];

export const IterationOrders = ['Asc', 'Desc'] as const;

export type IterationOrder = typeof IterationOrders[number];

// ====================================================================================================================
//                                                  Operators
// ====================================================================================================================

export const FlowAssignmentOperators = [
    'Assign',
    'Add',
    'Subtract',
    'AddItem',
    'RemoveFirst',
    'RemoveBeforeFirst',
    'RemoveAfterFirst',
    'RemoveAll',
    'AddAtStart',
    'RemoveUncommon',
    'AssignCount',
    'RemovePosition',
] as const;

export type FlowAssignmentOperator = typeof FlowAssignmentOperators[number];

export interface FlowAssignmentItem {
    assignToReference: string[],
    operator: FlowAssignmentOperator[],
    value: FlowElementReferenceOrValue[]
}

export const FlowRecordFilterOperators = [
    'EqualTo',
    'NotEqualTo',
    'GreaterThan',
    'LessThan',
    'GreaterThanOrEqualTo',
    'LessThanOrEqualTo',
    'StartsWith',
    'EndsWith',
    'Contains',
    'IsNull',
    'IsChanged',
] as const;

export type FlowRecordFilterOperator = typeof FlowRecordFilterOperators[number];

export interface FlowRecordFilter {
    field: string[],
    operator: FlowRecordFilterOperator[],
    value: FlowElementReferenceOrValue[]
}

export interface FlowConnector {
    targetReference: string
}

export const FlowComparisonOperators = [
    'EqualTo',
    'NotEqualTo',
    'GreaterThan',
    'LessThan',
    'GreaterThanOrEqualTo',
    'LessThanOrEqualTo',
    'StartsWith',
    'EndsWith',
    'Contains',
    'IsNull',
    'IsChanged',
    'WasSet',
    'WasSelected',
    'WasVisited',
] as const;

export type FlowComparisonOperator = typeof FlowComparisonOperators[number];

export interface FlowCondition {
    leftValueReference: string,
    operator: FlowComparisonOperator,
    rightValue: FlowElementReferenceOrValue[]
}

export interface FlowRule {
    conditionLogic: string[],
    conditions: FlowCondition[],
    connector: FlowConnector[],
    doesRequireRecordChangedToMeetCriteria: boolean,
    label: string
}

export interface FlowActionCallInputParameter {
    name: string[],
    value: FlowElementReferenceOrValue[]
}

export interface FlowActionCallOutputParameter {
    assignToReference: string,
    value: FlowElementReferenceOrValue
}

export const FlowCollectionProcessorTypes = [
    'SortCollectionProcessor',
    'RecommendationMapCollectionProcessor',
    'FilterCollectionProcessor',
] as const;

export type FlowCollectionProcessorType = typeof FlowCollectionProcessorTypes[number];

export interface FlowCollectionMapItem {
    assignToFieldReference: string,
    operator: FlowAssignmentOperator,
    value: FlowElementReferenceOrValue
}

export interface FlowCollectionSortOption {
    doesPutEmptyStringAndNullFirst: boolean,
    sortField: string,
    sortOrder: SortOrder
}

const FlowRunInModes = ['DefaultMode', 'SystemModeWithSharing', 'SystemModeWithoutSharing'] as const;

export type FlowRunInMode = typeof FlowRunInModes[number];

const RecordTriggerTypes = ['Update', 'Create', 'CreateAndUpdate', 'Delete'] as const;

export type RecordTriggerType = typeof RecordTriggerTypes[number];

const FlowStartFrequencys = ['OnActivate', 'Once', 'Daily', 'Weekly'] as const;

export type FlowStartFrequency = typeof FlowStartFrequencys[number];

export interface FlowSchedule {
    frequency: FlowStartFrequency,
    startDate: string,
    startTime: string
}

const FlowScheduledPathOffsetUnits = ['Hours', 'Days', 'Minutes'] as const;

export type FlowScheduledPathOffsetUnit = typeof FlowScheduledPathOffsetUnits[number];

const FlowScheduledPathTimeSources = ['RecordTriggerEvent', 'RecordField'] as const;

export type FlowScheduledPathTimeSource = typeof FlowScheduledPathTimeSources[number];

export interface FlowScheduledPath {
    connector: FlowConnector[],
    label: string,
    maxBatchSize: number,
    offsetNumber: number,
    offsetUnit: FlowScheduledPathOffsetUnit,
    // pathType: FlowScheduledPathType, always "AsyncAfterCommit"
    recordField: string,
    timeSource: FlowScheduledPathTimeSource
}

const FlowTriggerTypes = [
    'None',
    'Scheduled',
    'RecordBeforeSave',
    'RecordBeforeDelete',
    'ScheduledJourney',
    'RecordAfterSave',
    'PlatformEvent',
] as const;

export type FlowTriggerType = typeof FlowTriggerTypes[number];

// TODO: there are more than 200...
export const InvocableActionTypes = [
    'apex',
    'emailAlert',
    'emailSimple',
    'chatterPost',
    'externalService',
    'createCustomField',
    'quickAction',
] as const;

export type InvocableActionType = typeof InvocableActionTypes[number];

export const FlowDataTypes = [
    'Currency',
    'Date',
    'Number',
    'String',
    'Boolean',
    'SObject',
    // format: 1968-04-22T10:42:00.000Z
    'DateTime',
    'Picklist',
    'Multipicklist',
    'Apex',
] as const;

export type FlowDataType = typeof FlowDataTypes[number];

export const FlowScreenFieldTypes = [
    'DisplayText',
    'InputField',
    'LargeTextArea',
    'PasswordField',
    'RadioButtons',
    'DropdownBox',
    'MultiSelectCheckboxes',
    'MultiSelectPicklist',
    'ComponentInstance',
    'ComponentInput',
    'ComponentChoice',
    'ComponentMultiChoice',
    'ComponentDisplay',
    'RegionContainer',
    'Region',
    'ObjectProvided',
] as const;

export type FlowScreenFieldType = typeof FlowScreenFieldTypes[number];

export interface FlowVariableBase extends FlowElement {
    dataType: FlowDataType[],
    scale: number[]
}

// Formulas, Variables, Constants etc.
export interface FlowFormula extends FlowVariableBase {
    expression: string[]
}

export interface FlowConstant extends FlowElement {
    // UI only offers Text, Number, Currency, Boolean, Date
    // scale is not used, Decimal vs. Integer must be determined by the set value - therefore this is not a FlowVariableBase
    dataType: FlowDataType[],
    value: FlowElementReferenceOrValue[]
}

export interface FlowTextTemplate extends FlowElement {
    isViewedAsPlainText: boolean[],
    text: string[]
}

export interface FlowScreenField extends FlowVariableBase {
    choiceReferences: string[],
    extensionName: string[],
    fieldType: FlowScreenFieldType[],
    fields: FlowScreenField[],
    // originally boolean
    storeOutputAutomatically: string[]
}

export interface FlowWaitEventInputParameter {
    name: string[],
    value: FlowElementReferenceOrValue[]
}

export interface FlowWaitEventOutputParameter {
    assignToReference: string[],
    name: string[]
}

export interface FlowErrorMessage {
    errorMessage: string[]
}

export interface FlowWaitEvent extends FlowElement {
    conditionLogic: string[],
    conditions: FlowCondition[],
    connector: FlowConnector[],
    eventType: string[],
    inputParameters: FlowWaitEventInputParameter[],
    outputParameters: FlowWaitEventOutputParameter[]
}

// ====================================================================================================================
//                                                  FlowNodes
// ====================================================================================================================

export interface FlowActionCall extends FlowNode {
    actionName: string[],
    actionType: InvocableActionType[],
    connector: FlowConnector[],
    faultConnector?: FlowConnector[],
    inputParameters: FlowActionCallInputParameter[],
    outputParameters: FlowActionCallOutputParameter[],
}

export interface FlowAssignment extends FlowNode {
    assignmentItems: FlowAssignmentItem[],
    connector: FlowConnector[]
}

export interface FlowCollectionProcessor extends FlowNode {
    assignNextValueToReference: string[],
    collectionProcessorType: FlowCollectionProcessorType[],
    collectionReference: string[],
    // for the filter, this can be "and", "or" or "formula_evaluates_to_true" from what I saw
    conditionLogic: string[],
    conditions?: FlowCondition[],
    connector: FlowConnector[],
    formula: string[],
    limit: number[],
    mapItems: FlowCollectionMapItem[],
    outputSObjectType: string[],
    sortOptions: FlowCollectionSortOption[]
}

export interface FlowCustomError extends FlowNode {
    connector: FlowConnector[],
    customErrorMessages: FlowErrorMessage[]
}

export interface FlowDecision extends FlowNode {
    defaultConnector: FlowConnector[],
    defaultConnectorLabel: string[],
    rules: FlowRule[]
}

export interface FlowChoice extends FlowElement {
    dataType: FlowDataType[],
    value: FlowElementReferenceOrValue[]
}

export interface FlowDynamicChoiceSet extends FlowElement {
    collectionReference: string[],
    dataType: FlowDataType[],
    displayField: string[],
    filterLogic: string[],
    filters: FlowRecordFilter[],
    limit: number[],
    object: string[],
    outputAssignments: FlowOutputFieldAssignment[],
    picklistField: string[],
    picklistObject: string[],
    sortField: string[],
    sortOrder: SortOrder[],
    valueField: string[]
}

export interface FlowLoop extends FlowNode {
    assignNextValueToReference: string[],
    collectionReference: string[],
    iterationOrder: IterationOrder[],
    nextValueConnector: FlowConnector[],
    noMoreValuesConnector: FlowConnector[]
}

export interface FlowRecordCreate extends FlowNode {
    assignRecordIdToReference: string[],
    connector: FlowConnector[],
    faultConnector?: FlowConnector[],
    inputAssignments: FlowInputFieldAssignment[],
    inputReference: string[],
    object: string[],
    // originally boolean[]
    storeOutputAutomatically?: string[]
}

export interface FlowRecordDelete extends FlowNode {
    connector: FlowConnector[],
    faultConnector?: FlowConnector[],
    // string in metadata.xml, limited by UI
    filterLogic: string,
    filters: FlowRecordFilter[],
    inputReference: string[],
    object: string[]
}

export interface FlowRecordLookup extends FlowNode {
    // boolean in metadata
    assignNullValuesIfNoRecordsFound: string[],
    connector: FlowConnector[],
    faultConnector?: FlowConnector[],
    // string in metadata.xml, choice very limited by UI
    filterLogic: string,
    filters: FlowRecordFilter[],
    // had to make this string[] instead of boolean, because
    // at runtime we always got string[] anyway - and Typescript
    // had its problems with it then
    getFirstRecordOnly?: string[],
    object: string[],
    outputAssignments?: FlowOutputFieldAssignment[],
    outputReference?: string[],
    queriedFields?: string[],
    sortField?: string[],
    sortOrder?: SortOrder[],
    // boolean in metadata
    storeOutputAutomatically?: string[]
}

export interface FlowRecordUpdate extends FlowNode {
    connector: FlowConnector[],
    faultConnector?: FlowConnector[],
    // string in metadata.xml, limited by UI
    filterLogic: string,
    filters: FlowRecordFilter[],
    inputAssignments: FlowInputFieldAssignment[],
    inputReference: string[],
    object: string[]
}

export interface FlowScreen extends FlowNode {
    connector: FlowConnector[],
    fields: FlowScreenField[]
}

export interface FlowStage extends FlowElement {
    isActive: boolean[],
    label: string[]
}

export interface FlowStart extends FlowNode {
    connector: FlowConnector[],
    doesRequireRecordChangedToMeetCriteria: boolean,
    // string in metadata.xml, limited by UI
    filterLogic: string,
    filters: FlowRecordFilter[],
    object: string[],
    objectContainer: string[],
    recordTriggerType: RecordTriggerType[],
    schedule: FlowSchedule[],
    scheduledPaths: FlowScheduledPath[],
    triggerType: FlowTriggerType[]
}

export interface FlowSubflow extends FlowNode {
    connector: FlowConnector[],
    flowName: string[],
    inputAssignments: FlowSubflowInputAssignment[],
    outputAssignments: FlowSubflowOutputAssignment[],
    // originally boolean
    storeOutputAutomatically: string[]
}

export interface FlowVariable extends FlowVariableBase {
    apexClass: string[],
    // UI offers Text, Record, Number, Currency, Boolean, Date, DateTime, Picklist, Multi-Select Picklist, Apex-Defined
    // dataType: FlowDataType[],
    // had to make these strings[] instead of boolean, because
    // at runtime we always got string[] anyway - and Typescript
    // had its problems with it then
    isCollection: string[],
    isInput: string[],
    isOutput: string[],
    // dataType Record
    objectType: string[],
    // TODO: Should setScale() be applied or is this for us just to distinguish Integer vs. Decimal?
    // dataType Number and Currency (in the Number UI "Decimal Places")
    // scale: number[],
    value: FlowElementReferenceOrValue[]
}

export interface FlowWait extends FlowNode {
    defaultConnector: FlowConnector[],
    defaultConnectorLabel: string[],
    faultConnector?: FlowConnector[],
    waitEvents: FlowWaitEvent[]
}

export interface Flow {
    actionCalls: FlowActionCall[],
    apiVersion: string[],
    assignments: FlowAssignment[],
    choices: FlowChoice[],
    collectionProcessors: FlowCollectionProcessor[],
    constants: FlowConstant[],
    customErrors: FlowCustomError[],
    decisions: FlowDecision[],
    dynamicChoiceSets: FlowDynamicChoiceSet[],
    formulas: FlowFormula[],
    interviewLabel: string[],
    label: string[],
    loops: FlowLoop[],
    processMetadataValues: FlowMetadataValue[],
    // processType is "AutoLaunchedFlow" for currently supported flows
    processType: string[],
    recordCreates: FlowRecordCreate[],
    recordDeletes: FlowRecordDelete[],
    recordLookups: FlowRecordLookup[],
    recordUpdates: FlowRecordUpdate[],
    runInMode: FlowRunInMode[],
    screens: FlowScreen[],
    stages: FlowStage[],
    start: FlowStart[],
    subflows: FlowSubflow[],
    textTemplates: FlowTextTemplate[],
    variables: FlowVariable[],
    waits: FlowWait[]
}
