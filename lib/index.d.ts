import got from 'got';
declare const _default: (session?: string, defaultOpts?: got.GotOptions<any>) => Promise<{
    getCompanyProfile: (url: string, gotOpts?: got.GotOptions<any>) => Promise<{
        title: string;
        logo: string;
        subtitle: string;
        followers: number;
        about: string;
        links: any[];
    }>;
    getJobsBySalary: (args_0: number, args_1: number, args_2?: number) => Promise<{
        urls: string[];
        next: boolean;
    }>;
    getJob: (url: string, gotOpts?: got.GotOptions<any>) => Promise<{
        date: string;
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
    _csrfToken: string;
}>;
export default _default;
