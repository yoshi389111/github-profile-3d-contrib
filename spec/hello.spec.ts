import * as hello from './../src/hello';

describe('hello module', () => {
    it('hello', () => {
        const result = hello.hello("World");
        expect(result).toEqual("Hello, World!");
    });
});
