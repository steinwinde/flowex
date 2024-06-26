import { Variable } from "./variable.js";

export class Parameter {
    // the argument of the call can diverge from the name of the parameter; e.g. an Action
    // can be called from inside of a loop over Contacts, the argument of each Action
    // call being the Id of the Contact (e.g. Action "Email Alert")
    public name: string;
    public argument: string;
    public type: string | undefined;
    constructor(name: string, argument: string, type?: string) {
        this.name = name;
        this.argument = argument;
        this.type = type;
    }

    // to use with var2type
    private getParameterMended(var2type: Map<string, Variable>) : string {
        if (!this.type) {
            this.type = var2type.get(this.name)?.getTypeComplete();
        }

        return this.type + ' ' + this.name;
    }

    public static getAsStringMended(parameters: Parameter[], var2type: Map<string, Variable>): string {
        const ar: string[] = [];
        for (const p of parameters) {
            const s: string = p.getParameterMended(var2type);
            ar.push(s);
        }

        return ar.join(', ');
    }
}
