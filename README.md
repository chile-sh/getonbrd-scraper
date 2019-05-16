# 🤖 Getonbrd Scraper

[Getonbrd](https://www.getonbrd.cl) jobs scraping library.

## Install

```bash
yarn add @chile-sh/getonbrd-scraper

# or npm i @chile-sh/getonbrd-scraper
```

## Usage

```ts
import GetOnBrd from '@chile-sh/getonbrd-scraper'

// Initialize GetOnBrd
const getonbrd = await GetOnBrd('SGExS1Nkb2dX...')

// If you are not going to use `getJobsBySalary` you can
// omit the session token.

// const getonbrd = await GetOnBrd()

// Get jobs by salary range
const jobs = await getonbrd.getJobsBySalary(1000, 2000)
/*
  Job URLs and pagination
  {
    urls: string[],
    next: boolean
  }
*/

// Or navigate using an offset
const moreJobs = await getonbrd.getJobsBySalary(1000, 2000, 25)

// Get a job description
const job = await getonbrd.getJob(moreJobs.urls[0])
/*
  {
    date: string
    parsedDate: Date
    salary: number[]
    company: {
      logo: string
      name: string
      url: string
    }
    category: {
      name: string
      slug: string
    },
    tags: string[]
    description: string
    title: string
    level: string
    type: string
    trending: boolean
    country: string
    city: string
  }
*/

// Get a company profile
const company = await getonbrd.getCompanyProfile(job.company.url)
/*
  {
    title: string
    logo?: string | null
    subtitle: string
    followers: number
    about?: string | null
    links: {
      href: string
      text: string
    }[]
  }
*/

// Get categories (without a session)
const categories = await getCategories()
/*
  Array of categories URLs
  string[]
*/

// Get jobs URLs from a category URL
const jobs = await getJobsFromCategory(categories[0])
/*
  Array of jobs URLs
  string[]
*/
```

## Test

```bash
echo SESSION=SGEkbko2d... > .env # or export SESSION...
yarn test
```

# License

MIT
