import { ApexVariable } from "../apex-variable.js";
import { ApexVariableInfo } from "../apex-variable-info.js";

/**
     * Indicates the use of a variable in a section.
     * 
     * For an object, "Read" means the object is read or updated, but 
     * not re-assigned. "Write" means the object is re-assigned. 
     * 
     * For a primitive, "Read" means the object is read, 
     * "Write" means the object is re-assigned.
     */
export enum VariableUse {Read, Write}

/**
 * Represents a section of Apex code, e.g. a method or an if-condition; at its smallest level it is a string or
 * the smallest entity that can hold variables, e.g. the left hand side of an assignment.
 * ApexSections are nested, e.g. an ApexMethod can contain an ApexIfCondition.
 */
export class ApexSection {

    // records all variables needed by this section, e.g. by the method or an if-condition; map is 
    // based on the variable name
    private apexVariables = new Map<string, ApexVariableInfo>();

    // Extending classes can add sections via the method, even strings
    private sections = new Array<ApexSection | string>();

    // only extending classes can write strings to the sections
    addSection(section: ApexSection): ApexSection {
        this.sections.push(section);

        return this;
    }

    // only extending classes can write strings to the sections
    addSections(sections: Array<ApexSection>): ApexSection {
        this.sections.push(...sections);

        return this;
    }

    // only extending classes can write strings to the sections
    protected addStringSection(section: string): ApexSection {
        this.sections.push(section);

        return this;
    }

    protected buildWithBody(body: string): string {
        const part = this.build();
        if(part.length > 0 && body) {
            return body + NL + part;
        }

        return body ?? part;
    }

    build(): string {

        const sections : Array<string> = this.sections.map(section => {
            if (typeof section !== 'string') {
                // executes the build method of the section or the extension build
                return section.build();
            }

            return section;
        });

        return sections.join(NL);
    }

    protected addVariable(apexVariable: ApexVariable, use: VariableUse): boolean {
        const priorUse = this.apexVariables.get(apexVariable.getName());
        // Write overwrites Read
        if(priorUse === undefined || use === VariableUse.Write) {
            const apexVariableInfo = new ApexVariableInfo(apexVariable, use);
            this.apexVariables.set(apexVariable.getName(), apexVariableInfo);
            return true;
        }

        return false;
    }

    protected addVariableInfo(apexVariableInfo: ApexVariableInfo): boolean {
        const priorUse = this.apexVariables.get(apexVariableInfo.getApexVariable().getName());
        // Write overwrites Read
        if(priorUse === undefined || apexVariableInfo.getUse() === VariableUse.Write) {
            this.apexVariables.set(apexVariableInfo.getApexVariable().getName(), apexVariableInfo);
            return true;
        }

        return false;
    }

    protected resolveVariablesOfPart(variables: Map<string, ApexVariableInfo>): void {
        for(const value of variables.values()) {
            this.addVariable(value.getApexVariable(), value.getUse());
        }
    }

    // protected addVariables(apexVariables: Array<ApexVariable>): void {
    //     for(const apexVariable of apexVariables) {
    //         const found = this.apexVariables.find((variable) => variable.getName() === apexVariable.getName());
    //         if(!found) {
    //             this.apexVariables.push(apexVariable);
    //         }
    //     }
    // }

    resolveVariables() : Map<string, ApexVariableInfo> {
        for (const section of this.sections) {
            if (typeof section !== 'string') {
                const apexVariableInfos = section.resolveVariables();
                for(const apexVariableInfo of apexVariableInfos.values()) {
                    // will only overwrite if the variable is written to
                    this.addVariable(apexVariableInfo.getApexVariable(), apexVariableInfo.getUse());
                }
            }
        }

        return this.apexVariables;
    }

    protected getVariableInfos(): Map<string, ApexVariableInfo> {
        return this.apexVariables;
    }
}