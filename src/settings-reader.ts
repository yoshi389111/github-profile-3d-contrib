import { readFileSync } from 'fs';
import * as type from './type';

export const readSettingJson = (filePath: string): type.Settings => {
    const content = readFileSync(filePath, {
        encoding: 'utf8',
        flag: 'r',
    });
    return JSON.parse(content) as type.Settings;
};
