#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
exports.__esModule = true;
var SVGSpriter = require("svg-sprite");
var argv = require("argv");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var colors = require("chalk");
var glob = require("glob");
var cwd = process.cwd();
argv.option({
    name: 'icons',
    short: 'i',
    type: 'string',
    description: 'The relative path to the directory containing your SVG icons',
    example: "'packmule --i=./icons' or 'packmule -i ./icons'"
});
argv.option({
    name: 'out',
    short: 'o',
    type: 'string',
    description: 'The relative path to the output directory of the CSS and SVG sprite',
    example: "'packmule --o=./assets/icons' or 'packmule -i ./assets/icons'"
});
var saveGeneratedFiles = function (err, result) {
    if (err) {
        console.warn(err);
        return;
    }
    Object.keys(result).forEach(function (mode) {
        Object.keys(result[mode]).forEach(function (file) {
            var filePath = result[mode][file].path;
            writeFile(filePath, result[mode][file].contents)
                .then(function (response) {
                console.log(colors.green('  generated file:'), filePath);
                return response;
            });
        });
    });
};
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var args, outDir, iconsDir, typesFile, files, spriter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = argv.run();
                    outDir = path.join(cwd, args.options.out);
                    console.log(outDir);
                    iconsDir = path.join(cwd, args.options.icons);
                    typesFile = path.join(cwd, args.options.out + "/icons.d.ts");
                    return [4 /*yield*/, getSvgFiles(iconsDir)];
                case 1:
                    files = _a.sent();
                    console.log("Generating svg sprite for " + colors.blue("" + files.length) + " icons in", colors.dim(iconsDir));
                    return [4 /*yield*/, compileIconTypes(typesFile, files)];
                case 2:
                    _a.sent();
                    spriter = new SVGSpriter({
                        outDir: outDir,
                        shape: {
                            spacing: {
                                padding: 1
                            }
                        },
                        mode: {
                            css: {
                                render: {
                                    css: true
                                }
                            },
                            symbol: {
                                sprite: 'sprite.svg',
                                example: true
                            }
                        }
                    });
                    files.forEach(function (file) {
                        var svgPath = iconsDir + "/" + file;
                        spriter.add(path.resolve(svgPath), file, fs.readFileSync(svgPath).toString());
                    });
                    spriter.compile(saveGeneratedFiles);
                    return [2 /*return*/];
            }
        });
    });
}
function writeFile(filePath, content) {
    return new Promise(function (resolve, reject) {
        mkdirp.sync(path.dirname(filePath));
        fs.writeFile(filePath, content, function (err, response) {
            if (err) {
                reject(err);
            }
            resolve(response);
        });
    });
}
function getSvgFiles(iconsDir) {
    return new Promise(function (resolve, reject) {
        glob("**/*.svg", { cwd: iconsDir }, function (err, files) {
            if (err) {
                return reject(err);
            }
            resolve(files);
        });
    });
}
function compileIconTypes(typesFile, files) {
    var typeDefinition = files
        .map(function (file) { return '\'' + file.replace('.svg', '') + '\''; })
        .join(' |\n  ');
    var content = "declare namespace Icons {\n  type Icon =\n  " + typeDefinition + "\n}\n";
    return writeFile(typesFile, content)
        .then(function () { return console.log(colors.green("Icon types written to:"), colors.green(typesFile)); });
}
run();
