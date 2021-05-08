import * as aggregate from '../src/aggregate-user-info'
import * as type from '../src/type';
import { dummyData } from './dummy-data';

describe('github-graphql', () => {
    it('fetchData', () => {
        const userInfo = aggregate.aggregateUserInfo(dummyData);

        expect(userInfo.contributionCalendar.length).toEqual(371);

        const languages: Array<type.LangInfo> = [
            {
                "language": "Jupyter Notebook",
                "color": "#DA5B0B",
                "contributions": 108
            },
            {
                "language": "Perl",
                "color": "#0298c3",
                "contributions": 73
            },
            {
                "language": "Kotlin",
                "color": "#F18E33",
                "contributions": 58
            },
            {
                "language": "TypeScript",
                "color": "#2b7489",
                "contributions": 31
            },
            {
                "language": "Java",
                "color": "#b07219",
                "contributions": 28
            },
            {
                "language": "Go",
                "color": "#00ADD8",
                "contributions": 20
            },
            {
                "language": "Python",
                "color": "#3572A5",
                "contributions": 10
            },
            {
                "language": "JavaScript",
                "color": "#f1e05a",
                "contributions": 7
            },
            {
                "language": "C",
                "color": "#555555",
                "contributions": 4
            },
            {
                "language": "Ruby",
                "color": "#701516",
                "contributions": 1
            }
        ];
        expect(userInfo.contributesLanguage).toEqual(languages);

        expect(userInfo.totalContributions).toEqual(366);
        expect(userInfo.totalCommitContributions).toEqual(344);
        expect(userInfo.totalIssueContributions).toEqual(4);
        expect(userInfo.totalPullRequestContributions).toEqual(12);
        expect(userInfo.totalPullRequestReviewContributions).toEqual(0);
        expect(userInfo.totalRepositoryContributions).toEqual(6);
        expect(userInfo.totalForkCount).toEqual(0);
        expect(userInfo.totalStargazerCount).toEqual(6);
    });
});
