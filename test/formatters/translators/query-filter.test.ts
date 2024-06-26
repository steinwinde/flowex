import {equal} from 'node:assert';

import {concatFilters} from '../../../src/formatters/translators/query-filter.js';

// npm test --ignore-scripts -- --grep "concatFilters"
describe('concatFilters', () => {
    it('condition: 1 AND (2 OR 3)', () => {
        const ar = ['x==1', 'y!=2', 'z>42'];
        equal(concatFilters(ar, '1 AND (2 OR 3)'), 'x==1 AND (y!=2 OR z>42)');
    });

    it('condition: 1 OR (2 AND 4) OR (3 AND 4)', () => {
        const ar = ['a == "super"', 'x==1', 'y!=2', 'z>42'];
        equal(concatFilters(ar, '1 OR (2 AND 4) OR (3 AND 4)'), 'a == "super" OR (x==1 AND z>42) OR (y!=2 AND z>42)');
    });
});
