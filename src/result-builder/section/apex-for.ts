import { ApexSection } from "./apex-section.js";

export class ApexFor extends ApexSection {

    // TODO: Variables hardcoded in this class are not tracked. This can produce name collisions. Currently this is 
    // the responsibility of the caller.

    // iteration over object items
    private itemName : null | string = null;
    private itemObject = 'item';
    private itemNames : null | string = null;

    // iteration over Integers
    private counterVariable: string = 'i';
    private assignment: string = '0';
    private condition: string | undefined = undefined;
    private crement: string = '++';

    // body of the for loop
    private body = new Array<ApexSection>();

    // ----------------------------------------------------------------------------------------------------------------
    // configuration for an iteration over object items
    // ----------------------------------------------------------------------------------------------------------------

    item(name : string) : ApexFor {
        this.itemName = name;
        return this;
    }

    itemInstance(name : string) : ApexFor {
        this.itemObject = name;
        return this;
    }

    items(names : string) : ApexFor {
        this.itemNames = names;
        return this;
    }

    // ----------------------------------------------------------------------------------------------------------------
    // configuration for an iteration over Integers
    // ----------------------------------------------------------------------------------------------------------------

    i(assignment : number | string) : ApexFor {
        this.assignment = typeof assignment === 'string' ? assignment : assignment.toString();
        return this;
    }

    j(assignment : number | string) : ApexFor {
        this.counterVariable = 'j';
        this.assignment = typeof assignment === 'string' ? assignment : assignment.toString();
        return this;
    }

    gtEq(condition : number | string) : ApexFor {
        this.condition = '>=' + condition;
        return this;
    }

    ltEq(condition : number | string) : ApexFor {
        this.condition = '<=' + condition;
        return this;
    }

    gt(condition : number | string) : ApexFor {
        this.condition = '>' + condition;
        return this;
    }

    lt(condition : number | string) : ApexFor {
        this.condition = '<' + condition;
        return this;
    }

    andLt(condition : number | string) : ApexFor {
        this.condition += ' && ' + this.counterVariable + '<' + condition;
        return this;
    }

    decrement() : ApexFor {
        this.crement = '--';
        return this;
    }

    // ----------------------------------------------------------------------------------------------------------------
    // body of the for loop
    // ----------------------------------------------------------------------------------------------------------------

    set(body : ApexSection | Array<ApexSection> | undefined) : ApexFor {
        if(!body) return this;
        this.body = Array.isArray(body) ? body : [body];
        
        return this;
    }

    build() : string {
        const body = this.getBody();
        // return super.buildWithBody(this.getBody());

        const additionalBody = super.build();
        if(body && additionalBody) {
            return body + NL + additionalBody;
        }

        return body ?? additionalBody;
    }

    private getBody() : string {
        // Can not happen, actually
        if(!this.body) return '';
        
        let body = this.body.map(section => section.build()).join(global.NL);

        if(body.length > 0) {
            body = global.NL + body + global.NL;
        }

        if(this.itemName) {
            const result = `for(${this.itemName} ${this.itemObject}: ${this.itemNames}) {${body}}`;
            return result;
        }

        const result = `for(Integer ${this.counterVariable}=${this.assignment}; ${this.counterVariable}${this.condition}; ${this.counterVariable}${this.crement}) {${body}}`;
        return result;
    }
}

export function apexFor() : ApexFor {
    return new ApexFor();
}