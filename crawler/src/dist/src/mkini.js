"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpGet = void 0;
const axios_1 = require("axios");
const env = require("./envs");
function httpGet(url) {
    return new Promise((resolve, reject) => {
        if (env.TESTING_MODE) {
            resolve(env.testHTML);
        }
        else {
            const config = {
                method: "GET",
                url: url,
            };
            axios_1.default(config)
                .then((response) => {
                resolve(response.data);
            })
                .catch((error) => {
                console.log(error);
                reject("HTTP GET error: " + error);
            });
        }
    });
}
exports.httpGet = httpGet;
//# sourceMappingURL=mkini.js.map