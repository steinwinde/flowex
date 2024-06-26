
import {FlowConstant, FlowDataType, FlowScreenField, FlowVariable, FlowVariableBase} from '../../types/metadata.js';

const FLOW_SCREEN_FIELD_WITH_DATA_TYPE = new Set(['InputField', 'RadioButtons', 'DropdownBox']);

export class ApexDataType {
    
    private result: string;

    static fromFlowConstant(flowConstant: FlowConstant): ApexDataType {
        // a FlowConstant has no scale information, just a value
        const value = flowConstant.value[0];
        const numberValue = value.numberValue !== undefined && value.numberValue[0] !== undefined ? value.numberValue[0] : undefined;
        if(numberValue !== undefined) {
            const scale = (numberValue % 1) === 0 ? 0 : 1;
            return new ApexDataType(flowConstant.dataType[0], scale);
        }

        return new ApexDataType(flowConstant.dataType[0]);
    }

    // for FlowFormula, which can have scale information (configured in the UI), but is never object or apex
    static fromFlowVariableBase(flowVariableBase: FlowVariableBase): ApexDataType {
        return new ApexDataType(flowVariableBase.dataType[0], flowVariableBase.scale ? flowVariableBase.scale[0] : undefined);
    }

    static fromFlowVariable(flowVariable: FlowVariable): ApexDataType {

        const dataType : FlowDataType = flowVariable.dataType[0];
        if (dataType === 'SObject') {
            const objectType = flowVariable.objectType[0];
            return new ApexDataType(flowVariable.dataType[0], undefined, undefined, objectType);
        }

        return new ApexDataType(flowVariable.dataType[0], flowVariable.scale ? flowVariable.scale[0] : undefined);
    }

    // see https://developer.salesforce.com/docs/atlas.en-us.236.0.api_meta.meta/api_meta/meta_visual_workflow.htm
    // TODO: We do not support flow screens yet; for now we map them on a best effort basis
    static fromFlowScreenField(flowScreenField: FlowScreenField): ApexDataType {

        const fieldType = flowScreenField.fieldType[0];
        if (FLOW_SCREEN_FIELD_WITH_DATA_TYPE.has(fieldType)) {
            return new ApexDataType(flowScreenField.dataType[0], flowScreenField.scale ? flowScreenField.scale[0] : undefined);
        }

        if (fieldType === 'ComponentInstance' 
                && flowScreenField.storeOutputAutomatically 
                && flowScreenField.storeOutputAutomatically[0] === 'true') {
            // this originates from a FlowScreenField
            // the Apex Type (inner class) must already be created

            // FIXME
            // return flowScreenField.extensionName[0];
            throw new Error('FlowScreen and ComponentInstance not implemented yet');
        } 
        
        if (fieldType === 'LargeTextArea' || fieldType === 'DisplayText') {
            return new ApexDataType('String');
        }

        throw new Error('Unknown field type: ' + fieldType);
    }

    // https://developer.salesforce.com/docs/platform/lwc/guide/use-flow-data-types.html
    private constructor(dataType: FlowDataType, scale?: number, apexClass?: string, objectType?: string) {

        switch (dataType) {
            case 'Boolean':
            case 'Date':
            case 'DateTime':
            case 'String': {
                this.result = dataType;
                break
            }

            case 'Multipicklist':
            case 'Picklist': { 
                this.result = 'String';
                break;
            }

            // TODO: The flow xml probably discloses, which variables are available on the Apex provided object
            case 'Apex': { 
                this.result = apexClass ? apexClass[0] : '???';
                break;
            }

            case 'Currency': { 
                this.result = 'Decimal';
                break;
            }

            case 'Number': { 
                // TODO: 2024-05-05: Apparently at least sometimes scale[0] arrives as a string here, not as a number
                if(scale) {
                    const scaleNumber = Number(scale);
                    this.result = (scaleNumber === 0) ? 'Integer' : 'Decimal';
                } else {
                    this.result = 'Decimal';
                }

                break;
            }

            case 'SObject': {
                // The documentation spells "sObject": https://developer.salesforce.com/docs/platform/lwc/guide/use-flow-data-types.html ,
                // but this is wrong - see SuperDecisionAllCreate.flow-meta.xml.
                this.result = objectType ?? dataType[0];
                break;
            }

            default: { 
                throw new Error('Unknown data type: ' + dataType);
            }
        }
    }

    public getResult(): string {
        return this.result;
    }
}