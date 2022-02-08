import { readSettingJson } from "../src/settings-reader";

describe('settings-reader', () => {
    it('readSettingJson', () => {
        const settings = readSettingJson('./spec/settings.json');
        expect(settings.type).toEqual('normal');
        expect(settings.backgroundColor).toEqual('#ffffff');
        expect(settings.foregroundColor).toEqual('#00000f');
    });
});
