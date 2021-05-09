import axios from 'axios';

export const URL = 'https://api.github.com/graphql';

export type ContributionLevel =
    | 'NONE'
    | 'FIRST_QUARTILE'
    | 'SECOND_QUARTILE'
    | 'THIRD_QUARTILE'
    | 'FOURTH_QUARTILE';

/** Response of GraphQL */
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
                            contributionLevel: ContributionLevel;
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
): Promise<ResponseType> => {
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
                        commitContributionsByRepository(maxRepositories: 100) {
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
                    repositories(first: 100) {
                        nodes {
                            forkCount
                            stargazerCount
                        }
                    }
                }
            }
            variables { "login": "${userName}" }
        `.replace(/\s+/g, ' '),
    };

    const response = await axios.post<ResponseType>(URL, {
        headers: headers,
        data: req,
    });

    return response.data;
};
