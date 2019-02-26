const unescapeMap = {
  '&amp;': '&',
  '&nbsp;': '\u00A0',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#x60;': '`',
};

const createEscaper = (map) => {
  const escaper = (match) => map[match];

  const source = '(?:' + Object.keys(map).join('|') + ')';
  const testRegexp = RegExp(source);
  const replaceRegexp = RegExp(source, 'g');
  return (string) => {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
};

export default createEscaper(unescapeMap);