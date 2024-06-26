export class SoqlQuery {
    private fields = new Array<string>();
    private sObject: null | string = null;
    private wherePart: null | string = null;
    private orderByFields = new Array<string>();
    private limitPart: null | number = null;
    private exposedField: null | string = null;
    // we only support either ASC (default) OR DESC for all, not a mix
    private orientation: 'ASC' | 'DESC' = 'ASC';

    select(fields: string | string[]) : SoqlQuery {
        this.fields = typeof fields === 'string' ? [fields] : fields;
        return this;
    }

    from(sObject : string) : SoqlQuery {
        this.sObject = sObject;
        return this;
    }

    where(wherePart: string) : SoqlQuery {
        this.wherePart = wherePart;
        return this;
    }

    orderBy(orderByFields: string | string[], desc?: boolean) : SoqlQuery {
        this.orderByFields = typeof orderByFields === 'string' ? [orderByFields] : orderByFields;

        if(desc) {
            this.orientation = 'DESC';
        }

        return this;
    }

    limit(limitPart: number) : SoqlQuery {
        this.limitPart = limitPart;
        return this;
    }

    exposeField(field: string) : SoqlQuery {
        this.exposedField = field;
        return this;
    }

    build(): string {
        let query = 'SELECT ' + this.fields.join(', ') + ' FROM ' + this.sObject;
        if (this.wherePart) {
            query += ' WHERE ' + this.wherePart;
        }

        if (this.orderByFields.length > 0) {
            query += ' ORDER BY ' + this.orderByFields.join(` ${this.orientation}, `)
                + ` ${this.orientation}`;
        }

        if (this.limitPart) {
            query += ' LIMIT ' + this.limitPart;
        }

        query = '[' + query + ']';

        if (this.exposedField) {
            query += '.' + this.exposedField;
        }

        return query;
    }
}

export function soql() : SoqlQuery {
    return new SoqlQuery();
}