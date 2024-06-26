import { FlowCollectionSortOption } from "../../types/metadata.js";
import { ApexAssignment } from "../section/apex-assignment.js";
import { ApexClass } from "./apex-class.js";
import { ApexFor, apexFor } from "../section/apex-for.js";
import { ApexIfCondition } from "../section/apex-if-condition.js";
import { apexIf } from "../section/apex-if.js";
import { ApexSectionLiteral } from "../section/apex-section-literal.js";
import { ApexSection } from "../section/apex-section.js";
import { ApexVariable, VAR_RESULT } from "../apex-variable.js";
import { ApexLeftHand } from "../section/apex-left-hand.js";
import { ApexRightHand } from "../section/apex-right-hand.js";

export class ApexComparableClass extends ApexClass {

    private v: string = '';
    private readonly objName: string;
    private comp: string[] = [];
    private ind: string[] = [];

    constructor(objName: string) {
        super(objName + 'Wrapper', 'public');
        this.objName = objName;
    }

    registerSortOptions(v: string, sortOptions: Array<FlowCollectionSortOption>): ApexComparableClass {
        this.v = v;
        for (const opt of sortOptions) {
            this.comp.push(`${v}.${opt.sortField} > compareTo.${v}.${opt.sortField}`);
            this.ind.push(opt.sortOrder[0] === 'Asc' ? '1' : '-1');
        }

        return this;
    }

    getMethod(ref: string, limit?: number[]) : ApexSection {
        let secondFor : ApexFor | undefined;
        const apexVariableWrapperList = new ApexVariable('wrapperList');
        const apexVariableRef = new ApexVariable(ref);
        const apexVariableItem = new ApexVariable('item');
        if(limit) {
            if (limit[0] > 0) {
                const body = `${ref}.add(wrapperList[i].${this.v});`;
                const apexSectionLiteral = new ApexSectionLiteral(body)
                    .registerVariable(apexVariableRef)
                    .registerVariable(apexVariableWrapperList);
                secondFor = apexFor().lt('wrapperList.size()').andLt(limit[0]).set(apexSectionLiteral);
            } else {
                const body = `${ref}.add(item.${this.v});`;
                const apexSectionLiteral = new ApexSectionLiteral(body)
                    .registerVariable(apexVariableRef)
                    .registerVariable(apexVariableItem);
                secondFor = apexFor().item(this.name).items('wrapperlist').set(apexSectionLiteral);
            }
        }

        const body = `wrapperList.add(new ${this.name}(item));`;
        const apexSectionLiteral = new ApexSectionLiteral(body)
                    .registerVariable(apexVariableWrapperList)
                    .registerVariable(apexVariableItem);
        const firstFor = apexFor().item(this.objName).items(ref).set(apexSectionLiteral);

        const body1 = `List<${this.name}> wrapperList = new List<${this.name}>();`;
        const apexSectionLiteral1 = new ApexSectionLiteral(body1)
                    .registerVariable(apexVariableWrapperList);

        const body2 = `wrapperList.sort();` + NL + `${ref}.clear();`;
        const apexSectionLiteral2 = new ApexSectionLiteral(body2)
                    .registerVariable(apexVariableWrapperList)
                    .registerVariable(apexVariableRef);

        const result = new ApexSection().addSection(apexSectionLiteral1)
            .addSection(firstFor)
            .addSection(apexSectionLiteral2);

        // TODO: Not sure if this is not somehow always necessary
        if(secondFor) result.addSection(secondFor);

        return result;
    }

    protected buildOutput(): string {

        // const ifBodyString = `result = ${this.ind[0]};`
        // TODO: Do I miss variables here?
        const ifCondition = new ApexIfCondition().setString(this.comp[0], []);
        const apexLeftHand = new ApexLeftHand(VAR_RESULT, [new ApexVariable(VAR_RESULT)]);
        const apexRightHand = new ApexRightHand(this.ind[0], [new ApexVariable(this.ind[0])]);
        const ifBody = new ApexAssignment(apexLeftHand, apexRightHand);
        const ifStatement = apexIf().if(ifCondition, ifBody);
        for (let i = 2; i < this.comp.length; i++) {
            // should the "ind[0]" not be "ind[i]"?
            const ifConditionElse = new ApexIfCondition().setString(this.comp[i], []);
            ifStatement.if(ifConditionElse, ifBody);
        }

        const body = `public class ${this.name} implements Comparable {
${this.objName} ${this.v};
public ${this.name}(${this.objName} ${this.v}) {
this.${this.v} = ${this.v};
}
public Integer compareTo(Object obj) {
${this.name} compareTo = (${this.name}) obj;
Integer result = 0;
${ifStatement.build()}
return result;
}
}`;

        return body;
    }

    protected getReady(): void {
        // nothing to do
    }
}