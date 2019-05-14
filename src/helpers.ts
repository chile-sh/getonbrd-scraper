import got, { GotUrl, GotOptions } from 'got'
import cheerio from 'cheerio'

export const txt = (el: Cheerio) => el.text().trim()

export const dom = async (url: GotUrl, opts?: GotOptions<any>) => {
  const { body } = await got(url, opts)
  return cheerio.load(body)
}
