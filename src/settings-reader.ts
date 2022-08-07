import { readFileSync } from 'fs';
import * as type from './type';

export const readSettingJson = (filePath: string): type.SettingFile => {
    const content = readFileSync(filePath, {
        encoding: 'utf8',
        flag: 'r',
    });
    return JSON.parse(content) as type.Settings;
};
