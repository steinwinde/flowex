import { FlowStart } from '../../types/metadata.js';
import { getSoqlFromFilter } from '../translators/query-filter.js';

export function getStart(start: FlowStart): void {
  if (start.scheduledPaths) {
    // knowledge.programmer.addClassComment('// Scheduled paths not yet supported, ignored');
  }

  if (start.filters) {
    const query = getSoqlFromFilter(['Id'], start.object[0], start.filters, start.filterLogic);
    const soqlStatement = query.build();
    const comment = `TODO: Add a WHERE clause like in the following SELECT to the query that populates the records passed into the class:
// ${soqlStatement};
`;
    knowledge.builder.getMainClass().registerClassComment(comment);
  }
}
