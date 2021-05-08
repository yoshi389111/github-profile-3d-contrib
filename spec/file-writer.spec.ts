import { writeFile, OUTPUT_FOLDER } from "../src/file-writer";
import { rmdirSync, readFileSync } from 'fs';

const outputFolder = `${OUTPUT_FOLDER}/test`;

afterEach(() => {
    rmdirSync(outputFolder, { recursive: true });
});

describe('file-writer', () => {
    it('writeFile', () => {
        writeFile('test', 'write-svg.svg', 'work');
        const content = readFileSync(`${outputFolder}/write-svg.svg`, {
            encoding: 'utf8',
            flag: 'r',
        });
        expect(content).toEqual('work');
    });
});
