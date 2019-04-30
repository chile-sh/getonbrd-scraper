import test from 'ava'
import GetOnBrd from './'

const { SESSION } = process.env

if (!SESSION) throw Error(`'SESSION' env variable is required!`)

const run = async () => {
  const gob = await GetOnBrd(SESSION)
  let jobs = null
  let jobInfo = null

  test.serial('Should have a CSRF token', async t => {
    if (gob._csrfToken && gob._csrfToken.length > 0) {
      t.pass()
    }
  })

  test.serial('Should get jobs urls by salary range', async t => {
    jobs = await gob.getJobsBySalary(500, 4000)
    if (jobs.urls.length === 25 && jobs.next) t.pass()
  })

  test('Should get jobs urls by salary range with an offset', async t => {
    const { urls } = await gob.getJobsBySalary(500, 4000, 50)
    t.notDeepEqual(jobs.urls, urls)
  })

  test.serial('Should get job description from an url', async t => {
    jobInfo = await gob.getJob(jobs.urls[0])
    const props = ['date', 'company', 'category', 'title', 'level', 'type']

    t.assert(props.every(p => jobInfo[p]))
  })

  test('Should get a company info', async t => {
    const company = await gob.getCompanyProfile(jobInfo.company.url)
    const props = ['title', 'logo', 'subtitle', 'followers', 'about', 'links']
    t.assert(props.every(p => typeof company[p] !== 'undefined'))
  })
}

run()
