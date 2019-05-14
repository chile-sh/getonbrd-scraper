/// <reference types="cheerio" />
import got from 'got';
export declare const txt: (el: Cheerio) => string;
export declare const dom: (url: got.GotUrl, opts?: got.GotOptions<any>) => Promise<CheerioStatic>;
