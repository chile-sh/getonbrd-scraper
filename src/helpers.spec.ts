import * as helpers from './helpers'
import cheerio from 'cheerio'

describe('Helpers', () => {
  it('[dom] Should get a cheerio instance from an URL', async () => {
    const $ = await helpers.dom('https://www.getonbrd.com')
    const title = $('title').text()
    expect(typeof title).toBe('string')
    expect(title.length).toBeGreaterThan(0)
  })

  it('Should get a CSRF token', async () => {
    const $ = cheerio.load('<body><h1>hi</h1><body>')
    expect(helpers.txt($('h1'))).toBe('hi')
  })
})
