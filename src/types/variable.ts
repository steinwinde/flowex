export class Variable {
    // name in the flow-meta
    readonly name: string;
    readonly isCollection: boolean;
    readonly type: string;

    constructor(name: string, type: string, isCollection: boolean) {
        this.name = name;
        this.type = type;
        this.isCollection = isCollection;
    }

    public getTypeComplete() : string {
        return this.isCollection ? `List<${this.type}>` : this.type;
    }
}