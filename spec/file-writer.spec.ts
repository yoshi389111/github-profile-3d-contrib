import { writeFile, OUTPUT_FOLDER } from "../src/file-writer";
import { rmSync, readFileSync } from 'fs';

const CUSTOM_OUTPUT_FOLDER = './custom-profile-output';

afterEach(() => {
    rmSync(OUTPUT_FOLDER, { recursive: true, force: true });
    rmSync(CUSTOM_OUTPUT_FOLDER, { recursive: true, force: true });
    delete process.env.OUTPUT_PATH;
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

    it('respects OUTPUT_PATH override', () => {
        process.env.OUTPUT_PATH = CUSTOM_OUTPUT_FOLDER;
        const fileName = 'custom-output.svg';
        writeFile(fileName, 'custom');
        const content = readFileSync(`${CUSTOM_OUTPUT_FOLDER}/${fileName}`, {
            encoding: 'utf8',
            flag: 'r',
        });
        expect(content).toEqual('custom');
    });
});
