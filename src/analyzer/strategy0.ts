import { SimpleMethod } from './simple-method.js';
import { Variable } from './simple-variable.js';

/**
 * Find variables used in the constructor and mark them as not to be declared in any method.
 *
 * Find variables used in a single method and not in the constructor. Mark them as local and indicate
 * the method in which they are to be declared.
 */
export class PurelyLocal {
  /** methods to be considered, incl. method called by constructor, but not constructor itself */
  private methods: SimpleMethod[];

  /** names of variables not considered as a result */
  private impossibleVariables = new Set<string>();

  public constructor(methods: SimpleMethod[], constructorVars: Variable[]) {
    this.methods = methods;
    // constructor variables cannot be purely local to a method
    for (const constructorVar of constructorVars) {
      this.impossibleVariables.add(constructorVar.s);
    }

    this.run();
  }

  private run(): void {
    this.markConstructorVariablesAsAlreadyInitialized();
    this.populateImpossibleVariables();
    this.markVariablesAsLocal();
  }

  /**
   * Mark variables that are used in the constructor as already initialized in all methods. This doesn't decide,
   * if the variable is global or local.
   */
  private markConstructorVariablesAsAlreadyInitialized(): void {
    for (const method of this.methods) {
      for (const variableInfo of method.variableInfos.filter((v) => v.v.g === undefined)) {
        if (this.impossibleVariables.has(variableInfo.v.s)) {
          variableInfo.d = false;
        }
      }
    }
  }

  /**
   * Mark variables that are used in a single method as local and indicate the method in which they are to be
   * initialized.
   */
  private markVariablesAsLocal(): void {
    for (const method of this.methods) {
      for (const variableInfo of method.variableInfos.filter((v) => v.v.g === undefined)) {
        if (!this.impossibleVariables.has(variableInfo.v.s)) {
          variableInfo.d = true;
          variableInfo.v.g = false;
        }
      }
    }
  }

  private populateImpossibleVariables(): void {
    const m = new Map<string, string>();
    for (const method of this.methods) {
      for (const variableInfo of method.variableInfos.filter((v) => v.v.g === undefined)) {
        if (!this.impossibleVariables.has(variableInfo.v.s)) {
          const priorMethodName = m.get(variableInfo.v.s);
          if (priorMethodName === undefined) {
            m.set(variableInfo.v.s, method.name);
          } else if (priorMethodName !== method.name) {
            this.impossibleVariables.add(variableInfo.v.s);
          }
        }
      }
    }
  }
}
