"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchData = exports.URL = void 0;
const axios_1 = __importDefault(require("axios"));
exports.URL = 'https://api.github.com/graphql';
/** Fetch data from GitHub GraphQL */
const fetchData = async (token) => {
    const headers = {
        Authorization: `bearer ${token}`,
    };
    const req = {
        query: `
            query {
                viewer {
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
            },
            variables: {}
        `.replace(/\s+/, ' '),
    };
    const response = await axios_1.default.post(exports.URL, {
        headers: headers,
        data: req,
    });
    return response.data;
};
exports.fetchData = fetchData;
//# sourceMappingURL=github-graphql.js.map