// String utils

export function esc(s: string) : string {
    if (typeof s === 'string') {
        // 2024
        // const re = /'/g;
        // return s.replace(re, '\\\'');
        const re = /'/g
        return s.replaceAll(re, '\\\'');
    }

    return s;
}

// TODO: unused (but tested)
export function escM(sar: string[]): string[] {
    return sar.map(e =>
        (typeof e === 'string' ? esc(e) : e),
    );
}

/** Makes characters after blanks upper case and a few other things 
 * @param s The string to be transformed
 * @param upperCase If the first character should be upper case
 * @returns The transformed string
*/
export function camelize(s: string, upperCase: boolean) : string {
    // 2024
    // s = s.replace(/(^\w)|([\s_-]\w)/g, match => match.toUpperCase());
    s = s.replaceAll(/(^\w)|([\s_-]\w)/g, match => match.toUpperCase());
    // remove spaces, single quotes and underscores, replace UNICODE composed characters by ASCII, remove non-ASCII
    // s = s.replace(/[ '_]/g, '').normalize('NFKD').replace(/[^\u0000-\u007F]/g, '');
    // eslint-disable-next-line no-control-regex
    s = s.replaceAll(/[ '_]/g, '').normalize('NFKD').replaceAll(/[^\u0000-\u007F]/g, '');
    return (upperCase ? s.charAt(0).toUpperCase() : s.charAt(0).toLowerCase()) + s.slice(1);
}

export function getUniqueName(plannedName: string, existingNames : Set<string>): string {
    let i = 1;
    let result = plannedName;
    while (existingNames.has(result)) {
        result = plannedName + i;
        i++;
        if(i > 1000) {
            throw new Error('getUniqueName: Threat of infinite loop while searching for unique name for ' + plannedName);
        }
    }

    return result;
}