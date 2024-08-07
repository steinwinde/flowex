export class Variable {
  // name in the flow-meta
  public readonly name: string;
  public readonly isCollection: boolean;
  public readonly type: string;

  public constructor(name: string, type: string, isCollection: boolean) {
    this.name = name;
    this.type = type;
    this.isCollection = isCollection;
  }

  public getTypeComplete(): string {
    return this.isCollection ? `List<${this.type}>` : this.type;
  }
}
