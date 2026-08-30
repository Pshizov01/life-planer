import { describe, it, expect } from 'vitest'
import { transliterate, toLatinCountryName } from './transliterate.js'

describe('transliterate', () => {
  it('transliterates a Russian city name to Latin', () => {
    expect(transliterate('Краснодар')).toBe('Krasnodar')
  })

  it('leaves already-Latin text unchanged', () => {
    expect(transliterate('Krasnodar')).toBe('Krasnodar')
  })

  it('preserves capitalization of the first letter', () => {
    expect(transliterate('Москва')).toBe('Moskva')
  })
})

describe('toLatinCountryName', () => {
  it('maps a known Russian country name to its English name', () => {
    expect(toLatinCountryName('Россия')).toBe('Russia')
  })

  it('is case-insensitive', () => {
    expect(toLatinCountryName('россия')).toBe('Russia')
  })

  it('falls back to transliteration for unknown country names', () => {
    expect(toLatinCountryName('Молдова')).toBe('Moldova')
  })
})
