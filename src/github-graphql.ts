import axios from 'axios';
import * as type from './type';

export const URL = 'https://api.github.com/graphql';
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
        user: {
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
        }
    ];
};

/** Response(next) of GraphQL */
export type ResponseNextType = {
    data?: {
        user: {
            repositories: Repositories;
        };
    };
    errors?: [
        {
            message: string;
            // snip
        }
    ];
};

export const fetchFirst = async (
    token: string,
    userName: string
): Promise<ResponseType> => {
    const headers = {
        Authorization: `bearer ${token}`,
    };
    const request = {
        query: `
            query($login: String!) {
                user(login: $login) {
                    contributionsCollection {
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
    cursor: string
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

/** Fetch data from GitHub GraphQL */
export const fetchData = async (
    token: string,
    userName: string,
    maxRepos: number
): Promise<ResponseType> => {
    const res1 = await fetchFirst(token, userName);
    const result = res1.data;

    if (result && result.user.repositories.nodes.length === maxReposOneQuery) {
        const repos1 = result.user.repositories;
        let cursor = repos1.edges[repos1.edges.length - 1].cursor;
        while (repos1.nodes.length < maxRepos) {
            const res2 = await fetchNext(token, userName, cursor);
            if (res2.data) {
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
