import * as client from '../src/github-graphql';
import { dummyData } from './dummy-data';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
const mock = new MockAdapter(axios);

afterEach(() => {
    mock.reset();
});

describe('github-graphql', () => {
    it('fetchData', async () => {
        mock.onPost(client.URL).reply(200, dummyData);
        const res = await client.fetchData("dummy");

        expect(res).toEqual(dummyData);
    });
});
