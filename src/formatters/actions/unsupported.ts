import { BasicAction } from './basic-action.js';

export default class UnsupportedAction implements BasicAction {
  private body: string;
  private parameterTypes = new Map<string, string>();

  public constructor(actionName: string) {
    this.body = '// ' + actionName + ' has unsupported Action type.';
  }

  public getBody(): string {
    return this.body;
  }

  public getParameterTypes(): Map<string, string> {
    return this.parameterTypes;
  }
}
