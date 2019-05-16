import got from 'got';
declare const GetOnBrd: (session?: string, defaultOpts?: got.GotOptions<any>) => Promise<{
    getCompanyProfile: (url: string, gotOpts?: got.GotOptions<any>) => Promise<{
        title: string;
        logo: string;
        subtitle: string;
        followers: number;
        about: string;
        links: {
            href: string;
            text: string;
        }[];
    }>;
    getJobsBySalary: (args_0: number, args_1: number, args_2?: number) => Promise<{
        urls: string[];
        next: boolean;
    }>;
    getJob: (url: string, gotOpts?: got.GotOptions<any>) => Promise<{
        date: string;
        parsedDate: Date;
        salary: number[];
        company: {
            logo: string;
            name: string;
            url: string;
        };
        category: {
            name: string;
            slug: string;
        };
        tags: any[];
        description: string;
        title: string;
        level: string;
        type: string;
        trending: boolean;
        country: string;
        city: string;
    }>;
    getCategories: (gotOpts?: got.GotOptions<any>) => Promise<any[]>;
    getJobsFromCategory: (categoryUrl: string, gotOpts?: got.GotOptions<any>) => Promise<any[]>;
    _csrfToken: string;
}>;
export default GetOnBrd;
