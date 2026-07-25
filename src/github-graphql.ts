import axios from 'axios';
import * as type from './type';

export const URL =
    process.env.GITHUB_ENDPOINT || 'https://api.github.com/graphql';
const maxReposOneQuery = 100;

export type CommitContributionsByRepository = Array<{
    contributions: {
        totalCount: number;
    };
    repository: {
        primaryLanguage: {
            name: string;
            /** "#RRGGBB" */
            color: string | null;
        } | null;
    };
}>;

export type ContributionCalendar = {
    isHalloween: boolean;
    totalContributions: number;
    weeks: Array<{
        contributionDays: Array<{
            contributionCount: number;
            contributionLevel: type.ContributionLevel;
            /** "YYYY-MM-DD hh:mm:ss.SSS+00:00" */
            date: string;
        }>;
    }>;
};

export type Repositories = {
    edges: Array<{
        cursor: string;
    }>;
    nodes: Array<{
        forkCount: number;
        stargazerCount: number;
    }>;
};

type ContributionCollection = {
    commitContributionsByRepository: CommitContributionsByRepository;
    contributionCalendar: ContributionCalendar;
    totalCommitContributions: number;
    totalIssueContributions: number;
    totalPullRequestContributions: number;
    totalPullRequestReviewContributions: number;
    totalRepositoryContributions: number;
};

type UserData = {
    contributionsCollection: ContributionCollection;
    repositories: Repositories;
};

type GraphqlError = { message: string };

/** Response(first) of GraphQL */
export type ResponseType = {
    data?: {
        user: UserData;
    };
    errors?: GraphqlError[];
};

/** Response(next) of GraphQL */
export type ResponseNextType = {
    data?: {
        user: {
            repositories: Repositories;
        };
    };
    errors?: GraphqlError[];
};

type ContributionsResponse = {
    data?: { user: { contributionsCollection: ContributionCollection } | null };
    errors?: GraphqlError[];
};

export const fetchFirst = async (
    token: string,
    userName: string,
    year: number | null = null,
): Promise<ResponseType> => {
    const yearArgs = year
        ? `(from:"${year}-01-01T00:00:00.000Z", to:"${year}-12-31T23:59:59.000Z")`
        : '';
    const headers = {
        Authorization: `bearer ${token}`,
    };
    const request = {
        query: `
            query($login: String!) {
                user(login: $login) {
                    contributionsCollection${yearArgs} {
                        contributionCalendar {
                            isHalloween
                            totalContributions
                            weeks {
                                contributionDays {
                                    contributionCount
                                    contributionLevel
                                    date
                                }
                            }
                        }
                        commitContributionsByRepository(maxRepositories: ${maxReposOneQuery}) {
                            repository {
                                primaryLanguage {
                                    name
                                    color
                                }
                            }
                            contributions {
                                totalCount
                            }
                        }
                        totalCommitContributions
                        totalIssueContributions
                        totalPullRequestContributions
                        totalPullRequestReviewContributions
                        totalRepositoryContributions
                    }
                    repositories(first: ${maxReposOneQuery}, ownerAffiliations: OWNER) {
                        edges {
                            cursor
                        }
                        nodes {
                            forkCount
                            stargazerCount
                        }
                    }
                }
            }
        `.replace(/\s+/g, ' '),
        variables: { login: userName },
    };

    const response = await axios.post<ResponseType>(URL, request, {
        headers: headers,
    });
    return response.data;
};

export const fetchNext = async (
    token: string,
    userName: string,
    cursor: string,
): Promise<ResponseNextType> => {
    const headers = {
        Authorization: `bearer ${token}`,
    };
    const request = {
        query: `
            query($login: String!, $cursor: String!) {
                user(login: $login) {
                    repositories(after: $cursor, first: ${maxReposOneQuery}, ownerAffiliations: OWNER) {
                        edges {
                            cursor
                        }
                        nodes {
                            forkCount
                            stargazerCount
                        }
                    }
                }
            }
        `.replace(/\s+/g, ' '),
        variables: {
            login: userName,
            cursor: cursor,
        },
    };
    const response = await axios.post<ResponseNextType>(URL, request, {
        headers: headers,
    });
    return response.data;
};

const fetchContributions = async (
    token: string,
    userName: string,
    from: Date,
    to: Date,
): Promise<ContributionsResponse> => {
    const response = await axios.post<ContributionsResponse>(
        URL,
        {
            query: `
                query($login: String!) {
                    user(login: $login) {
                        contributionsCollection(from: "${from.toISOString()}", to: "${to.toISOString()}") {
                            contributionCalendar {
                                isHalloween
                                totalContributions
                                weeks { contributionDays { contributionCount contributionLevel date } }
                            }
                            commitContributionsByRepository(maxRepositories: ${maxReposOneQuery}) {
                                repository { primaryLanguage { name color } }
                                contributions { totalCount }
                            }
                            totalCommitContributions
                            totalIssueContributions
                            totalPullRequestContributions
                            totalPullRequestReviewContributions
                            totalRepositoryContributions
                        }
                    }
                }
            `.replace(/\s+/g, ' '),
            variables: { login: userName },
        },
        { headers: { Authorization: `bearer ${token}` } },
    );
    return response.data;
};

