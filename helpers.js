'use strict'

const got = require('got')
const cheerio = require('cheerio')

exports.txt = el => el.text().trim()

exports.dom = async (...args) => {
  const { body } = await got(...args)
  return cheerio.load(body)
}

exports.isRequired = param => {
  throw Error(`'${param}' param required!`)
}
