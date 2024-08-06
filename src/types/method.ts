export class Method {

    // TODO: Class seems unnecessary, because relevant ApexMethods are created early in the process

    /**
     * The name of the first node of the method
     */
    // private name: string;

    /**
     * The (original) names of the variables used by the method or by the methods called by this method.
     * This is later used to determine the parameters of the method.
     */
    private variables: Set<string> = new Set();

    /**
     * The names of the nodes that are calling this method. The whole of this information is later used to 
     * determine which methods are called by which methods, because the calling nodes will be identified as
     * belonging to specific methods.
     */
    // private callingNodes: Set<string> = new Set();

    /**
     * The names of the methods that are called by this method.
     */
    // private calledMethods: Set<Method> = new Set();

    constructor() {
        // this.name = name;
    }

    // /**
    //  * Add a variable to the method.
    //  * 
    //  * @param variable The name of the variable
    //  * @param originatingMethod The name of the method that added the variable (prevents circular dependencies / infinite loops)
    //  * @returns True if the variable was added, false if the variable was already present
    //  */
    // addVariables(variables: Array<string> | string, originatingMethod: string): boolean {
    //     let added = false;

    //     if(this.name === originatingMethod) {
    //         return added;
    //     }

    //     if (Array.isArray(variables)) {
    //         for (const variable of variables) {
    //             if(this.addVariable(variable)) {
    //                 added = true;
    //             }
    //         }
    //     } else if(this.addVariable(variables)) {
    //         added = true;
    //     }

    //     for(const method of this.callingMethods) {
    //         added = method.addVariables(variables, this.name) || added;
    //     }

    //     return added;
    // }

    public addVariables(variables: Set<string>): boolean {
        
        let added = false;
        for(const variable of variables) {
            if(this.addVariable(variable)) {
                added = true;
            }
        }

        return added;
    }

    private addVariable(variable: string): boolean {
        if(this.variables.has(variable)) {
            return false;
        }

        this.variables.add(variable);
        return true;
    }
}