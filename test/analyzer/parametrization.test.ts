/* eslint-disable no-new */
/* eslint-disable perfectionist/sort-objects */
// mocha --forbid-only -p test\extractor\traversals\parametrization.test.ts
// mocha --forbid-only -p test\extractor\traversals\parametrization.test.ts -- --grep "_B"
import { TOP_METHOD } from "../../src/result-builder/section/apex-method.js";
import {equal, ok, strictEqual} from 'node:assert';

import {Parametrization} from '../../src/analyzer/parametrization.js';
import { SimpleMethod } from '../../src/analyzer/simple-method.js';
import { Variable } from '../../src/analyzer/simple-variable.js';
import { VariableInfo } from '../../src/analyzer/simple-variable-info.js';

describe('Test Method Parametrization for a single (run, top-level) method', () => {
    it('_A Single method with 3 variables, none in constructor', () => {

        const methods = new Array<SimpleMethod>();
        const a : Variable = {s: 'A'};
        const b : Variable = {s: 'B'};
        const c : Variable = {s: 'C'};
        const aVarInfo : VariableInfo = {v: a, u: false};
        const bVarInfo : VariableInfo = {v: b, u: false};
        const cVarInfo : VariableInfo = {v: c, u: false};
        methods.push(new SimpleMethod(TOP_METHOD, [], [aVarInfo, bVarInfo, cVarInfo]));
        
        new Parametrization(methods, []);

        equal(methods.length, 1, 'The same methods are received');
        equal(methods[0].name, TOP_METHOD, 'The method has the same name');
        equal(methods[0].returnVar, undefined, 'The method must not have a return value');
        equal(methods[0].parameterVars.length, 0, 'The method has no parameter variables');
        equal(methods[0].variableInfos[0].v.g, false, 'Variable A must not be global');
        ok(aVarInfo.d, 'Variable must be declared in the method');
        ok(bVarInfo.d, 'Variable must be declared in the method');
        ok(cVarInfo.d, 'Variable must be declared in the method');
    });

    it('_B Single method with 3 only read variables, 2 shared with constructor', () => {

        const methods = new Array<SimpleMethod>();
        const a : Variable = {s: 'A'};
        const b : Variable = {s: 'B'};
        const c : Variable = {s: 'C'};
        const x : Variable = {s: 'X'};
        const aVarInfo : VariableInfo = {v: a, u: false};
        const bVarInfo : VariableInfo = {v: b, u: false};
        const cVarInfo : VariableInfo = {v: c, u: false};
        methods.push(new SimpleMethod(TOP_METHOD, [], [aVarInfo, bVarInfo, cVarInfo]));
        
        new Parametrization(methods, [b, x, a]);

        equal(methods[0].parameterVars.length, 2, 'The method must get 2 parameter variables');
        equal(methods[0].returnVar, undefined, 'The method must not have a return value');
        strictEqual(a.g, false, 'Variable A must not be global');
        strictEqual(b.g, false, 'Variable B must not be global');
        strictEqual(c.g, false, 'Variable C must not be global');
        strictEqual(aVarInfo.d, false, 'Variable A must not be declared in the method, it is shared with constructor');
        strictEqual(bVarInfo.d, false, 'Variable B must not be declared in the method, it is shared with constructor');
        ok(cVarInfo.d, 'Variable C must be declared in the method');
    });

    it('_C Single method with 1 re-assigned variable, this one shared with constructor', () => {

        const methods = new Array<SimpleMethod>();
        const a : Variable = {s: 'A'};
        const x : Variable = {s: 'X'};
        const aVarInfo : VariableInfo = {v: a, u: true};
        methods.push(new SimpleMethod(TOP_METHOD, [], [aVarInfo]));
        
        new Parametrization(methods, [x, a]);

        equal(methods[0].parameterVars.length, 1, 'The method must get 1 parameter variable');
        equal(methods[0].returnVar, a, 'The method has a return variable "a"');
        strictEqual(a.g, false, 'Variable A must not be global');
        strictEqual(aVarInfo.d, false, 'Variable A must not be declared in the method, it is shared with constructor');
    });

    it('_D Single method with 2 re-assigned variables, both shared with constructor', () => {

        const methods = new Array<SimpleMethod>();
        const a : Variable = {s: 'A'};
        const b : Variable = {s: 'B'};
        const x : Variable = {s: 'X'};
        const aVarInfo : VariableInfo = {v: a, u: true};
        const bVarInfo : VariableInfo = {v: b, u: true};
        methods.push(new SimpleMethod(TOP_METHOD, [], [aVarInfo, bVarInfo]));
        
        new Parametrization(methods, [x, a, b]);

        equal(methods[0].parameterVars.length, 1, 'The method must get 1 parameter variable "a"');
        equal(methods[0].returnVar, a, 'The method must have a return variable "a", "b" must be global.');
        strictEqual(a.g, false, 'Variable a must not be global');
        strictEqual(b.g, true, 'Variable B must be global');
        strictEqual(aVarInfo.d, false, 'Variable A must not be declared in the method, it is shared with constructor');
        strictEqual(bVarInfo.d, false, 'Variable B must not be declared in the method, it is shared with constructor');
    });
});
