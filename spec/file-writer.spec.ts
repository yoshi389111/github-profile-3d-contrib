import { writeFile, OUTPUT_FOLDER } from "../src/file-writer";
import { rmSync, readFileSync } from 'fs';

afterEach(() => {
    rmSync(OUTPUT_FOLDER, { recursive: true, force: true });
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
