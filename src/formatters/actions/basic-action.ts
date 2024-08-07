// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface BasicAction {
  getBody(): string;

  // Every (specific type of) Action has its own list of parameters, which determines the
  // type of the parameter. There is no way to determine the type of a parameter from the
  // Flow definition itself. E.g. think of a right hand myAccount.Custom__c.

  // maps the name of the parameter to its type
  getParameterTypes(): Map<string, string>;
}
