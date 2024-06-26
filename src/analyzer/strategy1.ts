import { TOP_METHOD } from "../result-builder/section/apex-method.js";
import { SimpleMethod } from "./simple-method.js";
import { Variable } from "./simple-variable.js";

/**
 * Find variables only used by the constructor and the method called by constructor. Mark them as local 
 * and pass them to the run method. Because variables used in the constructor are already marked as 
 * not being initialized in any specific method, declaring/initializing is not considered here.
 */
export class SharedWithConstructor {

    private methodCalledByConstructor: SimpleMethod;
    private nonTopLevelMethodVariables = new Set<string>();
    private constructorVars: Set<string>;

    public constructor(methods: Array<SimpleMethod>, constructorVars: Array<Variable>) {
        this.methodCalledByConstructor = methods.find(m => m.name === TOP_METHOD) as SimpleMethod;
        for(const variabeInfo of methods.filter(m => m.name !== TOP_METHOD).flatMap(m => m.variableInfos)) {
            this.nonTopLevelMethodVariables.add(variabeInfo.v.s);
        }

        this.constructorVars = new Set(constructorVars.map(v => v.s));
        this.run();
    }

    private run() : void {
        for(const variableInfo of this.methodCalledByConstructor.variableInfos.filter(v => v.v.g === undefined)) {
            if(this.constructorVars.has(variableInfo.v.s) && !this.nonTopLevelMethodVariables.has(variableInfo.v.s)) {
                // variable is used in top-level method, in the constructor, but not in any other method
                if(variableInfo.u) {
                    if(this.methodCalledByConstructor.returnVar === undefined) {
                        this.methodCalledByConstructor.parameterVars.push(variableInfo.v);
                        this.methodCalledByConstructor.returnVar = variableInfo.v;
                        variableInfo.v.g = false;
                    } else {
                        variableInfo.v.g = true;
                    }
                } else {
                    this.methodCalledByConstructor.parameterVars.push(variableInfo.v);
                    variableInfo.v.g = false;
                }
            }
        }
    }
}