"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = exports.OUTPUT_FOLDER = void 0;
const fs_1 = require("fs");
exports.OUTPUT_FOLDER = "./profile-3d-contrib";
const writeFile = (fileName, content) => {
    fs_1.mkdirSync(exports.OUTPUT_FOLDER, { recursive: true });
    fs_1.writeFileSync(`${exports.OUTPUT_FOLDER}/${fileName}`, content);
};
exports.writeFile = writeFile;
//# sourceMappingURL=file-writer.js.map