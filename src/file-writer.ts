import { mkdirSync, writeFileSync } from 'fs';

const DEFAULT_OUTPUT_FOLDER = './profile-3d-contrib';

export const OUTPUT_FOLDER = DEFAULT_OUTPUT_FOLDER;

const getOutputFolder = (): string =>
    process.env.OUTPUT_PATH || DEFAULT_OUTPUT_FOLDER;

export const writeFile = (fileName: string, content: string): void => {
    const folder = getOutputFolder();
    mkdirSync(folder, { recursive: true });
    writeFileSync(`${folder}/${fileName}`, content);
};
