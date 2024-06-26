import { ApexComment } from "../../result-builder/section/apex-comment.js";
import { ApexSectionLiteral } from "../../result-builder/section/apex-section-literal.js";
import { ApexSection } from "../../result-builder/section/apex-section.js";
import { FlowCustomError } from "../../types/metadata.js";

export function getCustomErrors(flowCustomErrors: FlowCustomError): ApexSection {
    const message = flowCustomErrors.customErrorMessages[0].errorMessage[0]
        .replaceAll('\'', '\\\'')
        .replaceAll('\n', '\\n');
    const apexComment = new ApexComment('TODO: Replace formula expressions as necessary');
    const apexSectionLiteral = new ApexSectionLiteral(`record.addError('${message}');`);
    return new ApexSection().addSections([apexComment, apexSectionLiteral]);
    // return `// TODO: Replace formula expressions as necessary
// record.addError('${message}');`
}