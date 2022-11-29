"use strict";
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
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
var ethers_1 = require("ethers");
var chai_1 = require("chai");
var remix;
var proxy;
var verifier;
describe("Basic remix reward deploy", function () {
    it("Deploy with proxy", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, Remix, implAddress, Proxy, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _c.sent(), owner = _a[0], betatester = _a[1], user = _a[2];
                        return [4 /*yield*/, ethers_1.ethers.getContractFactory("Remix")];
                    case 2:
                        Remix = _c.sent();
                        return [4 /*yield*/, Remix.connect(owner).deploy()];
                    case 3:
                        remix = _c.sent();
                        return [4 /*yield*/, remix.deployed()];
                    case 4:
                        _c.sent();
                        implAddress = remix.address;
                        console.log('implementation address', implAddress);
                        return [4 /*yield*/, ethers_1.ethers.getContractFactory('ERC1967Proxy')];
                    case 5:
                        Proxy = _c.sent();
                        return [4 /*yield*/, Proxy.connect(owner).deploy(implAddress, '0x8129fc1c')];
                    case 6:
                        proxy = _c.sent();
                        return [4 /*yield*/, proxy.deployed()];
                    case 7:
                        _c.sent();
                        console.log("Remix reward deployed to:", proxy.address);
                        return [4 /*yield*/, ethers_1.ethers.getContractAt("Remix", proxy.address)];
                    case 8:
                        remix = _c.sent();
                        remix = remix.connect(owner);
                        _b = chai_1.expect;
                        return [4 /*yield*/, remix.name()];
                    case 9:
                        _b.apply(void 0, [_c.sent()]).to.equal('Remix');
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should mint a badge", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, ipfsHash, txAddType, mint, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _d.sent(), owner = _a[0], betatester = _a[1], user = _a[2];
                        ipfsHash = '0xabcd1234';
                        return [4 /*yield*/, remix.addType('Beta Tester')];
                    case 2:
                        txAddType = _d.sent();
                        return [4 /*yield*/, txAddType.wait()];
                    case 3:
                        _d.sent();
                        return [4 /*yield*/, remix.safeMint(betatester.address, 'Beta Tester', '0.22.0', ipfsHash, 2)];
                    case 4:
                        mint = _d.sent();
                        return [4 /*yield*/, mint.wait()];
                    case 5:
                        _d.sent();
                        _b = chai_1.expect;
                        return [4 /*yield*/, remix.allowedMinting(betatester.address)];
                    case 6:
                        _b.apply(void 0, [(_d.sent())]).to.equal(2);
                        _c = chai_1.expect;
                        return [4 /*yield*/, remix.allowedMinting(user.address)];
                    case 7:
                        _c.apply(void 0, [(_d.sent())]).to.equal(0);
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should re-mint a badge", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, mint, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _e.sent(), owner = _a[0], betatester = _a[1], user = _a[2];
                        return [4 /*yield*/, remix.connect(betatester).publicMint(user.address)];
                    case 2:
                        mint = _e.sent();
                        return [4 /*yield*/, mint.wait()];
                    case 3:
                        _e.sent();
                        _b = chai_1.expect;
                        return [4 /*yield*/, remix.allowedMinting(betatester.address)];
                    case 4:
                        _b.apply(void 0, [(_e.sent())]).to.equal(1);
                        _c = chai_1.expect;
                        return [4 /*yield*/, remix.allowedMinting(user.address)];
                    case 5:
                        _c.apply(void 0, [(_e.sent())]).to.equal(0);
                        _d = chai_1.expect;
                        return [4 /*yield*/, remix.balanceOf(user.address)];
                    case 6:
                        _d.apply(void 0, [(_e.sent())]).to.equal(1);
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should assign an empty hash", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2];
                        return [4 /*yield*/, remix.tokensData(1)];
                    case 2:
                        data = _b.sent();
                        (0, chai_1.expect)(data[2]).to.equal('0x');
                        return [4 /*yield*/, remix.connect(owner).assignHash(1, '0xabcd')];
                    case 3: 
                    // assign it
                    return [4 /*yield*/, (_b.sent())];
                    case 4:
                        // assign it
                        _b.sent();
                        return [4 /*yield*/, remix.tokensData(1)];
                    case 5:
                        data = _b.sent();
                        (0, chai_1.expect)(data[2]).to.equal('0xabcd');
                        // should not allow re-assigning an hash
                        return [4 /*yield*/, (0, chai_1.expect)(remix.connect(owner).assignHash(1, '0xabef')).to.be.revertedWith('revert hash already set')];
                    case 6:
                        // should not allow re-assigning an hash
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Set a contributor badge hash", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, contributor;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2];
                        return [4 /*yield*/, (0, chai_1.expect)(remix.connect(betatester).setContributorHash('0x000000000000000000000000000000000000000000000000000000000000000a'))
                                .to.be.revertedWith('is missing role 0x0000000000000000000000000000000000000000000000000000000000000000')]; // remixer badge hash
                    case 2:
                        _b.sent(); // remixer badge hash
                        return [4 /*yield*/, remix.connect(owner).setContributorHash('0x000000000000000000000000000000000000000000000000000000000000000a')];
                    case 3:
                        contributor = _b.sent();
                        return [4 /*yield*/, contributor.wait()];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should not be allowed minting", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, ipfsHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2];
                        ipfsHash = '0xabcd1234';
                        return [4 /*yield*/, (0, chai_1.expect)(remix.connect(betatester).safeMint(betatester.address, 'Beta Tester', '0.22.0', ipfsHash, 2)).to.be.revertedWith('is missing role 0x0000000000000000000000000000000000000000000000000000000000000000')];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should publish verifier", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, betatester2, Verifier;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2], betatester2 = _a[3];
                        return [4 /*yield*/, ethers_1.ethers.getContractFactory("Verifier")];
                    case 2:
                        Verifier = _b.sent();
                        return [4 /*yield*/, Verifier.connect(owner).deploy()];
                    case 3:
                        verifier = _b.sent();
                        return [4 /*yield*/, verifier.deployed()];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    var proof1 = [[["0x2d08ce546a37682b5a42fce21538a61efa91cc1cd100216d3969a02ed5c58ab4", "0x1e77b35455fc083c278f57a634718efc40c0e8f2dfef831a4fd9b9e6cf928223"], [["0x2454015f95980b04db8e34a838baf1d772b1854cacfbb5bbd51cfcdfc73d889b", "0x0dcaca7fde086b0ab360c4b8b2365529dad6303cc642b48fd427809e02c8f682"], ["0x11fdf5b0498a8faabcfd5e72ad21adaa4dfcbd92037f579536790fc9618d3bc3", "0x03a7808b553c7fdc561014b6859e23801d9a7a9f5e132ffc4e2fedd6229aaf58"]], ["0x03ca01b679100bc0f2ba6a6ced00282417fa0dcf5b5226acf8c3b40c5cfe8be4", "0x145f59f69c98ef71d89c72acaa13f5c4a4c4c1ba265b0b812cfbe3433d26ca76"]], ["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6", "0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc", "0x000000000000000000000000000000000000000000000000000000000000002a"]];
    var proof2 = [[["0x1bb1a812546a2084260b20d8f1d96d9a163e1ce3fe237024fb6e208c03e4973b", "0x1265cf8ae910b64d86a7d83330f70bf33da46a22dc8be58f65346fd67c183933"], [["0x0bc877645ef93a63cf4ba85f1b4c801faf50f910978dd34909b184ea0e489aea", "0x26616488402ff4e8d5544f33721e3dc361a5cdf064175b7e709d5c7ebb1b5cc3"], ["0x2ac474948439a696b7cd9eef97dfc39982f9beb5b9a8eda03483229e5a196100", "0x06e7a8e54fb02b9a9245c7342788bd4ee9ba5cd5b028f5bbc235d20ee5d4d7aa"]], ["0x08529770f13a087234e5ff13427d46277830a6215e41797112e6521041769664", "0x0bd2862a1ecec4f62d7b5c68cae524f8bfff1cdbe98d1e0e1d43795740e92b78"]], ["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6", "0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc", "0x0000000000000000000000000000000000000000000000000000000000000372"]];
    var proof3 = [[["0x184bf659e78249d8f6b875740354a8229474eef4e039fa005e0c94cf6d18730f", "0x1dd379512de86bee64452ecb344776b5ef5e79773a9dec01e32729181bd17b96"], [["0x05bfbff5b2d026c9d64cbff625f11e54136158b84ade02801af157d09c6b1825", "0x0acecff510657e4a4dee8fd125d56eb0aa45ba2be7d80eee97eb2269c4dc8451"], ["0x179f3c91af951fedf7b216d92f695fad45470a104ae525c3d8d576e072d562bb", "0x2f3ba787cac75c2c3489d8940712c8b4c033311a985149c9b4d965da02e9e2ef"]], ["0x11e80b75b4f61f0f0cfc9e325bf5219827996048cdfbd8e051359bf3e766c48d", "0x04aa461b439182429664d76dbab3f50c73e37fef2435feb1915bae99e8d33da3"]], ["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6", "0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc", "0x0000000000000000000000000000000000000000000000000000000000002276"]];
    var proof4 = [[["0x28c44fe20ea2346f270b004004ca41acf16002c76e77e7c6b3fa37bb98766fb4", "0x2504d286b705ff28fd86e70c1da1479cfa6f3c17ad1dc1ea57f6bc455df74097"], [["0x063bec5006614c76259388347ba0b4e5e0f3e67b36bdfc0a10fdf5b7b88242e3", "0x24254541318be4ae435cb44b278c6d3a7a533968054d7107812facae8799e5ae"], ["0x060259403134eaa2354b48e878679d6b2e1df3ba7d213ef62ee63bb7db10bf56", "0x05f98dd3ee68a17b5cb418f4b4681658e73c1c5ed0f819fea12df85f10a975c0"]], ["0x1c18b42785fbd83d87050f6352f8543e6aee6f907a6e1be2b218764923f3ab96", "0x23507955e5596e8f9f6c29d82b5764ac3094ab2414abe4360d075c4e063580cc"]], ["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6", "0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc", "0x00000000000000000000000000000000000000000000000000000000000d7670"]];
    var challengeHashes = ['281969979063453985172741380982846584566', '88422393177988462612949727007266787516'];
    it("Should set a new challenge", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, betatester2, setChallengeTx;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2], betatester2 = _a[3];
                        console.log("verifier address", verifier.address);
                        return [4 /*yield*/, remix.connect(owner).setChallenge(verifier.address, challengeHashes, 3)];
                    case 2:
                        setChallengeTx = _b.sent();
                        return [4 /*yield*/, setChallengeTx.wait()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should refuse an invalid challenge", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, betatester2, invalidInput;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2], betatester2 = _a[3];
                        invalidInput = ["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6", "0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc", "0x000000000000000000000000000000000000000000000000000000000000002b"];
                        return [4 /*yield*/, (0, chai_1.expect)(remix.connect(betatester2).publishChallenge(proof1[0], invalidInput)).to.be.revertedWith("the provided proof isn't valid")];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should accept a challenge", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, betatester2, publishChallengeTx;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2], betatester2 = _a[3];
                        return [4 /*yield*/, remix.connect(betatester2).publishChallenge(proof1[0], proof1[1])];
                    case 2:
                        publishChallengeTx = _b.sent();
                        return [4 /*yield*/, publishChallengeTx.wait()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should refuse a challenge if proof has already been published", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, betatester2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2], betatester2 = _a[3];
                        return [4 /*yield*/, (0, chai_1.expect)(remix.connect(owner).publishChallenge(proof1[0], proof1[1])).to.be.revertedWith('proof already published')];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should refuse a challenge if sender already published a valid solution", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, betatester2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2], betatester2 = _a[3];
                        return [4 /*yield*/, (0, chai_1.expect)(remix.connect(betatester2).publishChallenge(proof2[0], proof2[1])).to.be.revertedWith('current published has already submitted')];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Published should reach maximum count", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, betatester2, user2, user3, pub2, pub3, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _c.sent(), owner = _a[0], betatester = _a[1], user = _a[2], betatester2 = _a[3], user2 = _a[4], user3 = _a[5];
                        return [4 /*yield*/, remix.connect(owner).publishChallenge(proof2[0], proof2[1])];
                    case 2:
                        pub2 = _c.sent();
                        return [4 /*yield*/, pub2.wait()];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, remix.connect(user2).publishChallenge(proof3[0], proof3[1])];
                    case 4:
                        pub3 = _c.sent();
                        return [4 /*yield*/, pub3.wait()];
                    case 5:
                        _c.sent();
                        _b = chai_1.expect;
                        return [4 /*yield*/, remix.publishersAmount()];
                    case 6:
                        _b.apply(void 0, [_c.sent()]).to.be.equal(3);
                        (0, chai_1.expect)(remix.connect(user3).publishChallenge(proof4[0], proof4[1])).to.revertedWith('publishers reached maximum amount');
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should re-set a new challenge", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, betatester2, setChallengeTx;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2], betatester2 = _a[3];
                        console.log("verifier address", verifier.address);
                        return [4 /*yield*/, remix.connect(owner).setChallenge(verifier.address, challengeHashes, 3)];
                    case 2:
                        setChallengeTx = _b.sent();
                        return [4 /*yield*/, setChallengeTx.wait()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should refuse again an invalid challenge", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, betatester2, invalidInput;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2], betatester2 = _a[3];
                        invalidInput = ["0x00000000000000000000000000000000d421714eddc84195ee8f80d5379cf6f6", "0x0000000000000000000000000000000042858891fcb526e577de0810598b50bc", "0x000000000000000000000000000000000000000000000000000000000000002b"];
                        return [4 /*yield*/, (0, chai_1.expect)(remix.connect(betatester2).publishChallenge(proof1[0], invalidInput)).to.be.revertedWith("the provided proof isn't valid")];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it("Should accept again a challenge", function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, betatester, user, betatester2, publishChallengeTx;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), owner = _a[0], betatester = _a[1], user = _a[2], betatester2 = _a[3];
                        return [4 /*yield*/, remix.connect(betatester2).publishChallenge(proof1[0], proof1[1])];
                    case 2:
                        publishChallengeTx = _b.sent();
                        return [4 /*yield*/, publishChallengeTx.wait()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
});
