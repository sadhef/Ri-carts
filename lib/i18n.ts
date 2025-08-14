import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

export const locales = ['en', 'es', 'fr', 'de', 'ar'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'en'

export function getLocale(request: Request): Locale {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  const locale = matchLocale(languages, locales, defaultLocale)

  return locale as Locale
}

export const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  es: () => import('../dictionaries/es.json').then((module) => module.default),
  fr: () => import('../dictionaries/fr.json').then((module) => module.default),
  de: () => import('../dictionaries/de.json').then((module) => module.default),
  ar: () => import('../dictionaries/ar.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]()
}