# getonbrd-scraper

Getonbrd jobs scraping library

## Install

```bash
yarn add @chile-sh/getonbrd-scraper

# or npm i @chile-sh/getonbrd-scraper
```

## Usage

```js
import GetOnBrd from '@chile-sh/getonbrd-scraper'

const run = async () => {
  // GetOnBrd('your_session_cookie')
  const getonbrd = await GetOnBrd('SGExS1Nkb2dX...')

  // get jobs by salary range
  const jobs = await getonbrd.getJobsBySalary(1000, 2000)

  // or navigate using an offset
  const moreJobs = await getonbrd.getJobsBySalary(1000, 2000, 25)

  // get a job description
  const job = await getonbrd.getJob(moreJobs.urls[0])

  // get a company profile
  const company = await getonbrd.getCompanyProfile(job.company.url)
}

run()
```

## Test

```bash
echo SESSION=SGEkbko2d... > .env
yarn test
```

# License

MIT
