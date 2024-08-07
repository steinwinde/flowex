import { FlowStart } from '../../types/metadata.js';
import { soql } from '../../result-builder/soql/soql-query.js';
import { SoqlWhere } from '../../result-builder/soql/soql-where.js';
import { ApexVariable } from '../../result-builder/apex-variable.js';

export function getStart(start: FlowStart): void {
  if (start.scheduledPaths) {
    // knowledge.programmer.addClassComment('// Scheduled paths not yet supported, ignored');
  }

  if (start.filters) {
    const apexVariables = new Array<ApexVariable>();
    const soqlWhere = new SoqlWhere(start.filters, start.filterLogic, apexVariables);
    const where = soqlWhere.build();
    const obj: string = start.object[0];
    const soqlStatement = soql().select('Id').from(obj).where(where).build();
    const comment = `TODO: Add a WHERE clause like in the following SELECT to the query that populates the records passed into the class:
// ${soqlStatement};
`;
    knowledge.builder.getMainClass().registerClassComment(comment);
  }
}
