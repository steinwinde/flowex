// used also by condition-builder
export function concatFilters(wheres: string[], filterLogic: string) : string {
    if (filterLogic.includes('1')) {
        // filterLogic e.g. '(1 AND 2) OR 3'
        // can contain AND, OR, NOT
        let result: string = filterLogic.replaceAll(/(\d)/g, '_W$&W_');
        for (const [i, where] of wheres.entries()) {
            const s: string = Number(1 + i).toString();
            const regexp = new RegExp('_W' + s + 'W_', 'g');
            result = result.replace(regexp, where);
        }

        return result;
    }

    // filterLogic 'and' or 'or' (or something else?!)
    const u: string = filterLogic.toUpperCase();
    return wheres.join(` ${u} `);
}
