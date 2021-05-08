import * as client from './github-graphql';
import * as aggregate from './aggregate-user-info';
import * as create from './create-svg';
import * as f from './file-writer';
import { dummyData as response } from './dummy-data-temp'; // TODO

export const main = (): void => {
    // const response = client.fetchData(token);
    const userInfo = aggregate.aggregateUserInfo(response);

    const svgString = create.createSvg(userInfo);

    console.log(svgString);
    f.writeFile('test', 'test.svg', svgString);
};

main();
