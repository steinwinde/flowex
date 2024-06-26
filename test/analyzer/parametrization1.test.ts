/* eslint-disable no-new */
/* eslint-disable perfectionist/sort-objects */
// mocha --forbid-only -p test\extractor\traversals\parametrization1.test.ts
// mocha --forbid-only -p test\extractor\traversals\parametrization1.test.ts -- --grep "_B"
import {equal, ok} from 'node:assert';

import { TOP_METHOD } from "../../src/result-builder/section/apex-method.js";
import {Parametrization} from '../../src/analyzer/parametrization.js';
import { SimpleMethod } from '../../src/analyzer/simple-method.js';
import { Variable } from '../../src/analyzer/simple-variable.js';
import { VariableInfo } from '../../src/analyzer/simple-variable-info.js';

describe('Test Method Parametrization for a run method and two other methods', () => {

    it('_A run method, 2 child methods of the run method; diverse sharing of read and re-assigned variables', () => {

        const methods = new Array<SimpleMethod>();
        const a : Variable = {s: 'A'};
        const b : Variable = {s: 'B'};
        const c : Variable = {s: 'C'};
        const runAVarInfo : VariableInfo = {v: a, u: false};
        const runBVarInfo : VariableInfo = {v: b, u: true};
        const runCVarInfo : VariableInfo = {v: c, u: false};
        const xAVarInfo : VariableInfo = {v: a, u: false};
        const xBVarInfo : VariableInfo = {v: b, u: true};
        const xCVarInfo : VariableInfo = {v: c, u: true};
        const yAVarInfo : VariableInfo = {v: a, u: false};
        const yBVarInfo : VariableInfo = {v: b, u: false};
        const yCVarInfo : VariableInfo = {v: c, u: false};

        const run = new SimpleMethod(TOP_METHOD, [], [runAVarInfo, runBVarInfo, runCVarInfo]);
        const xMethod = new SimpleMethod('doX', [run], [xAVarInfo, xBVarInfo, xCVarInfo]);
        const yMethod = new SimpleMethod('doY', [run], [yAVarInfo, yBVarInfo, yCVarInfo]);

        methods.push(run, xMethod, yMethod);
        
        new Parametrization(methods, [a]);

        // test top-level method
        equal(methods[0].parameterVars.length, 1, 'The method has 1 parameter: constructor variable a');
        equal(methods[0].returnVar, null, 'The top-level method never returns a variable');
        equal(runAVarInfo.d, false, 'Variable A must not be declared in the method, it is shared with constructor');
        ok(runAVarInfo.d, 'Variable A must be declared in the method, it is not shared with constructor');
        ok(runBVarInfo.d, 'Variable B must be declared in the method, it is not shared with constructor');
        equal(runCVarInfo.d, false, 'Variable C must not be declared in the method, it is not shared with constructor, but global');

        // test child method X
        equal(methods[1].parameterVars.length, 3, 'The method has 3 parameters: A, B and C');
        equal(methods[1].returnVar, b, 'The method has one return variable b (re-assigned)');
        equal(b.g, false, 'Variable B must not be global, it is returned');
        equal(c.g, true, 'Variable C must be global, it is re-assigned and b is already returned by the X method');
        equal(xAVarInfo.d, false, 'Variable A must not be declared in the method, it is already declared in run method');
        equal(xBVarInfo.d, false, 'Variable B must not be declared in the method, it is already declared in run method');
        equal(xCVarInfo.d, false, 'Variable C must not be declared in the method, it is global');

        // test child method Y
        equal(methods[2].parameterVars.length, 3, 'The method has 3 parameters: A, B and C');
        equal(methods[2].returnVar, 'C', 'The method has no return variable, nothing is re-assigned');
        equal(yAVarInfo.d, false, 'Variable A must not be declared in the method, it is already declared in run method');
        equal(yBVarInfo.d, false, 'Variable B must not be declared in the method, it is already declared in run method');
        equal(yCVarInfo.d, false, 'Variable C must not be declared in the method, it is global');
    });
});
