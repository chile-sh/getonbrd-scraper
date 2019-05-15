import * as helpers from './helpers'
import cheerio from 'cheerio'

describe('Helpers', () => {
  it('[dom] Should get a cheerio instance from an URL', async () => {
    const $ = await helpers.dom('https://www.getonbrd.com')
    const title = $('title').text()
    expect(typeof title).toBe('string')
    expect(title.length).toBeGreaterThan(0)
  })

  it('Should get a CSRF token', () => {
    const $ = cheerio.load('<body><h1>hi</h1><body>')
    expect(helpers.txt($('h1'))).toBe('hi')
  })

  it('Should get a parsed date from a string', () => {
    const dates: any[] = [
      ['15 de enero de 2019', { date: 15, month: 0, year: 2019 }],
      ['4 de octubre de 2020', { date: 4, month: 9, year: 2020 }],
      ['25 de diciembre de 2020', { date: 25, month: 11, year: 2020 }],
    ]

    for (const [dateStr, date] of dates) {
      const parsed = helpers.parseDate(dateStr)
      expect(parsed).toBeInstanceOf(Date)
      expect(parsed.getDate()).toBe(date.date)
      expect(parsed.getMonth()).toBe(date.month)
      expect(parsed.getFullYear()).toBe(date.year)
    }
  })
})
