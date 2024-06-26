import { VariableInfo } from "./simple-variable-info.js";
import { Variable } from "./simple-variable.js";

export class SimpleMethod {

    // in
    /** Method name, used as key */
    name: string;
    /** Methods that call this method */
    callingMethods = new Array<SimpleMethod>();
    /** Variables explicitly used in this method */
    variableInfos = new Array<VariableInfo>();

    // out
    /** Variables that are passed to this method */
    parameterVars: Array<Variable> = new Array<Variable>();
    /** Variable that is returned by this method */
    returnVar?: Variable;
    /** Variables that must be declared in this method based on a returned value, but not used explicitly */
    declaredVars: Array<Variable> = new Array<Variable>();

    public constructor(name: string, callingMethods: Array<SimpleMethod>, variableInfos: Array<VariableInfo>) {
        this.name = name;
        this.callingMethods = callingMethods;
        this.variableInfos = variableInfos;
    }
}