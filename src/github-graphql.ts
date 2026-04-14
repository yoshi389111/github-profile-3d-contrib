import axios, { AxiosResponse } from 'axios';
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

/** Response(first) of GraphQL */
export type ResponseType = {
    data?: {
        viewer: {
            contributionsCollection: {
                commitContributionsByRepository: CommitContributionsByRepository;
                contributionCalendar: ContributionCalendar;
                totalCommitContributions: number;
                totalIssueContributions: number;
                totalPullRequestContributions: number;
                totalPullRequestReviewContributions: number;
                totalRepositoryContributions: number;
            };
            repositories: Repositories;
        };
    };
    errors?: [
        {
            message: string;
            // snip
        },
    ];
};

/** Response(next) of GraphQL */
export type ResponseNextType = {
    data?: {
        viewer: {
            repositories: Repositories;
        };
    };
    errors?: [
        {
            message: string;
            // snip
        },
    ];
};

export const fetchFirst = async (
    token: string,
    userName: string,
    year: number | null = null,
): Promise<ResponseType> => {
    let yearArgs: string;
    if (year !== null) {
        yearArgs = `(from:"${year}-01-01T00:00:00.000Z", to:"${year}-12-31T23:59:59.000Z")`;
    } else {
        // Default to a rolling 12-month window so all recent contributions
        // are included regardless of calendar year boundaries.
        const to = new Date();
        const from = new Date(to);
        from.setFullYear(from.getFullYear() - 1);
        yearArgs = `(from:"${from.toISOString()}", to:"${to.toISOString()}")`;
    }
    const headers = {
        Authorization: `bearer ${token}`,
    };
    const request = {
        query: `
            query {
                viewer {
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
        variables: {},
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
            query($cursor: String!) {
                viewer {
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
            cursor: cursor,
        },
    };
    const response = await axios.post<ResponseNextType>(URL, request, {
        headers: headers,
    });
    return response.data;
};

/** Fetch the year the authenticated user created their account */
export const fetchCreatedYear = async (token: string): Promise<number> => {
    const headers = { Authorization: `bearer ${token}` };
    const request = {
        query: `query { viewer { createdAt } }`,
    };
    const response = await axios.post<{
        data?: { viewer: { createdAt: string } };
    }>(URL, request, { headers });
    const createdAt = response.data.data?.viewer.createdAt;
    if (!createdAt) throw new Error('Could not fetch account creation date');
    return new Date(createdAt).getFullYear();
};

/** Merge multiple per-year responses into a single ResponseType */
const mergeResponses = (responses: ResponseType[]): ResponseType => {
    const valid = responses.filter((r) => r.data);
    if (valid.length === 0) return responses[0];

    // Deep-clone base so we mutate safely
    const base = JSON.parse(
        JSON.stringify(valid[0].data!.viewer),
    ) as ResponseType['data'] extends undefined ? never : NonNullable<ResponseType['data']>['viewer'];

    for (let i = 1; i < valid.length; i++) {
        const v = valid[i].data!.viewer;
        const cal = base.contributionsCollection.contributionCalendar;
        const vcal = v.contributionsCollection.contributionCalendar;

        cal.weeks.push(...vcal.weeks);
        cal.totalContributions += vcal.totalContributions;

        const c = base.contributionsCollection;
        const vc = v.contributionsCollection;
        c.totalCommitContributions += vc.totalCommitContributions;
        c.totalIssueContributions += vc.totalIssueContributions;
        c.totalPullRequestContributions += vc.totalPullRequestContributions;
        c.totalPullRequestReviewContributions +=
            vc.totalPullRequestReviewContributions;
        c.totalRepositoryContributions += vc.totalRepositoryContributions;

        // Append repo language entries — aggregated by language downstream
        c.commitContributionsByRepository.push(
            ...vc.commitContributionsByRepository,
        );
    }

    return { data: { viewer: base } };
};

/**
 * Fetch all contributions from account creation to today by querying
 * one calendar year at a time and merging the results.
 */
export const fetchAllYearsData = async (
    token: string,
    userName: string,
    maxRepos: number,
): Promise<ResponseType> => {
    const startYear = await fetchCreatedYear(token);
    const currentYear = new Date().getFullYear();

    const responses: ResponseType[] = [];
    for (let year = startYear; year <= currentYear; year++) {
        const res = await fetchFirst(token, userName, year);
        responses.push(res);
    }

    const merged = mergeResponses(responses);

    // Replace repositories with paginated result from current period
    const reposRes = await fetchData(token, userName, maxRepos, null);
    if (merged.data && reposRes.data) {
        merged.data.viewer.repositories = reposRes.data.viewer.repositories;
    }

    return merged;
};

/**
 * Fetch language data and total contribution count across all years from
 * account creation to today. The calendar weeks are intentionally excluded
 * so this can be overlaid onto a single-year response without affecting
 * the SVG size or rendering.
 */
export const fetchAllYearsLanguages = async (
    token: string,
    userName: string,
): Promise<{ totalContributions: number }> => {
    const startYear = await fetchCreatedYear(token);
    const currentYear = new Date().getFullYear();

    let totalContributions = 0;
    for (let year = startYear; year <= currentYear; year++) {
        const res = await fetchFirst(token, userName, year);
        if (res.data) {
            totalContributions +=
                res.data.viewer.contributionsCollection.contributionCalendar
                    .totalContributions;
        }
    }
    return { totalContributions };
};

type RepoLanguagesPage = {
    pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
    };
    nodes: Array<{
        languages: {
            edges: Array<{
                size: number;
                node: {
                    name: string;
                    color: string | null;
                };
            }>;
        };
    }>;
};

type RepoLanguagesResponse = {
    data?: {
        viewer: {
            repositories: RepoLanguagesPage;
        };
    };
};

const repoLanguagesQuery = `
    query($cursor: String) {
        viewer {
            repositories(
                first: 100,
                after: $cursor,
                ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
            ) {
                pageInfo {
                    hasNextPage
                    endCursor
                }
                nodes {
                    languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                        edges {
                            size
                            node {
                                name
                                color
                            }
                        }
                    }
                }
            }
        }
    }
`.replace(/\s+/g, ' ');

/**
 * Fetch language byte counts across all repos the viewer owns, collaborates
 * on, or is an org member of. Returns data shaped as CommitContributionsByRepository
 * so the existing language aggregation pipeline in aggregate-user-info.ts can
 * consume it without changes. Each language edge in each repo becomes one entry,
 * with byte count as the contribution weight.
 */
export const fetchRepoLanguages = async (
    token: string,
): Promise<CommitContributionsByRepository> => {
    const headers = { Authorization: `bearer ${token}` };
    const results: CommitContributionsByRepository = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
        const response: AxiosResponse<RepoLanguagesResponse> =
            await axios.post<RepoLanguagesResponse>(
                URL,
                { query: repoLanguagesQuery, variables: { cursor } },
                { headers },
            );

        const repos: RepoLanguagesPage | undefined =
            response.data.data?.viewer.repositories;
        if (!repos) break;

        for (const repo of repos.nodes) {
            for (const langEdge of repo.languages.edges) {
                results.push({
                    contributions: { totalCount: langEdge.size },
                    repository: {
                        primaryLanguage: {
                            name: langEdge.node.name,
                            color: langEdge.node.color,
                        },
                    },
                });
            }
        }

        hasNextPage = repos.pageInfo.hasNextPage;
        cursor = repos.pageInfo.endCursor;
    }

    return results;
};

/** Fetch data from GitHub GraphQL */
export const fetchData = async (
    token: string,
    userName: string,
    maxRepos: number,
    year: number | null = null,
): Promise<ResponseType> => {
    const res1 = await fetchFirst(token, userName, year);
    const result = res1.data;

    if (result && result.viewer.repositories.nodes.length === maxReposOneQuery) {
        const repos1 = result.viewer.repositories;
        let cursor = repos1.edges[repos1.edges.length - 1].cursor;
        while (repos1.nodes.length < maxRepos) {
            const res2 = await fetchNext(token, userName, cursor);
            if (res2.data) {
                const repos2 = res2.data.viewer.repositories;
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
