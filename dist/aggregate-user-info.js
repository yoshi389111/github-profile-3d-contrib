"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateUserInfo = void 0;
const OTHER_COLOR = '#444444';
const toNumberContributionLevel = (level) => {
    switch (level) {
        case 'NONE':
            return 0;
        case 'FIRST_QUARTILE':
            return 1;
        case 'SECOND_QUARTILE':
            return 2;
        case 'THIRD_QUARTILE':
            return 3;
        case 'FOURTH_QUARTILE':
            return 4;
    }
};
const compare = (num1, num2) => {
    if (num1 < num2) {
        return -1;
    }
    else if (num1 > num2) {
        return 1;
    }
    else {
        return 0;
    }
};
const aggregateUserInfo = (response) => {
    if (!response.data) {
        if (response.errors && response.errors.length) {
            throw new Error(response.errors[0].message);
        }
        else {
            throw new Error('JSON\n' + JSON.stringify(response, null, 2));
        }
    }
    const user = response.data.viewer;
    const calendar = user.contributionsCollection.contributionCalendar.weeks
        .flatMap((week) => week.contributionDays)
        .map((week) => ({
        contributionCount: week.contributionCount,
        contributionLevel: toNumberContributionLevel(week.contributionLevel),
        date: new Date(week.date),
    }));
    const contributesLanguage = {};
    user.contributionsCollection.commitContributionsByRepository
        .filter((repo) => repo.repository.primaryLanguage)
        .forEach((repo) => {
        var _a, _b;
        const language = ((_a = repo.repository.primaryLanguage) === null || _a === void 0 ? void 0 : _a.name) || '';
        const color = ((_b = repo.repository.primaryLanguage) === null || _b === void 0 ? void 0 : _b.color) || OTHER_COLOR;
        const contributions = repo.contributions.totalCount;
        const info = contributesLanguage[language];
        if (info) {
            info.contributions += contributions;
        }
        else {
            contributesLanguage[language] = {
                language: language,
                color: color,
                contributions: contributions,
            };
        }
    });
    const languages = Object.values(contributesLanguage).sort((obj1, obj2) => -compare(obj1.contributions, obj2.contributions));
    const totalForkCount = user.repositories.nodes
        .map((node) => node.forkCount)
        .reduce((num1, num2) => num1 + num2, 0);
    const totalStargazerCount = user.repositories.nodes
        .map((node) => node.stargazerCount)
        .reduce((num1, num2) => num1 + num2, 0);
    const userInfo = {
        contributionCalendar: calendar,
        contributesLanguage: languages,
        totalContributions: user.contributionsCollection.contributionCalendar
            .totalContributions,
        totalCommitContributions: user.contributionsCollection.totalCommitContributions,
        totalIssueContributions: user.contributionsCollection.totalIssueContributions,
        totalPullRequestContributions: user.contributionsCollection.totalPullRequestContributions,
        totalPullRequestReviewContributions: user.contributionsCollection.totalPullRequestReviewContributions,
        totalRepositoryContributions: user.contributionsCollection.totalRepositoryContributions,
        totalForkCount: totalForkCount,
        totalStargazerCount: totalStargazerCount,
    };
    return userInfo;
};
exports.aggregateUserInfo = aggregateUserInfo;
//# sourceMappingURL=aggregate-user-info.js.map