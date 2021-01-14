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
const mkini_1 = require("./mkini");
const js_beautify_1 = require("js-beautify");
const fs = require("fs");
const envs = require("./envs");
const JSSoup = require("jssoup").default;
//import JSSoup from 'jssoup';
const parser_1 = require("./parser");
const utils_1 = require("./utils");
var counter = 0;
// Function to generate filename prefixes
const date = new Date(new Date().getTime() - 86400000);
const preString = "" +
    utils_1.numString(date.getFullYear()) +
    utils_1.numString(date.getMonth() + 1) +
    utils_1.numString(date.getDate());
utils_1.logger("GET\t\t: Getting data from webpage... ");
mkini_1.httpGet("https://newslab.malaysiakini.com/covid-19/my")
    .then((htmlResponse) => {
    // Find relavant scripts from html response
    utils_1.logger("PARSE\t: Parsing HTML... ");
    return parser_1.findScript(htmlResponse);
})
    .then((interestedURLs) => __awaiter(void 0, void 0, void 0, function* () {
    utils_1.logger("PARSE\t: HTML Parsing Complete. Total " +
        interestedURLs.length +
        " scripts found.");
    // Get script content
    function getScriptContent(url) {
        return mkini_1.httpGet(url).then((myContent) => {
            return {
                url: url,
                content: myContent,
            };
        });
    }
    return yield new Promise((resolve, reject) => {
        utils_1.logger("GET\t\t: Getting script content..");
        let interestedScripts = [];
        interestedURLs.forEach((value, index) => __awaiter(void 0, void 0, void 0, function* () {
            interestedScripts.push(getScriptContent(value));
        }));
        Promise.all(interestedScripts).then((scripts) => {
            utils_1.logger("GET\t\t: Completed getting scripts.");
            resolve(scripts);
        });
    });
}))
    .then((interestedScripts) => __awaiter(void 0, void 0, void 0, function* () {
    utils_1.logger("STRUCTURE\t: Determining content classes..");
    // Preetify content and Determine class
    function getScriptType(script) {
        return parser_1.determineClass(script.content, counter++).then((dataClass) => {
            return {
                url: script.url,
                content: script.content,
                type: dataClass,
            };
        });
    }
    return yield new Promise((resolve, reject) => {
        let jobList = [];
        interestedScripts.forEach((value, index) => {
            value.content = js_beautify_1.js_beautify(value.content);
            jobList.push(getScriptType(value));
        });
        Promise.all(jobList).then((determinedData) => {
            utils_1.logger("STRUCTURE\t: Completed determining classes.");
            resolve(determinedData);
        });
    });
}))
    .then((determinedData) => {
    if (envs.DEBUG) {
        utils_1.logger("DEBUG: ");
        determinedData.forEach((value, index) => {
            console.log(value.type + ": " + value.url);
        });
    }
    utils_1.logger("FILTER\t: Filtering " + determinedData.length + " obtained content..");
    // Filter off uninterested types
    return determinedData.filter((value) => {
        return value.type != "none";
    });
})
    .then((filteredRes) => __awaiter(void 0, void 0, void 0, function* () {
    utils_1.logger("FILTER\t: Obtained " + filteredRes.length + " results. (Expected 6)");
    // Parse based on type
    return yield new Promise((resolve, reject) => {
        let jobList = [];
        filteredRes.forEach((value) => {
            if (value.type == "state") {
                utils_1.logger("PARSE\t: Parsing state data.. ");
                jobList.push(parser_1.stateParser(value));
            }
            else if (value.type == "district") {
                utils_1.logger("PARSE\t: Parsing district data.. ");
                jobList.push(parser_1.districtParser(value));
            }
            else if (value.type == "mukim") {
                utils_1.logger("PARSE\t: Parsing mukim data.. ");
                jobList.push(parser_1.mukimParser(value));
            }
            else if (value.type == "cluster") {
                utils_1.logger("PARSE\t: Parsing cluster data.. ");
                jobList.push(parser_1.clusterParser(value));
            }
            else if (value.type == "foreigner") {
                utils_1.logger("PARSE\t: Parsing foreigner data.. ");
                jobList.push(parser_1.foreignerParser(value));
            }
            else if (value.type == "general") {
                utils_1.logger("PARSE\t: Parsing general data.. ");
                jobList.push(parser_1.generalParser(value));
            }
        });
        Promise.all(jobList).then((parsedData) => {
            utils_1.logger("PARSE\t: Completed parsing all data.");
            resolve(parsedData);
        });
    });
}))
    .then((data) => __awaiter(void 0, void 0, void 0, function* () {
    utils_1.logger("SAVE_RAW\t: Saving obtained raw data..");
    // Save parsed raw data
    data.forEach((value) => {
        utils_1.logger("SAVE_RAW\t: Saving " + value.type + " raw data..");
        fs.writeFile("../../misc/raw/" +
            value.type +
            "/" +
            preString +
            "-" +
            value.type +
            "-raw.json", js_beautify_1.js_beautify(value.parsedString), "utf-8", (err) => {
            if (err != null) {
                utils_1.logger("SAVE_RAW\t: ERROR: [" + value.type + "]" + err);
            }
            else {
                utils_1.logger("SAVE_RAW\t: Completed saving " + value.type + " raw data.");
            }
        });
    });
    // Since saving and conversion can be run asynchronously, I won't separate out conversion
    return yield new Promise((resolve, reject) => {
        let jobList = [];
        data.forEach((value) => __awaiter(void 0, void 0, void 0, function* () {
            if (value.type == "state") {
                utils_1.logger("CONVERT\t: Converting state data.. ");
                jobList.push(parser_1.stateDataConverter(value));
            }
            else if (value.type == "district") {
                utils_1.logger("CONVERT\t: Converting district data.. ");
                jobList.push(parser_1.districtDataConverter(value));
            }
            else if (value.type == "mukim") {
                jobList.push(parser_1.mukimDataConverter(value));
            }
            else if (value.type == "general") {
                jobList.push(parser_1.generalDataConverter(value));
            }
            else if (value.type == "cluster") {
                utils_1.logger("CONVERT\t: Cluster data conversion skipped");
            }
            else {
                utils_1.logger("CONVERT\t: Data type out of range");
                // reject("Out of range.");
            }
        }));
        Promise.all(jobList).then((convertedData) => {
            resolve(convertedData);
        });
    });
}))
    .then((data) => __awaiter(void 0, void 0, void 0, function* () {
    utils_1.logger("SAVE_PROC\t: Saving processed data..");
    // Save parsed raw data
    data
        .filter((value) => value.type != "cluster")
        .forEach((value) => {
        utils_1.logger("SAVE_PROC\t: Saving " + value.type + " processed data..");
        fs.writeFile("../../data/" +
            value.type +
            "/" +
            preString +
            "-" +
            value.type +
            ".json", js_beautify_1.js_beautify(value.convertedString), "utf-8", (err) => {
            if (err != null) {
                utils_1.logger("SAVE_PROC\t: ERROR: [" + value.type + "]" + err);
            }
            else {
                utils_1.logger("SAVE_PROC\t: Completed saving " +
                    value.type +
                    " processed data.");
            }
        });
    });
}))
    .catch((err) => {
    console.log(err);
});
//# sourceMappingURL=crawler.js.map