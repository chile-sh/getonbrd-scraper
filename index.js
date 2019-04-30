'use strict'

const qs = require('qs')
const isNumber = require('lodash/isNumber')
const pullAll = require('lodash/pullAll')
const sanitizeHtml = require('sanitize-html')
const got = require('got')

const { isRequired, dom, txt } = require('./helpers.js')

const HOST = 'https://www.getonbrd.com'
const SEARCH_URL = `${HOST}/webpros/search_jobs`

const DEFAULT_HEADERS = {
  'accept-language': 'es-US,es;q=0.9,es-419;q=0.8,en;q=0.7',
  accept: '*/*'
}

const getContent = (el, excludedTags = ['div']) => {
  const allowedTags = pullAll(sanitizeHtml.defaults.allowedTags, excludedTags)

  const descHtml = el.html()
  return sanitizeHtml(descHtml, {
    allowedTags,
    allowedIframeHostnames: ['www.youtube.com']
  })
}

module.exports = async session => {
  const sessionCookie = `_getonboard_session=${session};`

  const csrfToken = session
    ? (await dom(HOST, { headers: { cookie: sessionCookie } }))(
      '[name="csrf-token"]'
    ).attr('content')
    : null

  const getJobsBySalary = async (minSalary, maxSalary, offset = 0) => {
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
        companies_blacklist_ids: ['']
      }
    }

    const { body } = await got(SEARCH_URL, {
      method: 'post',
      body: qs.stringify(dataObj, { arrayFormat: 'brackets' }),
      headers: {
        ...DEFAULT_HEADERS,
        cookie: sessionCookie,
        'x-requested-with': 'XMLHttpRequest',
        'content-type': 'application/x-www-form-urlencoded',
        'x-csrf-token': csrfToken
      }
    })

    const html = body.match(
      /jobs_container\.(?:html|append)\("([\s\S]+?)"\);/
    )[1]
    const next = body.includes('#load-more-preferred-jobs-link')
    const re = /href=\\"(.+?)\\"/
    const urls = html.match(RegExp(re, 'g')).map(m => m.match(re)[1])

    return { urls, next }
  }

  const getJob = async url => {
    const $ = await dom(url)

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

    return {
      date: txt(_company.find('time')),
      salary,
      company: {
        logo: _company.find('.gb-company-logo__img').attr('src'),
        name: txt(_company.find('h3 [itemprop="name"]')),
        url: _company.find('h3 a').attr('href')
      },
      category: {
        name: txt(_category),
        slug: _category.attr('href').match(/.+\/(.+)/)[1]
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
      city: txt(_loc.find('[itemprop="addressLocality"]'))
    }
  }

  const getCompanyProfile = async url => {
    const $ = await dom(url)

    const _about = $('.gb-landing-section')
    const _logo = $('.gb-header-brand__logo').attr('style')

    return {
      title: txt($('.gb-landing-cover__title')),
      logo: _logo.length ? _logo.match(/url\((.+)\)/)[1] : null,
      subtitle: getContent($('.gb-landing-cover__subtitle')),
      followers: Number(txt($('.js-followers-count'))),
      about: _about.length ? getContent(_about) : null,
      links: $('.gb-aside-links__item')
        .map((i, el) => ({
          href: $(el).attr('href'),
          text: txt($(el))
        }))
        .get()
    }
  }

  return {
    getCompanyProfile,
    getJobsBySalary: async (...args) => {
      if (!session) throw Error('You need to set a session to use this method')

      return getJobsBySalary(...args)
    },
    getJob,
    _csrfToken: csrfToken
  }
}
