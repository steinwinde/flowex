import { ApexClass } from './apex-class.js';

export class ApexTypeClass extends ApexClass {
  public constructor(name: string) {
    super(name, 'private');
  }

  protected buildOutput(): string {
    // TODO: this is hardly what we need
    return `private class ${this.name} {}`;
  }

  // eslint-disable-next-line class-methods-use-this
  protected getReady(): void {
    // nothing to do
  }
}
