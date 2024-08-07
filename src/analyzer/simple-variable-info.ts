import { Variable } from './simple-variable.js';

export type VariableInfo = {
  // in
  /** Held variable */
  v: Variable;
  /** "usage": Variable is assigned, i.e. must be defined in the same method or must be returned */
  u: boolean;

  // out
  /** Variable must be declared/initialized in the method holding this VariableInfo */
  d?: boolean;
};
