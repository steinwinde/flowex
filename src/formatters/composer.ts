import { PathFinder } from './pathfinder.js';

const TAB_LENGTH = 4;

export default function getOverall(): Map<string, string> {
  const p: PathFinder = new PathFinder();
  p.walk();

  const result = knowledge.builder.build();
  for (const [name, content] of result) {
    result.set(name, indent(content));
  }

  return result;
}

// TODO: remove consecutive empty lines
function indent(text: string): string {
  // TODO: find out why this apparently removes CR too - at least they never appear in the result cls
  const sar: string[] = text.split(global.NL);
  let result = '';
  let ind = 0;
  for (const s of sar) {
    if (s === ');' || s === '}') {
      ind--;
    }

    result +=
      s.startsWith('} else') || s.startsWith('} catch(')
        ? ' '.repeat((ind - 1) * TAB_LENGTH) + s + global.NL
        : ' '.repeat(ind * TAB_LENGTH) + s + global.NL;

    if ((!s.startsWith('}') && s.endsWith('{')) || s.endsWith('(')) {
      ind++;
    }
  }

  result = result.trim();
  return result;
}
