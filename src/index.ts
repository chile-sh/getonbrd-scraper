import got, { GotOptions } from 'got'
import isNumber from 'lodash/isNumber'
import pullAll from 'lodash/pullAll'
import qs from 'qs'
import sanitizeHtml from 'sanitize-html'

import { dom, txt, parseDate } from './helpers'

const HOST = 'https://www.getonbrd.com'
const HOST_CL = 'https://www.getonbrd.cl'
const SEARCH_URL = `${HOST}/webpros/search_jobs`

const DEFAULT_HEADERS = {
  'accept-language': 'es-US,es;q=0.9,es-419;q=0.8,en;q=0.7',
  accept: '*/*',
}

const getContent = (el: any, excludedTags = ['div']) => {
  const allowedTags = pullAll(sanitizeHtml.defaults.allowedTags, excludedTags)

  const descHtml = el.html()
  return sanitizeHtml(descHtml, {
    allowedTags,
    allowedIframeHostnames: ['www.youtube.com'],
  }).trim()
}

const GetOnBrd = async (
  session?: string,
  defaultOpts: GotOptions<any> = {}
) => {
  const sessionCookie = `_getonboard_session=${session};`

  let csrfToken = ''
  if (session) {
    const $ = await dom(HOST, { headers: { cookie: sessionCookie } })
    csrfToken = $('[name="csrf-token"]').attr('content')
  }

  const getJobsBySalary = async (
    minSalary: number,
    maxSalary: number,
    offset = 0,
    gotOpts: GotOptions<any> = defaultOpts
  ) => {
    if (![minSalary, maxSalary].every(isNumber)) {
      throw Error('minSalary and maxSalary required!')
    }

    const dataObj = {
      utf8: '✓',
      offset,
      webpro: {
        min_salary: minSalary,
        max_salary: maxSalary,
        remote_jobs: 0,
        category_ids: [''],
        tag_ids: [''],
        modality_ids: [''],
        tenant_ids: ['', 1, 5],
        seniority_ids: [''],
        companies_blacklist_ids: [''],
      },
    }

    const { headers = {}, ...opts } = gotOpts

    const { body } = await got(SEARCH_URL, {
      method: 'post',
      body: qs.stringify(dataObj, { arrayFormat: 'brackets' }),
      headers: {
        ...DEFAULT_HEADERS,
        cookie: sessionCookie,
        'x-requested-with': 'XMLHttpRequest',
        'content-type': 'application/x-www-form-urlencoded',
        'x-csrf-token': csrfToken,
        ...headers,
      },
      ...opts,
    })

    const html = body.match(
      /jobs_container\.(?:html|append)\("([\s\S]+?)"\);/
    )[1]
    const next = body.includes('#load-more-preferred-jobs-link')
    const re = /href=\\"(.+?)\\"/
    const urls = html.match(RegExp(re, 'g')).map(m => m.match(re)[1])

    return { urls, next }
  }

  const getJob = async (
    url: string,
    gotOpts: GotOptions<any> = defaultOpts
  ) => {
    const $ = await dom(url, gotOpts)

    const _company = $('[itemprop="hiringOrganization"]')
    const _title = $('.gb-landing-cover__title')
    const _loc = $('[itemprop="jobLocation"]')
    const _salary = $('[itemprop="baseSalary"]')
    const _category = $('[content="2"]').prev()

    const salary = _salary.length
      ? txt(_salary.find('strong'))
          .split(' - ')
          .map(n => n.match(/\d+/g).join(''))
          .map(Number)
      : null
    const date = txt(_company.find('time'))

    return {
      date,
      parsedDate: parseDate(date),
      salary,
      company: {
        logo: _company.find('.gb-company-logo__img').attr('src'),
        name: txt(_company.find('h3 [itemprop="name"]')),
        url: _company.find('h3 a').attr('href'),
      },
      category: {
        name: txt(_category),
        slug: _category.attr('href').match(/.+\/(.+)/)[1],
      },
      tags: $('[itemprop="skills"] a')
        .map((i, el) => $(el).text())
        .get(),
      description: getContent($('[itemprop="description"]')).trim(),
      title: txt(_title.find('[itemprop="title"]')),
      level: txt($('[itemprop="qualifications"]')),
      type: txt($('[itemprop="employmentType"]')),
      trending: $('.fa-fire').length > 0,
      country: txt(_loc.find('[itemprop="addressCountry"]')),
      city: txt(_loc.find('[itemprop="addressLocality"]')),
    }
  }

  const getCompanyProfile = async (
    url: string,
    gotOpts: GotOptions<any> = defaultOpts
  ) => {
    const $ = await dom(url, gotOpts)

    const _about = $('.gb-landing-section')
    const _logo = $('.gb-header-brand__logo').attr('style')

    const links: { href: string; text: string }[] = $('.gb-aside-links__item')
      .map((i, el) => ({
        href: $(el).attr('href'),
        text: txt($(el)),
      }))
      .get()

    return {
      title: txt($('.gb-landing-cover__title')),
      logo: _logo.length ? _logo.match(/url\((.+)\)/)[1] : null,
      subtitle: getContent($('.gb-landing-cover__subtitle')),
      followers: Number(txt($('.js-followers-count'))),
      about: _about.length ? getContent(_about) : null,
      links,
    }
  }

  const getCategories = async (gotOpts: GotOptions<any> = defaultOpts) => {
    const $ = await dom(HOST_CL, gotOpts)

    return $('.bg-white a[href^="/emp"]')
      .map((i, el) => HOST + $(el).attr('href'))
      .get()
  }

  const getJobsFromCategory = async (
    categoryUrl: string,
    gotOpts: GotOptions<any> = defaultOpts
  ) => {
    const $ = await dom(categoryUrl, gotOpts)
    return $('.job')
      .map((i, el) =>
        $(el)
          .find('a')
          .first()
          .attr('href')
      )
      .get()
  }

  return {
    getCompanyProfile,
    getJobsBySalary: async (...args: [number, number, number?]) => {
      if (!session) throw Error('You need to set a session to use this method')

      return getJobsBySalary(...args)
    },
    getJob,
    getCategories,
    getJobsFromCategory,
    _csrfToken: csrfToken,
  }
}

export default GetOnBrd
