import * as client from '../src/github-graphql';
import { dummyData } from './dummy-data';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
const mock = new MockAdapter(axios);

afterEach(() => {
    mock.reset();
});

describe('github-graphql', () => {
    it('fetchFirst', async () => {
        mock.onPost(client.URL).reply(200, dummyData);
        const res = await client.fetchFirst("dummy", "username");
        expect(res).toEqual(dummyData);
    });
});

describe('github-graphql', () => {
    it('fetchNext', async () => {
        if (dummyData.data) {
            const dummyData2: client.ResponseNextType = {
                data: {
                    user: {
                        repositories: dummyData.data?.user.repositories,
                    }
                }
            };
            mock.onPost(client.URL).reply(200, dummyData2);
            const res = await client.fetchNext("dummy", "username", "dummyCursor");
            expect(res).toEqual(dummyData2);
        } else {
            fail('dummyData.data is not exist.')
        }
    });
});

const createRepositories = (from: number, to: number, repositories: client.Repositories) => {
    for (let i = from; i < to; i++) {
        repositories.edges.push({
            cursor: `curosr${i}`,
        });
        repositories.nodes.push({
            forkCount: i,
            stargazerCount: i + 2,
        });
    }
}

describe('github-graphql', () => {
    it('fetchData', async () => {
        if (dummyData.data) {
            const dummyData1 = JSON.parse(JSON.stringify(dummyData)) as client.ResponseType;
            const dummyData2: client.ResponseNextType = {
                data: {
                    user: {
                        repositories: {
                            edges: [],
                            nodes: [],
                        }
                    }
                }
            };
            const actual = JSON.parse(JSON.stringify(dummyData)) as client.ResponseType;
            if (actual.data && dummyData1.data && dummyData2.data) {
                dummyData1.data.user.repositories = {
                    edges: [],
                    nodes: [],
                };
                createRepositories(0, 100, dummyData1.data.user.repositories);
                createRepositories(100, 140, dummyData2.data.user.repositories);

                actual.data.user.repositories.edges = dummyData1.data.user.repositories.edges.slice();
                actual.data.user.repositories.nodes = [
                    ...dummyData1.data.user.repositories.nodes,
                    ...dummyData2.data.user.repositories.nodes,
                ];
            } else {
                fail('dummyData1.data or dummyData2.data or actual.data is not exist.')
            }

            mock.onPost(client.URL).replyOnce(200, dummyData1)
                .onPost(client.URL).replyOnce(200, dummyData2);
            const res = await client.fetchData("dummy", "username", 300);
            if (res.data) {
                expect(res).toEqual(actual);
            } else {
                fail('res.data is not exist.')
            }
        } else {
            fail('dummyData.data is not exist.')
        }
    });
});
