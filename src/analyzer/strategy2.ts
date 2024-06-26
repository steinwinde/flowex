import { TOP_METHOD } from "../result-builder/section/apex-method.js";
import { SimpleMethod } from "./simple-method.js";
import { Variable } from "./simple-variable.js";

/**
 * Find variables used in several methods; only make the variable local, if
 * 
 * a) these methods are only - with one exception - called by methods that use the variable; AND 
 * 
 * b) where the variable is assigned in a method, the method is still available to return the variable; AND
 * 
 * c) there is only one method that calls these methods and this method is called by no method using the variable
 * 
 * At the top of the call hierarchy, the method must not be called by a method that uses the variable. This is to
 * avoid circular dependencies. It is however not clear anyway where to declare and initialize a variable in case of
 * a circular dependency.
 * 
 * If the method called by the constructor is a calling method and the variable is constructor variable, 
 * the variable must be passed to the method called by the constructor too.
 * 
 * Also, mark methods as returning the variable, if any of the called methods assigns the variable. This must have 
 * a cascading effect: If a (directly or indirectly) called method returns a variable, and the variable is marked
 * as declared/initialized in the called method, the calling method must return the variable too etc. However, if
 * the calling method is the top-level method ("run"), the variable doesn't have to be returned; the constructor
 * doesn't make any use of it.
 * 
 * These methods can't return anything else anymore. While doing so, make 
 * sure each method can only return one variable. Any other variable that is assigned in the method must be global. 
 */
export class SharedUse {

    /** methods to be considered, incl. method called by the constructor, but not constructor itself */
    private methods: Array<SimpleMethod>;

    /** names of variables not considered as a result */
    private constructorVars: Array<Variable>;

    public constructor(methods: Array<SimpleMethod>, constructorVars: Array<Variable>) {
        this.methods = methods;
        this.constructorVars = constructorVars;
        this.run();
    }

    private run() : void {
        const m = this.getMapVariableToMethods();
        for(const [variableName, methodsThatUseVariable] of m.entries()) {
            this.processVariable(variableName, methodsThatUseVariable);
        }

        // TODO: We better do this after applying *all* strategies
        this.markGlobalVariablesAsAlreadyInitialized();
    }

    private markGlobalVariablesAsAlreadyInitialized() : void {
        for(const method of this.methods) {
            for(const variableInfo of method.variableInfos.filter(v => v.v.g)) {
                variableInfo.d = false;
            }
        }
    }

    private processVariable(variableName: string, methodsThatUseVariable : Array<SimpleMethod>) : void {
        if(!this.hasExactlyOneCallingMethod(methodsThatUseVariable)) {
            // case can't be decided by this strategy; it could be decided by looking at the 
            // different calling methods
            return;
        }

        if(this.isAssignedButCanNotBeReturned(variableName, methodsThatUseVariable, new Set<string>())) {
            const variableInfo = methodsThatUseVariable[0].variableInfos.find(v => v.v.s === variableName)!;
            variableInfo.v.g = true;
            return;
        }

        const isUsedInConstructor = this.constructorVars.some(v => v.s === variableName);
        if(isUsedInConstructor) {
            console.log('Variable used in constructor: ' + variableName);
            // The variable will already be declared as not initialized anywhere by strategy0
            const topLevelMethod = this.callingMethodIsMethodCalledByConstructor(methodsThatUseVariable);
            if(topLevelMethod === undefined) {
                console.log('Variable used in constructor and not called by constructor: ' + variableName);
                // because the variable is used in the Apex constructor and the top method is not the 
                // calling method, the variable must be global
                const variableInfo = methodsThatUseVariable[0].variableInfos.find(v => v.v.s === variableName)!;
                variableInfo.v.g = true;
            } else {
                console.log('Variable used in constructor and called by constructor: ' + variableName);
                const variableInfo = topLevelMethod.variableInfos.find(v => v.v.s === variableName)!;
                variableInfo.v.g = false;
                topLevelMethod.parameterVars.push(variableInfo.v);
            }

            return;
        }

        this.markMethodsAndVariables(methodsThatUseVariable, variableName);
    }

    private markMethodsAndVariables(methodsThatUseVariable: Array<SimpleMethod>, variableName: string) : void {
        for(const method of methodsThatUseVariable) {
            const variableInfo = method.variableInfos.find(v => v.v.s === variableName)!;
            // if method is top level method, the variable must be declared/initialized there; otherwise
            // it must be passed as parameter; if method assigns the variable, it must be returned (and
            // we already made sure we can return it)
            if(variableInfo.u) {
                if(method.name === TOP_METHOD) {
                    // we know it's not used in the constructor
                    variableInfo.d = true;
                } else {
                    // if the variable is assigned in the method, the method must return it and methods above must
                    // return it too up to its definition
                    const callingMethods = method.callingMethods
                    variableInfo.d = false;
                    method.parameterVars.push(variableInfo.v);
                }
            
            }
        }
    }

    /**
     * Returns true if the variable is assigned in a method that can't return the variable
     * @param variableName Name of variable
     * @param methodsThatUseVariable List of considered methods
     * @param methodsAlreadyChecked Records already checked methods to avoid infinite recursion
     * @returns 
     */
    private isAssignedButCanNotBeReturned(variableName: string, methodsThatUseVariable: Array<SimpleMethod>, methodsAlreadyChecked: Set<string>) : boolean {
        const methodsAssigningVariable = methodsThatUseVariable.filter(m => m.variableInfos.some(v => v.v.s === variableName && v.u));
        for(const method of methodsAssigningVariable) {
            if(methodsAlreadyChecked.has(method.name)) {
                continue;
            }
            
            methodsAlreadyChecked.add(method.name);

            if(method.returnVar !== undefined) {
                return true;
            }

            if(method.callingMethods.length > 0 && this.isAssignedButCanNotBeReturned(variableName, method.callingMethods, methodsAlreadyChecked)) {
                return true;
            }
        }

        return false;
    }

    /**
     * The methods using the variable are called by methods that all but one use the variable too
     * @param variableName Name of variable
     * @param methods Methods using the variable.
     * @returns 
     */
    private hasExactlyOneCallingMethod(methodsThatUseVariable: Array<SimpleMethod>) : boolean {
        const methodsCallingMethodsUseVariable = methodsThatUseVariable.flatMap(m => m.callingMethods)
                .filter(method => !methodsThatUseVariable.includes(method));
        return methodsCallingMethodsUseVariable.length !== 1;
    }

    private callingMethodIsMethodCalledByConstructor(methodsThatUseVariable: Array<SimpleMethod>) : SimpleMethod | undefined {
        const methodsCallingMethodsUseVariable = methodsThatUseVariable.flatMap(m => m.callingMethods)
                .filter(method => !methodsThatUseVariable.includes(method));
        
        if(methodsCallingMethodsUseVariable.length === 1 && methodsCallingMethodsUseVariable[0].name === TOP_METHOD) {
            return methodsCallingMethodsUseVariable[0];
        }

        return undefined;
    }

    private getMapVariableToMethods() : Map<string, Array<SimpleMethod>> {
        const m = new Map<string, Array<SimpleMethod>>();
        for(const method of this.methods) {
            for(const variableInfo of method.variableInfos.filter(v => v.v.g===undefined)) {
                if(!m.has(variableInfo.v.s)) {
                    m.set(variableInfo.v.s, new Array<SimpleMethod>());
                }

                m.get(variableInfo.v.s)!.push(method);
            }
        }

        return m;
    }
}