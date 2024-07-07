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

    // records all variables needed by this section, e.g. by the method or an if-condition;
    // key is variable name
    private apexVariableInfos = new Map<string, ApexVariableInfo>();

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

    // protected buildWithBody(body: string): string {
    //     const part = this.build();
    //     if(part.length > 0 && body) {
    //         return body + NL + part;
    //     }

    //     return body ?? part;
    // }

    build(): string {
        return this.getBuiltSections().join(NL);
    }

    protected getBuiltSections(): Array<string> {
        const sections : Array<string> = this.sections.map(section => {
            if (typeof section !== 'string') {
                // executes the build method of the section or the extension build
                return section.build();
            }

            return section;
        });

        return sections;
    }

    // fully-fledged variables only (i.e. with type); e.g. in case of Apex methods there 
    // have to be variables that are necessarily method local - and they might come from
    // apexSectionLiterals; we can't declare them globally first; therefore some of the 
    // provided variables would have to be fully-fledged anyway; sections and its derivatives
    // are kept free from Knowledge, MainClass variable awareness etc.
    protected addVariable(apexVariable: ApexVariable, use: VariableUse): boolean {
        // TODO: For testing purposes only
        if(!apexVariable.hasApexType()) {
            // Whereas on class level registered variables must be comprehensively declared (e.g. with a type),
            // on section level variables must be referred to by their name only, like shells. Their
            // true identity is retrieved later.
            throw new Error('Apex type missing of variable: ' + apexVariable.getName());
        }

        const priorUse = this.apexVariableInfos.get(apexVariable.getName());
        // Write overwrites Read
        if(priorUse === undefined || use === VariableUse.Write) {
            const apexVariableInfo = new ApexVariableInfo(apexVariable, use);
            this.apexVariableInfos.set(apexVariable.getName(), apexVariableInfo);
            return true;
        }

        return false;
    }

    protected addVariableInfo(apexVariableInfo: ApexVariableInfo): boolean {
        const priorUse = this.apexVariableInfos.get(apexVariableInfo.getApexVariable().getName());
        // Write overwrites Read
        if(priorUse === undefined || apexVariableInfo.getUse() === VariableUse.Write) {
            this.apexVariableInfos.set(apexVariableInfo.getApexVariable().getName(), apexVariableInfo);
            return true;
        }

        return false;
    }

    protected resolveVariablesOfPart(variables: Map<string, ApexVariableInfo>): void {
        for(const value of variables.values()) {
            this.addVariable(value.getApexVariable(), value.getUse());
        }
    }

    // protected addVariables(apexVariableInfos: Array<ApexVariable>): void {
    //     for(const apexVariable of apexVariableInfos) {
    //         const found = this.apexVariableInfos.find((variable) => variable.getName() === apexVariable.getName());
    //         if(!found) {
    //             this.apexVariableInfos.push(apexVariable);
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

        return this.apexVariableInfos;
    }

    protected getVariableInfos(): Map<string, ApexVariableInfo> {
        return this.apexVariableInfos;
    }
}