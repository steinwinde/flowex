import { ApexSection } from "./apex-section.js";
import { ApexVariableInfo } from "../apex-variable-info.js";
import { VAR_E } from "../apex-variable.js";

export class ApexTry extends ApexSection {

    private tryBlock: ApexSection | undefined = undefined;
    private catchBlock: ApexSection | undefined = undefined;

    addTryBlock(tryBlock: ApexSection | undefined): ApexTry {
        this.tryBlock = tryBlock;

        return this;
    }

    addCatchBlock(catchBlock: ApexSection): ApexTry {
        this.catchBlock = catchBlock;

        return this;
    }

    build(): string {
        let body = 'try {';

        const tryBlock = this.tryBlock?.build() ?? '';
        if (tryBlock) {
            body += NL + tryBlock + NL;
        }

        const catchBlock = this.catchBlock?.build() ?? '';
        if (catchBlock) {
            // TODO: Does it make sense to always return from the catch?
            body += '} catch(Exception ' + VAR_E + ') {' + NL + catchBlock + NL + 'return;' + NL + '}';
        }

        // return super.buildWithBody(body);
        return body;
    }

    resolveVariables() : Map<string, ApexVariableInfo> {

        if(this.tryBlock) {
            this.resolveVariablesOfPart(this.tryBlock.resolveVariables());
        }

        if(this.catchBlock) {
            this.resolveVariablesOfPart(this.catchBlock.resolveVariables());
        }

        // this might also add variables from sections added after the catch block, e.g. apexAssignments
        return super.resolveVariables();
    }
}