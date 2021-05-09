"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const core = __importStar(require("@actions/core"));
const client = __importStar(require("./github-graphql"));
const aggregate = __importStar(require("./aggregate-user-info"));
const create = __importStar(require("./create-svg"));
const f = __importStar(require("./file-writer"));
const main = async () => {
    try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            return;
        }
        const response = await client.fetchData(token);
        const userInfo = aggregate.aggregateUserInfo(response);
        const svgString1 = create.createSvg(userInfo, true, true);
        f.writeFile('profile-season-animate.svg', svgString1);
        const svgString2 = create.createSvg(userInfo, false, true);
        f.writeFile('profile-green-animate.svg', svgString2);
        const svgString3 = create.createSvg(userInfo, true, false);
        f.writeFile('profile-season.svg', svgString3);
        const svgString4 = create.createSvg(userInfo, false, false);
        f.writeFile('profile-green.svg', svgString4);
    }
    catch (error) {
        console.error(error);
        core.setFailed('error');
    }
};
exports.main = main;
void exports.main();
//# sourceMappingURL=index.js.map