import {Parameter} from '../../types/parameter.js';
import {Action} from './action-builder.js';

export default class EmailSimple implements Action {
    methodParameters: Parameter[] = [];
    // eslint-disable-next-line perfectionist/sort-classes
    body: string;

    constructor(actionName: string, _inputParams: Map<string, string>) {
        this.body = '// ' + actionName + ' has unsupported Action type.';
    }
}
