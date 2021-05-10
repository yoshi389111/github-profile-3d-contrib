import axios from 'axios';
import * as type from './type';

export const URL = 'https://api.github.com/graphql';

/** Response(first) of GraphQL */
export type ResponseType = {
    data?: {
        user: {
            contributionsCollection: {
                commitContributionsByRepository: Array<{
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
                contributionCalendar: {
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
                totalCommitContributions: number;
                totalIssueContributions: number;
                totalPullRequestContributions: number;
                totalPullRequestReviewContributions: number;
                totalRepositoryContributions: number;
            };
            repositories: {
                edges: Array<{
                    cursor: string;
                }>;
                nodes: Array<{
                    forkCount: number;
                    stargazerCount: number;
                }>;
            };
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
export type ResponseNestType = {
    data?: {
        user: {
            repositories: {
                edges: Array<{
                    cursor: string;
                }>;
                nodes: Array<{
                    forkCount: number;
                    stargazerCount: number;
                }>;
            };
        };
    };
    errors?: [
        {
            message: string;
            // snip
        }
    ];
};

/** Fetch data from GitHub GraphQL */
export const fetchData = async (
    token: string,
    userName: string,
    maxRepos: number
): Promise<ResponseType> => {
    const maxReposOneQuery = 100;
    const headers = {
        Authorization: `bearer ${token}`,
    };
    const req = {
        query: `
            query($login: String!) {
                user(login: $login) {
                    contributionsCollection {
                        contributionCalendar {
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

    const response = await axios.post<ResponseType>(URL, req, {
        headers: headers,
    });
    const result = response.data.data;
    if (result) {
        const repos1 = result.user.repositories;
        let cursor = repos1.edges[repos1.edges.length - 1].cursor;
        while (repos1.nodes.length < maxRepos) {
            const req2 = {
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
            const res2 = await axios.post<ResponseType>(URL, req2, {
                headers: headers,
            });
            if (res2.data.data) {
                const repos2 = res2.data.data.user.repositories;
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

    return response.data;
};