const fetchRepositories = async (
    token: string,
    userName: string,
): Promise<ResponseNextType> => {
    const response = await axios.post<ResponseNextType>(
        URL,
        {
            query: `
                query($login: String!) {
                    user(login: $login) {
                        repositories(first: ${maxReposOneQuery}, ownerAffiliations: OWNER) {
                            edges { cursor }
                            nodes { forkCount stargazerCount }
                        }
                    }
                }
            `.replace(/\s+/g, ' '),
            variables: { login: userName },
        },
        { headers: { Authorization: `bearer ${token}` } },
    );
    return response.data;
};

const splitDateRange = (year: number | null): Array<[Date, Date]> => {
    const end = year ? new Date(`${year}-12-31T23:59:59.999Z`) : new Date();
    const start = year
        ? new Date(`${year}-01-01T00:00:00.000Z`)
        : new Date(end);
    if (!year) start.setUTCFullYear(start.getUTCFullYear() - 1);

    const ranges: Array<[Date, Date]> = [];
    let from = start;
    while (from <= end) {
        const quarterEnd = new Date(
            Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 3, 1) - 1,
        );
        const to = quarterEnd < end ? quarterEnd : end;
        ranges.push([from, to]);
        from = new Date(to.getTime() + 1);
    }
    return ranges;
};

const mergeContributions = (
    collections: ContributionCollection[],
): ContributionCollection => {
    const days = new Map<
        string,
        ContributionCalendar['weeks'][number]['contributionDays'][number]
    >();
    for (const collection of collections) {
        for (const day of collection.contributionCalendar.weeks.flatMap(
            (week) => week.contributionDays,
        )) {
            days.set(day.date, day);
        }
    }
    const contributionDays = [...days.values()].sort((a, b) =>
        a.date.localeCompare(b.date),
    );
    const quartile = Math.ceil(
        Math.max(...contributionDays.map((day) => day.contributionCount)) / 4,
    );
    for (const day of contributionDays) {
        day.contributionLevel =
            day.contributionCount === 0
                ? 'NONE'
                : day.contributionCount <= quartile
                  ? 'FIRST_QUARTILE'
                  : day.contributionCount <= quartile * 2
                    ? 'SECOND_QUARTILE'
                    : day.contributionCount <= quartile * 3
                      ? 'THIRD_QUARTILE'
                      : 'FOURTH_QUARTILE';
    }
    const sum = (field: keyof ContributionCollection): number =>
        collections.reduce(
            (total, collection) => total + Number(collection[field]),
            0,
        );

    return {
        commitContributionsByRepository: collections.flatMap(
            (collection) => collection.commitContributionsByRepository,
        ),
        contributionCalendar: {
            isHalloween: collections.some(
                (collection) => collection.contributionCalendar.isHalloween,
            ),
            totalContributions: collections.reduce(
                (total, collection) =>
                    total + collection.contributionCalendar.totalContributions,
                0,
            ),
            weeks: [
                {
                    contributionDays,
                },
            ],
        },
        totalCommitContributions: sum('totalCommitContributions'),
        totalIssueContributions: sum('totalIssueContributions'),
        totalPullRequestContributions: sum('totalPullRequestContributions'),
        totalPullRequestReviewContributions: sum(
            'totalPullRequestReviewContributions',
        ),
        totalRepositoryContributions: sum('totalRepositoryContributions'),
    };
};

const fetchDataInChunks = async (
    token: string,
    userName: string,
    year: number | null,
): Promise<ResponseType> => {
    const collections: ContributionCollection[] = [];
    for (const [from, to] of splitDateRange(year)) {
        const response = await fetchContributions(token, userName, from, to);
        if (!response.data?.user) return { errors: response.errors };
        collections.push(response.data.user.contributionsCollection);
    }
    const repositories = await fetchRepositories(token, userName);
    if (!repositories.data?.user) return { errors: repositories.errors };
    return {
        data: {
            user: {
                contributionsCollection: mergeContributions(collections),
                repositories: repositories.data.user.repositories,
            },
        },
    };
};

/** Fetch data from GitHub GraphQL */
export const fetchData = async (
    token: string,
    userName: string,
    maxRepos: number,
    year: number | null = null,
): Promise<ResponseType> => {
    let res1 = await fetchFirst(token, userName, year);
    if (
        res1.errors?.some((error) =>
            error.message.includes('Resource limits for this query exceeded'),
        )
    ) {
        res1 = await fetchDataInChunks(token, userName, year);
    }
    const result = res1.data;

    if (
        result?.user &&
        result.user.repositories.nodes.length === maxReposOneQuery
    ) {
        const repos1 = result.user.repositories;
        let cursor = repos1.edges[repos1.edges.length - 1].cursor;
        while (repos1.nodes.length < maxRepos) {
            const res2 = await fetchNext(token, userName, cursor);
            if (res2.data?.user) {
                const repos2 = res2.data.user.repositories;
                repos1.nodes.push(...repos2.nodes);
                if (repos2.nodes.length !== maxReposOneQuery) {
                    break;
                }
                cursor = repos2.edges[repos2.edges.length - 1].cursor;
            } else {
                break;
            }
        }
    }
    return res1;
};
