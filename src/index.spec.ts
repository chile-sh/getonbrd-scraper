import dotenv from 'dotenv'
import GetOnBrd from './index'

dotenv.config()

const { SESSION } = process.env

if (!SESSION) throw Error(`'SESSION' env variable is required!`)

jest.setTimeout(15000)

describe('Scraper', () => {
  let gob = null
  let jobs = null
  let jobInfo = null

  beforeAll(async () => {
    gob = await GetOnBrd(SESSION)
    return true
  })

  it('Should have a CSRF token', () => {
    expect(typeof gob._csrfToken).toBe('string')
    expect(gob._csrfToken.length).toBeGreaterThan(0)
  })

  it('Should get jobs urls by salary range', async () => {
    jobs = await gob.getJobsBySalary(500, 4000)
    expect(jobs.urls.length).toBe(25)
    expect(jobs.next).toBe(true)
  })

  it('Should get jobs urls by salary range with an offset', async () => {
    const { urls } = await gob.getJobsBySalary(500, 4000, 50)
    expect(jobs.urls).not.toEqual(urls)
  })

  it('Should get job description from an url', async () => {
    jobs = await gob.getJobsBySalary(500, 4000)
    jobInfo = await gob.getJob(jobs.urls[0])

    const props = [
      'date',
      'parsedDate',
      'company',
      'category',
      'title',
      'level',
      'type',
    ]

    expect(props.every(p => jobInfo[p])).toBe(true)
  })

  it('Should get a company info', async () => {
    const company = await gob.getCompanyProfile(jobInfo.company.url)
    const props = ['title', 'logo', 'subtitle', 'followers', 'about', 'links']
    expect(props.every(p => typeof company[p] !== 'undefined')).toBe(true)
  })

  it('Should fail trying getJobsBySalary without a session ', async () => {
    const gob = await GetOnBrd()
    await expect(gob.getJobsBySalary(500, 4000, 50)).rejects.toThrow(
      'You need to set a session to use this method',
    )
  })
})
