/* eslint-disable no-new */
import { SimpleMethod } from './simple-method.js';
import { Variable } from './simple-variable.js';
import { PurelyLocal } from './strategy0.js';
import { SharedWithConstructor } from './strategy1.js';
import { SharedUse } from './strategy2.js';

/**
 * Determine...
 * - which Apex variables are global and which are local (as long as this is not decided, keep flat undefined),
 * - where they are declared,
 * - when they are passed into methods and
 * - where their value is returned by a method.
 *
 * NOTE: None of this is speed optimized. Significant portions are redundant.
 * The implementation is meant to
 * - be as readable as possible;
 * - facilitate each functionality can be tested separately;
 * - facilitate bug fixes and improvements that can be made in isolation and simple.
 */
export class Parametrization {
  /** methods to be considered, incl. run method, but not incl. constructor */
  private methods: SimpleMethod[];

  /** variables necessarily defined in constructor */
  private constructorVars: Variable[];

  public constructor(methods: SimpleMethod[], constructorVars: Variable[]) {
    this.methods = methods;
    this.constructorVars = constructorVars;
    this.run();
  }

  private run(): void {
    new PurelyLocal(this.methods, this.constructorVars);
    if (this.allIsWell()) return;
    new SharedWithConstructor(this.methods, this.constructorVars);
    if (this.allIsWell()) return;
    new SharedUse(this.methods, this.constructorVars);
  }

  private allIsWell(): boolean {
    for (const method of this.methods) {
      for (const variableInfo of method.variableInfos) {
        if (variableInfo.v.g === undefined) {
          return false;
        }
      }
    }

    return true;
  }
}
