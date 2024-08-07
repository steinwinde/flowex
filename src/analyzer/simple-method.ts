import { VariableInfo } from './simple-variable-info.js';
import { Variable } from './simple-variable.js';

export class SimpleMethod {
  // in
  /** Method name, used as key */
  public name: string;
  /** Methods that call this method */
  public callingMethods = new Array<SimpleMethod>();
  /** Variables explicitly used in this method */
  public variableInfos = new Array<VariableInfo>();

  // out
  /** Variables that are passed to this method */
  public parameterVars: Variable[] = new Array<Variable>();
  /** Variable that is returned by this method */
  public returnVar?: Variable;
  /** Variables that must be declared in this method based on a returned value, but not used explicitly */
  public declaredVars: Variable[] = new Array<Variable>();

  public constructor(name: string, callingMethods: SimpleMethod[], variableInfos: VariableInfo[]) {
    this.name = name;
    this.callingMethods = callingMethods;
    this.variableInfos = variableInfos;
  }
}
