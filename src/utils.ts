// String utils

export function esc(s: string): string {
  if (typeof s === 'string') {
    // 2024
    // const re = /'/g;
    // return s.replace(re, '\\\'');
    const re = /'/g;
    return s.replaceAll(re, "\\'");
  }

  return s;
}

export function strFormat(sar: string[], separator: string): string {
  let result = sar[0];
  const count = countOccurences(result);
  for (let i = 1; i <= count; i++) {
    result = result.replace('%s', sar[i]);
  }

  for (let i = 1 + count; i < sar.length; i++) {
    result += separator + sar[i];
  }

  return result;
}

export function countOccurences(s: string): number {
  return s.split('%s').length - 1;
}

// TODO: unused (but tested)
export function escM(sar: string[]): string[] {
  return sar.map((e) => (typeof e === 'string' ? esc(e) : e));
}

/**
 * Makes characters after blanks upper case and a few other things
 *
 * @param s The string to be transformed
 * @param upperCase If the first character should be upper case
 * @returns The transformed string
 */
export function camelize(s: string, upperCase: boolean): string {
  let result = s.replaceAll(/(^\w)|([\s_-]\w)/g, (match) => match.toUpperCase());
  // eslint-disable-next-line no-control-regex
  result = result
    .replaceAll(/[ '_]/g, '')
    .normalize('NFKD')
    // eslint-disable-next-line no-control-regex
    .replaceAll(/[^\u0000-\u007F]/g, '');
  return (upperCase ? result.charAt(0).toUpperCase() : result.charAt(0).toLowerCase()) + result.slice(1);
}

export function getUniqueName(plannedName: string, existingNames: Set<string>): string {
  let i = 1;
  let result = plannedName;
  while (existingNames.has(result)) {
    result = plannedName + i;
    i++;
    if (i > 1000) {
      throw new Error('getUniqueName: Threat of infinite loop while searching for unique name for ' + plannedName);
    }
  }

  return result;
}
