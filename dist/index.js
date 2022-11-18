"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = __importStar(require("@actions/core"));
var fs = __importStar(require("fs/promises"));
var fs_1 = require("fs");
var path = __importStar(require("path"));
var cli = __importStar(require("@actions/exec"));
var ts = __importStar(require("typescript"));
function execute() {
    return __awaiter(this, void 0, void 0, function () {
        var testPath, artifactPath, isTestPathDirectory;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testPath = core.getInput('test-path');
                    artifactPath = core.getInput('artifact-path');
                    return [4 /*yield*/, fs.stat(testPath)];
                case 1:
                    isTestPathDirectory = (_a.sent()).isDirectory();
                    return [4 /*yield*/, core.group("Run tests", function () { return __awaiter(_this, void 0, void 0, function () {
                            var testFiles, _i, testFiles_1, testFile;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!isTestPathDirectory) return [3 /*break*/, 8];
                                        return [4 /*yield*/, fs.readdir(testPath)];
                                    case 1:
                                        testFiles = _a.sent();
                                        if (!(testFiles.length > 0)) return [3 /*break*/, 7];
                                        return [4 /*yield*/, cli.exec('ls')];
                                    case 2:
                                        _a.sent();
                                        (['ethers_remix.js', 'methods.js', 'signer.js']).forEach(function (file) { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, fs.cp(path.resolve('dist/' + file), path.resolve(testPath + '/.deps/' + file))];
                                                    case 1:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                        return [4 /*yield*/, cli.exec('ls', [path.resolve(testPath), '-la'])
                                            // const remixEthers = await fs.readFile(path.resolve('', 'ethers_remix.ts'), 'utf8')
                                            // const remixEthersScript = transpileScript(remixEthers)
                                            // console.log('remixEthersScript.outputText: ', remixEthersScript.outputText)
                                            // await fs.writeFile('ethers_remix.js', remixEthersScript.outputText)
                                        ];
                                    case 3:
                                        _a.sent();
                                        _i = 0, testFiles_1 = testFiles;
                                        _a.label = 4;
                                    case 4:
                                        if (!(_i < testFiles_1.length)) return [3 /*break*/, 7];
                                        testFile = testFiles_1[_i];
                                        return [4 /*yield*/, main("".concat(testPath, "/").concat(testFile))];
                                    case 5:
                                        _a.sent();
                                        _a.label = 6;
                                    case 6:
                                        _i++;
                                        return [3 /*break*/, 4];
                                    case 7: return [3 /*break*/, 10];
                                    case 8: return [4 /*yield*/, main(testPath)];
                                    case 9:
                                        _a.sent();
                                        _a.label = 10;
                                    case 10: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var testFileContent, importIndex, testFile, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, fs.readFile(filePath, 'utf8')];
                case 1:
                    testFileContent = _a.sent();
                    testFileContent = "import { ethersRemix } from '.deps/ethers_remix' \n".concat(testFileContent);
                    importIndex = testFileContent.search('describe');
                    if (!(importIndex === -1)) return [3 /*break*/, 2];
                    throw new Error("No describe function found in ".concat(filePath, ". Please wrap your tests in a describe function."));
                case 2:
                    testFileContent = "".concat(testFileContent.slice(0, importIndex), "\n ethers = ethersRemix; \n").concat(testFileContent.slice(importIndex));
                    testFile = transpileScript(testFileContent);
                    filePath = filePath.replace('.ts', '.js');
                    return [4 /*yield*/, fs.writeFile(filePath, testFile.outputText)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, setupRunEnv()];
                case 4:
                    _a.sent();
                    runTest(filePath);
                    _a.label = 5;
                case 5:
                    console.log('importIndex: ', importIndex);
                    console.log(testFileContent);
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    core.setFailed(error_1.message);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function setupRunEnv() {
    return __awaiter(this, void 0, void 0, function () {
        var workingDirectory, yarnLock, isYarnRepo, packageLock, isNPMrepo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workingDirectory = process.cwd();
                    yarnLock = path.join(workingDirectory, 'yarn.lock');
                    return [4 /*yield*/, (0, fs_1.existsSync)(yarnLock)];
                case 1:
                    isYarnRepo = _a.sent();
                    packageLock = path.join(workingDirectory, 'package-lock.json');
                    isNPMrepo = (0, fs_1.existsSync)(packageLock);
                    if (!isYarnRepo) return [3 /*break*/, 3];
                    return [4 /*yield*/, cli.exec('yarn', ['add', 'chai', 'mocha', '--dev'])];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 3:
                    if (!isNPMrepo) return [3 /*break*/, 5];
                    return [4 /*yield*/, cli.exec('npm', ['install', 'chai', 'mocha', '--save-dev'])];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 5: return [4 /*yield*/, cli.exec('npm', ['init', '-y'])];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, cli.exec('npm', ['install', 'chai', 'mocha', '--save-dev'])];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
}
function runTest(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, cli.exec('npx', ['mocha', filePath])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function transpileScript(script) {
    var output = ts.transpileModule(script, { compilerOptions: {
            target: ts.ScriptTarget.ES2015,
            module: ts.ModuleKind.CommonJS,
            esModuleInterop: true,
        } });
    return output;
}
execute().catch(function (error) {
    if (typeof (error) !== 'string') {
        if (error.message)
            error = error.message;
        else {
            try {
                error = 'error: ' + JSON.stringify(error);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    core.setFailed(error);
});
