import { writeFile, OUTPUT_FOLDER } from "../src/file-writer";
import { rmdirSync, readFileSync } from 'fs';

afterEach(() => {
    rmdirSync(OUTPUT_FOLDER, { recursive: true });
});

describe('file-writer', () => {
    it('writeFile', () => {
        writeFile('write-svg.svg', 'work');
        const content = readFileSync(`${OUTPUT_FOLDER}/write-svg.svg`, {
            encoding: 'utf8',
            flag: 'r',
        });
        expect(content).toEqual('work');
    });
});
