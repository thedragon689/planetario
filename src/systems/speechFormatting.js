const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUPERSCRIPT_MINUS = '⁻';

function superscriptToSpeech(text) {
  return String(text).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (chunk) => {
    let value = '';
    for (const char of chunk) {
      if (char === SUPERSCRIPT_MINUS) value += '-';
      else {
        const idx = SUPERSCRIPT_DIGITS.indexOf(char);
        if (idx >= 0) value += idx;
      }
    }
    if (!value) return chunk;
    const normalized = value.startsWith('-') ? value : value.replace(/^\+/, '');
    return ` alla ${normalized}`;
  });
}

/**
 * Converte numeri in forma italiana (virgola decimale, punto migliaia) per la lettura TTS.
 */
export function formatNumbersForSpeech(text) {
  let output = String(text || '');

  // Decimali con virgola: 149,6 -> 149 virgola 6
  output = output.replace(/(\d+),(\d+)/g, '$1 virgola $2');

  // Migliaia con punto: 12.746 -> 12 746 (evita che TTS legga "punto")
  output = output.replace(/\b(\d{1,3}(?:\.\d{3})+)\b/g, (match) => match.replace(/\./g, ' '));

  return output;
}

/**
 * Adatta testo catalogo/narrazione alla pronuncia italiana naturale.
 */
export function formatTextForSpeech(text) {
  let output = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!output) return '';

  output = formatNumbersForSpeech(output);
  output = superscriptToSpeech(output);

  const replacements = [
    [/(\d)\s*km\b/gi, '$1 kilometri'],
    [/\bkm\b/gi, 'kilometri'],
    [/(\d)\s*kg\b/gi, '$1 chilogrammi'],
    [/\bkg\b/gi, 'chilogrammi'],
    [/\bm\/s\b/gi, 'metri al secondo'],
    [/\bm\s*s\b/gi, 'metri al secondo'],
    [/\bUA\b/g, 'unità astronomiche'],
    [/°C/g, ' gradi Celsius'],
    [/(\d)\s*%\b/g, '$1 per cento'],
    [/\s×\s*/g, ' per '],
    [/(\d)\s*milioni\s+kilometri\b/gi, '$1 milioni di kilometri'],
    [/(\d)\s+miliardi\s+kilometri\b/gi, '$1 miliardi di kilometri'],
    [/\(medio\)/gi, ', di diametro medio'],
    [/\s+\/\s+/g, ' su '],
  ];

  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }

  return output.replace(/\s+/g, ' ').trim();
}
