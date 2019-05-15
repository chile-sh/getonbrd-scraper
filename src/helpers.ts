import got, { GotUrl, GotOptions } from 'got'
import cheerio from 'cheerio'

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

export const txt = (el: Cheerio) => el.text().trim()

export const dom = async (url: GotUrl, opts?: GotOptions<any>) => {
  const { body } = await got(url, opts)
  return cheerio.load(body)
}

export const parseDate = (str: string) => {
  const [date, month, year] = str.toLowerCase().split(' de ')
  const monthIndex = MONTHS.indexOf(month)

  return new Date(+year, monthIndex, +date)
}
