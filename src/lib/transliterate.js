const CYRILLIC_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
}

// Простая фонетическая транслитерация кириллицы в латиницу (например, для
// городов, которых геокодер Aladhan не распознаёт в кириллице).
export function transliterate(str) {
  return [...str]
    .map((char) => {
      const lower = char.toLowerCase()
      const mapped = CYRILLIC_TO_LATIN[lower]
      if (mapped === undefined) return char
      return char === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1)
    })
    .join('')
}

// Фонетическая транслитерация названий стран часто не совпадает с их
// официальным английским названием (Россия → "Rossiya", а не "Russia"),
// поэтому для частых стран используем явный словарь.
const COUNTRY_NAME_TO_ENGLISH = {
  россия: 'Russia',
  казахстан: 'Kazakhstan',
  узбекистан: 'Uzbekistan',
  таджикистан: 'Tajikistan',
  киргизия: 'Kyrgyzstan',
  кыргызстан: 'Kyrgyzstan',
  азербайджан: 'Azerbaijan',
  беларусь: 'Belarus',
  украина: 'Ukraine',
  турция: 'Turkey',
}

export function toLatinCountryName(country) {
  const known = COUNTRY_NAME_TO_ENGLISH[country.trim().toLowerCase()]
  return known ?? transliterate(country)
}
