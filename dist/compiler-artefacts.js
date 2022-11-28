"use strict";
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
exports.filterAllContractDatas = exports.getAllContractDatas = exports.getArtefactsByContractName = void 0;
/**
 * Get artefacts for a contract (called by script-runner)
 * @param name contract name or fully qualified name i.e. <filename>:<contractname> e.g: contracts/1_Storage.sol:Storage
 * @returns artefacts for the contract
 */
function getArtefactsByContractName(name) {
    return __awaiter(this, void 0, void 0, function () {
        var contractsDataByFilename, fullyQualifiedName, nameArr, filename, contract, allContractsData, contractName, contractArtefacts, keys;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contractsDataByFilename = getAllContractDatas();
                    if (!name.includes(':')) return [3 /*break*/, 4];
                    fullyQualifiedName = name;
                    nameArr = fullyQualifiedName.split(':');
                    filename = nameArr[0];
                    contract = nameArr[1];
                    if (!(Object.keys(contractsDataByFilename).includes(filename) && contractsDataByFilename[filename][contract])) return [3 /*break*/, 1];
                    return [2 /*return*/, contractsDataByFilename[filename][contract]];
                case 1:
                    allContractsData = {};
                    return [4 /*yield*/, this._populateAllContractArtefactsFromFE('contracts', contract, allContractsData)];
                case 2:
                    _a.sent();
                    if (allContractsData[fullyQualifiedName])
                        return [2 /*return*/, { fullyQualifiedName: fullyQualifiedName, artefact: allContractsData[fullyQualifiedName] }];
                    else
                        throw new Error("Could not find artifacts for ".concat(fullyQualifiedName, ". Compile contract to generate artifacts."));
                    _a.label = 3;
                case 3: return [3 /*break*/, 7];
                case 4:
                    contractName = name;
                    contractArtefacts = this._getAllContractArtefactsfromOutput(contractsDataByFilename, contractName);
                    keys = Object.keys(contractArtefacts);
                    if (!!keys.length) return [3 /*break*/, 6];
                    return [4 /*yield*/, this._populateAllContractArtefactsFromFE('contracts', contractName, contractArtefacts)];
                case 5:
                    _a.sent();
                    keys = Object.keys(contractArtefacts);
                    _a.label = 6;
                case 6:
                    if (keys.length === 1)
                        return [2 /*return*/, { fullyQualifiedName: keys[0], artefact: contractArtefacts[keys[0]] }];
                    else if (keys.length > 1) {
                        throw new Error("There are multiple artifacts for contract \"".concat(contractName, "\", please use a fully qualified name.\n\n          Please replace ").concat(contractName, " for one of these options wherever you are trying to read its artifact: \n\n          ").concat(keys.join(), "\n\n          OR just compile the required contract again"));
                    }
                    else
                        throw new Error("Could not find artifacts for ".concat(contractName, ". Compile contract to generate artifacts."));
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.getArtefactsByContractName = getArtefactsByContractName;
/**
* Get compilation output for contracts compiled during a session of Remix IDE
* @returns compilatin output
*/
function getAllContractDatas() {
    return filterAllContractDatas(function () { return true; });
}
exports.getAllContractDatas = getAllContractDatas;
/**
* filter compilation output for contracts compiled during a session of Remix IDE
* @returns compilatin output
*/
function filterAllContractDatas(filter) {
    var _this = this;
    var contractsData = {};
    Object.keys(this.compilersArtefactsPerFile).map(function (targetFile) {
        var contracts = _this.compilersArtefactsPerFile[targetFile].getContracts();
        Object.keys(contracts).map(function (file) {
            if (filter(file, contracts[file]))
                contractsData[file] = contracts[file];
        });
    });
    // making sure we save last compilation result in there
    if (this.compilersArtefacts.__last) {
        var contracts_1 = this.compilersArtefacts.__last.getContracts();
        Object.keys(contracts_1).map(function (file) {
            if (filter(file, contracts_1[file]))
                contractsData[file] = contracts_1[file];
        });
    }
    return contractsData;
}
exports.filterAllContractDatas = filterAllContractDatas;
