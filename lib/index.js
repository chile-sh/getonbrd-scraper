"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = __importDefault(require("got"));
const isNumber_1 = __importDefault(require("lodash/isNumber"));
const pullAll_1 = __importDefault(require("lodash/pullAll"));
const qs_1 = __importDefault(require("qs"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const helpers_1 = require("./helpers");
const HOST = 'https://www.getonbrd.com';
const SEARCH_URL = `${HOST}/webpros/search_jobs`;
const DEFAULT_HEADERS = {
    'accept-language': 'es-US,es;q=0.9,es-419;q=0.8,en;q=0.7',
    accept: '*/*',
};
const getContent = (el, excludedTags = ['div']) => {
    const allowedTags = pullAll_1.default(sanitize_html_1.default.defaults.allowedTags, excludedTags);
    const descHtml = el.html();
    return sanitize_html_1.default(descHtml, {
        allowedTags,
        allowedIframeHostnames: ['www.youtube.com'],
    });
};
exports.default = (session, defaultOpts = {}) => __awaiter(this, void 0, void 0, function* () {
    const sessionCookie = `_getonboard_session=${session};`;
    let csrfToken = '';
    if (session) {
        const $ = yield helpers_1.dom(HOST, { headers: { cookie: sessionCookie } });
        csrfToken = $('[name="csrf-token"]').attr('content');
    }
    const getJobsBySalary = (minSalary, maxSalary, offset = 0, gotOpts = defaultOpts) => __awaiter(this, void 0, void 0, function* () {
        if (![minSalary, maxSalary].every(isNumber_1.default)) {
            throw Error('minSalary and maxSalary required!');
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
        };
        const { headers = {} } = gotOpts, opts = __rest(gotOpts, ["headers"]);
        const { body } = yield got_1.default(SEARCH_URL, Object.assign({ method: 'post', body: qs_1.default.stringify(dataObj, { arrayFormat: 'brackets' }), headers: Object.assign({}, DEFAULT_HEADERS, { cookie: sessionCookie, 'x-requested-with': 'XMLHttpRequest', 'content-type': 'application/x-www-form-urlencoded', 'x-csrf-token': csrfToken }, headers) }, opts));
        const html = body.match(/jobs_container\.(?:html|append)\("([\s\S]+?)"\);/)[1];
        const next = body.includes('#load-more-preferred-jobs-link');
        const re = /href=\\"(.+?)\\"/;
        const urls = html.match(RegExp(re, 'g')).map(m => m.match(re)[1]);
        return { urls, next };
    });
    const getJob = (url, gotOpts = defaultOpts) => __awaiter(this, void 0, void 0, function* () {
        const $ = yield helpers_1.dom(url, gotOpts);
        const _company = $('[itemprop="hiringOrganization"]');
        const _title = $('.gb-landing-cover__title');
        const _loc = $('[itemprop="jobLocation"]');
        const _salary = $('[itemprop="baseSalary"]');
        const _category = $('[content="2"]').prev();
        const salary = _salary.length
            ? helpers_1.txt(_salary.find('strong'))
                .split(' - ')
                .map(n => n.match(/\d+/g).join(''))
                .map(Number)
            : null;
        return {
            date: helpers_1.txt(_company.find('time')),
            salary,
            company: {
                logo: _company.find('.gb-company-logo__img').attr('src'),
                name: helpers_1.txt(_company.find('h3 [itemprop="name"]')),
                url: _company.find('h3 a').attr('href'),
            },
            category: {
                name: helpers_1.txt(_category),
                slug: _category.attr('href').match(/.+\/(.+)/)[1],
            },
            tags: $('[itemprop="skills"] a')
                .map((i, el) => $(el).text())
                .get(),
            description: getContent($('[itemprop="description"]')).trim(),
            title: helpers_1.txt(_title.find('[itemprop="title"]')),
            level: helpers_1.txt($('[itemprop="qualifications"]')),
            type: helpers_1.txt($('[itemprop="employmentType"]')),
            trending: $('.fa-fire').length > 0,
            country: helpers_1.txt(_loc.find('[itemprop="addressCountry"]')),
            city: helpers_1.txt(_loc.find('[itemprop="addressLocality"]')),
        };
    });
    const getCompanyProfile = (url, gotOpts = defaultOpts) => __awaiter(this, void 0, void 0, function* () {
        const $ = yield helpers_1.dom(url, gotOpts);
        const _about = $('.gb-landing-section');
        const _logo = $('.gb-header-brand__logo').attr('style');
        const links = $('.gb-aside-links__item')
            .map((i, el) => ({
            href: $(el).attr('href'),
            text: helpers_1.txt($(el)),
        }))
            .get();
        return {
            title: helpers_1.txt($('.gb-landing-cover__title')),
            logo: _logo.length ? _logo.match(/url\((.+)\)/)[1] : null,
            subtitle: getContent($('.gb-landing-cover__subtitle')),
            followers: Number(helpers_1.txt($('.js-followers-count'))),
            about: _about.length ? getContent(_about) : null,
            links,
        };
    });
    return {
        getCompanyProfile,
        getJobsBySalary: (...args) => __awaiter(this, void 0, void 0, function* () {
            if (!session)
                throw Error('You need to set a session to use this method');
            return getJobsBySalary(...args);
        }),
        getJob,
        _csrfToken: csrfToken,
    };
});
