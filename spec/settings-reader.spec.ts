import { readSettingJson } from "../src/settings-reader";

describe('settings-reader', () => {
    it('readSettingJson(Single Settings)', () => {
        const settings = readSettingJson('./spec/settings.json');
        if ("type" in settings) {
            expect(settings.type).toEqual('normal');
            expect(settings.backgroundColor).toEqual('#ffffff');
            expect(settings.foregroundColor).toEqual('#00000f');
        } else {
            throw new Error("invalid value")
        }
    });

    it('readSettingJson(Multiple Settings)', () => {
        const settings = readSettingJson('./spec/settings2.json');
        if ("length" in settings) {
            expect(settings.length).toEqual(2);
            expect(settings[0].type).toEqual('normal');
            expect(settings[1].type).toEqual('rainbow');
        } else {
            throw new Error("invalid value")
        }
    });
});
