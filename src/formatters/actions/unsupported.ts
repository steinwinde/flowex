import { BasicAction } from "./basic-action.js";

export default class UnsupportedAction implements BasicAction {

    private body: string;
    private parameterTypes = new Map<string, string>();
    
    constructor(actionName: string) {
        this.body = '// ' + actionName + ' has unsupported Action type.';
    }

    getBody(): string {
        return this.body;
    }

    getParameterTypes(): Map<string, string> {
        return this.parameterTypes;
    }
}
