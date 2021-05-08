import { mkdirSync, writeFileSync } from 'fs';

const REPOSITORY = process.env.GIT_HUB_REPOSITORY;
const FOLDER_NAME = 'profile-3d-contrib';
export const OUTPUT_FOLDER = `./${FOLDER_NAME}`;
const BRANCH =
    process.env.GITHUB_REF === undefined
        ? 'main'
        : process.env.GITHUB_REF.split('/').pop();

export const writeFile = (
    folder: string,
    fileName: string,
    content: string
): void => {
    const outputFolder = `${OUTPUT_FOLDER}/${folder}`;
    mkdirSync(outputFolder, { recursive: true });
    writeFileSync(`${outputFolder}/${fileName}`, content);
};
