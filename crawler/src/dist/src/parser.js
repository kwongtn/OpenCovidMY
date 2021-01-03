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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalDataConverter = exports.mukimDataConverter = exports.districtDataConverter = exports.stateDataConverter = exports.generalParser = exports.foreignerParser = exports.clusterParser = exports.mukimParser = exports.districtParser = exports.stateParser = exports.determineClass = exports.findScript = void 0;
const JSSoup = require("jssoup").default;
const utils_1 = require("./utils");
function findScript(htmlResponse) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const soup = new JSSoup(htmlResponse);
        var iterationVar = soup.find("head").find("link");
        let interestedURLs = [];
        try {
            while (iterationVar != undefined) {
                // Get scripts that are defined as preloaded
                if (iterationVar.attrs != undefined &&
                    iterationVar.attrs.href != undefined &&
                    iterationVar.attrs.rel == "preload") {
                    // // Narrow down scripts to be queried
                    // if (/.*(static).*\.js/g.test(iterationVar.attrs.href)) {
                    //   if (
                    //     !/.*(static).*(?=)(framework|styles).*\.js/g.test(
                    //       iterationVar.attrs.href
                    //     )
                    //   ) {
                    //     interestedURLs.push(iterationVar.attrs.href);
                    //   }
                    // }
                    interestedURLs.push(iterationVar.attrs.href);
                }
                iterationVar = iterationVar.nextElement;
            }
        }
        catch (err) {
            reject(err);
        }
        // // Get stuff within script tags
        // iterationVar = soup.find("body").find("script");
        // try {
        //   while (iterationVar != undefined) {
        //     // Get scripts that are defined as preloaded
        //     if (
        //       iterationVar.attrs != undefined &&
        //       iterationVar.attrs.src != undefined
        //     ) {
        //       // Narrow down scripts to be queried
        //       if (/.*(chunks).*\.js/g.test(iterationVar.attrs.src)) {
        //         if (
        //           !/.*(chunks)\/(?=)(framework|styles).*\.js/g.test(
        //             iterationVar.attrs.src
        //           )
        //         ) {
        //           interestedURLs.push(iterationVar.attrs.src);
        //         }
        //       }
        //     }
        //     iterationVar = iterationVar.nextElement;
        //   }
        // } catch (err) {
        //   reject(err);
        // }
        resolve(interestedURLs);
    }));
}
exports.findScript = findScript;
// import * as fs from "fs";
function determineClass(htmlResponse, counter) {
    return new Promise((resolve) => {
        // fs.writeFileSync("../" + counter + ".js", htmlResponse);
        // Check if contain state data
        if (/\[{.*{"state":"Kelantan".*}]/g.test(htmlResponse)) {
            // Check if contain district data
            if (/\[{.*"district":"Bachok".*}]/g.test(htmlResponse)) {
                // Check if contain mukim data
                if (/\[{.*"mukim":"Sg Panjang".*}]/g.test(htmlResponse)) {
                    utils_1.logger("DETERMINE\t: Detected mukim data");
                    resolve("mukim");
                }
                else {
                    utils_1.logger("DETERMINE\t: Detected district data");
                    resolve("district");
                }
            }
            else {
                utils_1.logger("DETERMINE\t: Detected state data");
                resolve("state");
            }
        }
        else if (
        // Check if contain cluster data
        /[aet]\.exports = JSON\.parse\('\[{"enName":"Total"/g.test(htmlResponse)) {
            utils_1.logger("DETERMINE\t: Detected cluster data");
            resolve("cluster");
        }
        else if (
        // Check if contain foreigner batch testing data
        /\[{.*"depot":"Foreigners".*}]/g.test(htmlResponse)) {
            utils_1.logger("DETERMINE\t: Detected foreigner data");
            resolve("foreigner");
        }
        else if (/\s*[aet]\.exports = JSON\.parse\('{\"version\":\"1\.0\",\"encoding\":\"UTF-8\"/g.test(htmlResponse)) {
            utils_1.logger("DETERMINE\t: Detected general data");
            resolve("general");
        }
        else {
            resolve("none");
        }
    });
}
exports.determineClass = determineClass;
// A function that cleans data based on edge cases
function cleaner(dirtyString) {
    return dirtyString
        .replace(/"\\\\"\\u/g, '"\\u')
        .replace(/\\\\"",/g, '",')
        .replace(/\\\'/g, "'");
}
function stateParser(rawData) {
    return new Promise((resolve, reject) => {
        // Narrow down search based on the 'e.exports' string
        const narrowedData = /[et].exports = JSON\.parse.*\]/g.exec(rawData.content);
        if (narrowedData) {
            const extractedData = /\[.*\]/g.exec(narrowedData === null || narrowedData === void 0 ? void 0 : narrowedData[0]);
            if (extractedData) {
                resolve({
                    url: rawData.url,
                    content: rawData.content,
                    type: rawData.type,
                    parsed: JSON.parse(extractedData === null || extractedData === void 0 ? void 0 : extractedData[0]),
                    parsedString: extractedData === null || extractedData === void 0 ? void 0 : extractedData[0],
                });
            }
        }
    });
}
exports.stateParser = stateParser;
function districtParser(rawData) {
    return new Promise((resolve, reject) => {
        // Narrow down search based on the 't.exports' string
        const narrowedData = /[aet].exports = JSON\.parse.*\]/g.exec(rawData.content);
        if (narrowedData) {
            const extractedData = /\[.*\]/g.exec(narrowedData === null || narrowedData === void 0 ? void 0 : narrowedData[0]);
            if (extractedData) {
                resolve({
                    url: rawData.url,
                    content: rawData.content,
                    type: rawData.type,
                    parsed: JSON.parse(extractedData === null || extractedData === void 0 ? void 0 : extractedData[0]),
                    parsedString: extractedData === null || extractedData === void 0 ? void 0 : extractedData[0],
                });
            }
        }
    });
}
exports.districtParser = districtParser;
function mukimParser(rawData) {
    return new Promise((resolve, reject) => {
        // Narrow down search based on the 'e.exports' string
        const narrowedData = /[aet].exports = JSON\.parse.*\]/g.exec(rawData.content);
        if (narrowedData) {
            const extractedData = /\[.*\]/g.exec(narrowedData === null || narrowedData === void 0 ? void 0 : narrowedData[0]);
            if (extractedData) {
                resolve({
                    url: rawData.url,
                    content: rawData.content,
                    type: rawData.type,
                    parsed: JSON.parse(cleaner(extractedData === null || extractedData === void 0 ? void 0 : extractedData[0])),
                    parsedString: cleaner(extractedData === null || extractedData === void 0 ? void 0 : extractedData[0]),
                });
            }
        }
    });
}
exports.mukimParser = mukimParser;
function clusterParser(rawData) {
    return new Promise((resolve, reject) => {
        // Narrow down search based on the 'e.exports' string
        const narrowedData = /[aet].exports = JSON\.parse.*\]/g.exec(rawData.content);
        if (narrowedData) {
            const extractedData = /\[.*\]/g.exec(narrowedData === null || narrowedData === void 0 ? void 0 : narrowedData[0]);
            if (extractedData) {
                resolve({
                    url: rawData.url,
                    content: rawData.content,
                    type: rawData.type,
                    parsed: JSON.parse(cleaner(extractedData === null || extractedData === void 0 ? void 0 : extractedData[0])),
                    parsedString: cleaner(extractedData === null || extractedData === void 0 ? void 0 : extractedData[0]),
                });
            }
        }
    });
}
exports.clusterParser = clusterParser;
function foreignerParser(rawData) {
    return new Promise((resolve, reject) => {
        // Narrow down search based on the 'e.exports' string
        const narrowedData = /[aet].exports = JSON\.parse.*\]/g.exec(rawData.content);
        if (narrowedData) {
            const extractedData = /\[.*\]/g.exec(narrowedData === null || narrowedData === void 0 ? void 0 : narrowedData[0]);
            if (extractedData) {
                resolve({
                    url: rawData.url,
                    content: rawData.content,
                    type: rawData.type,
                    parsed: JSON.parse(cleaner(extractedData === null || extractedData === void 0 ? void 0 : extractedData[0])),
                    parsedString: cleaner(extractedData === null || extractedData === void 0 ? void 0 : extractedData[0]),
                });
            }
        }
    });
}
exports.foreignerParser = foreignerParser;
function generalParser(rawData) {
    return new Promise((resolve, reject) => {
        // Narrow down search based on the 'e.exports' string
        const narrowedData = /[aet]\.exports = JSON\.parse.*\]}}/g.exec(rawData.content);
        if (narrowedData) {
            const extractedData = /\{.*}}\]}}/g.exec(narrowedData === null || narrowedData === void 0 ? void 0 : narrowedData[0]);
            if (extractedData) {
                resolve({
                    url: rawData.url,
                    content: rawData.content,
                    type: rawData.type,
                    parsed: JSON.parse(cleaner(extractedData === null || extractedData === void 0 ? void 0 : extractedData[0])),
                    parsedString: cleaner(extractedData === null || extractedData === void 0 ? void 0 : extractedData[0]),
                });
            }
        }
    });
}
exports.generalParser = generalParser;
// -----------------------------------
// Converters start here
// -----------------------------------
function stateDataConverter(raw) {
    return new Promise((resolve, reject) => {
        var stateData = [];
        const workingArray = raw.parsed;
        workingArray.forEach((value, index) => {
            stateData.push({
                state: value.state,
                confirmed: value.confirmed,
                newCases: value.newCases,
                importedNewCases: value.importedNewCases,
                death: value.death,
                newDeath: value.newDeath,
                active: value.active ? value.active : 0,
                changeActive: value.newActive,
                activeFourteen: value.fourteen,
                changeActiveFourteen: value.newFourteen ? value.newFourteen : 0,
            });
            if (index == workingArray.length - 1) {
                resolve({
                    content: raw.content,
                    parsed: raw.parsed,
                    parsedString: raw.parsedString,
                    converted: stateData,
                    convertedString: JSON.stringify(stateData),
                    type: raw.type,
                    url: raw.url,
                });
            }
        });
    });
}
exports.stateDataConverter = stateDataConverter;
function districtDataConverter(raw) {
    return new Promise((resolve, reject) => {
        var districtData = [];
        const workingArray = raw.parsed;
        workingArray.forEach((value, index) => {
            districtData.push({
                state: value.state,
                district: value.district,
                cases: value.confirmed ? value.confirmed : 0,
                newCases: value.new ? value.new : 0,
                active: value.activeCases ? value.activeCases : 0,
                changeActive: value.newActive ? value.newActive : 0,
                activeFourteen: value.fourteen ? value.fourteen : 0,
                changeActiveFourteen: value.newFourteen ? value.newFourteen : 0,
            });
            if (index == workingArray.length - 1) {
                resolve({
                    content: raw.content,
                    parsed: raw.parsed,
                    parsedString: raw.parsedString,
                    converted: districtData,
                    convertedString: JSON.stringify(districtData),
                    type: raw.type,
                    url: raw.url,
                });
            }
        });
    });
}
exports.districtDataConverter = districtDataConverter;
function mukimDataConverter(raw) {
    return new Promise((resolve, reject) => {
        var mukimData = [];
        const workingArray = raw.parsed;
        workingArray.forEach((value, index) => {
            mukimData.push({
                state: value.state,
                district: value.district,
                mukim: value.mukim,
                cases: value.cases ? value.cases : 0,
                newCases: value.newCases ? value.newCases : 0,
                active: value.active ? value.active : 0,
                changeActive: value.newActive ? value.newActive : 0,
                activeFourteen: value.fourteen ? value.fourteen : 0,
                changeActiveFourteen: value.newFourteen ? value.newFourteen : 0,
            });
            if (index == workingArray.length - 1) {
                resolve({
                    content: raw.content,
                    parsed: raw.parsed,
                    parsedString: raw.parsedString,
                    converted: mukimData,
                    convertedString: JSON.stringify(mukimData),
                    type: raw.type,
                    url: raw.url,
                });
            }
        });
    });
}
exports.mukimDataConverter = mukimDataConverter;
function generalDataConverter(raw) {
    return new Promise((resolve, reject) => {
        const workingObj = raw.parsed;
        const generalData = {
            positiveTested: workingObj.feed.entry[0].gsx$positif.$t != ""
                ? parseInt(workingObj.feed.entry[0].gsx$positif.$t)
                : null,
            negativeTested: workingObj.feed.entry[0].gsx$negatif.$t != ""
                ? parseInt(workingObj.feed.entry[0].gsx$negatif.$t)
                : null,
            pending: workingObj.feed.entry[0].gsx$pending.$t != ""
                ? parseInt(workingObj.feed.entry[0].gsx$pending.$t)
                : null,
            timestamp: workingObj.feed.entry[0].gsx$timestamp.$t,
        };
        resolve({
            content: raw.content,
            parsed: raw.parsed,
            parsedString: raw.parsedString,
            converted: generalData,
            convertedString: JSON.stringify(generalData),
            type: raw.type,
            url: raw.url,
        });
    });
}
exports.generalDataConverter = generalDataConverter;
//# sourceMappingURL=parser.js.map