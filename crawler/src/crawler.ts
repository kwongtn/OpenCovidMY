import { httpGet } from "./mkini";

import { js_beautify } from "js-beautify";

import * as fs from "fs";

import {
  ConvertedClass,
  DataClass,
  DeterminedClass,
  ParsedClass,
  ProjectDistrictData,
  ProjectMukimData,
  ProjectStateData,
  ProjectStateDataSingle,
  UnDeterminedClass,
} from "../models/thisProject";

const JSSoup = require("jssoup").default;
//import JSSoup from 'jssoup';

import {
  clusterParser,
  determineClass,
  districtDataConverter,
  districtParser,
  findScript,
  mukimDataConverter,
  mukimParser,
  stateDataConverter,
  stateParser,
} from "./parser";
import { logger, numString } from "./utils";
import {
  MkiniDistrictData,
  MkiniMukimData,
  MkiniStateData,
} from "../models/mkini";
var counter = 0;

logger("GET\t\t: Getting data from webpage... ");

httpGet("https://newslab.malaysiakini.com/covid-19/en")
  .then(
    (htmlResponse: string): Promise<Array<string>> => {
      // Find relavant scripts from html response

      logger("PARSE\t: Parsing HTML... ");
      return findScript(htmlResponse);
    }
  )
  .then(
    async (
      interestedURLs: Array<string>
    ): Promise<Array<UnDeterminedClass>> => {
      logger(
        "PARSE\t: HTML Parsing Complete. Total " +
          interestedURLs.length +
          " scripts found."
      );

      // Get script content

      function getScriptContent(url: string): Promise<UnDeterminedClass> {
        return httpGet(url).then((myContent: string) => {
          return {
            url: url,
            content: myContent,
          };
        });
      }

      return await new Promise<Array<UnDeterminedClass>>((resolve, reject) => {
        logger("GET\t\t: Getting script content..");

        let interestedScripts: Array<Promise<UnDeterminedClass>> = [];
        interestedURLs.forEach(async (value: string, index: number) => {
          interestedScripts.push(getScriptContent(value));
        });

        Promise.all(interestedScripts).then(
          (scripts: Array<UnDeterminedClass>) => {
            logger("GET\t\t: Completed getting scripts.");
            resolve(scripts);
          }
        );
      });
    }
  )
  .then(async (interestedScripts: Array<UnDeterminedClass>) => {
    logger("STRUCTURE\t: Determining content classes..");
    // Preetify content and Determine class

    function getScriptType(
      script: UnDeterminedClass
    ): Promise<DeterminedClass> {
      return determineClass(script.content, counter++).then(
        (dataClass: DataClass) => {
          return {
            url: script.url,
            content: script.content,
            type: dataClass,
          };
        }
      );
    }

    return await new Promise<Array<DeterminedClass>>((resolve, reject) => {
      let jobList: Array<Promise<DeterminedClass>> = [];
      interestedScripts.forEach((value: UnDeterminedClass, index: number) => {
        value.content = js_beautify(value.content);
        jobList.push(getScriptType(value));
      });

      Promise.all(jobList).then((determinedData: Array<DeterminedClass>) => {
        logger("STRUCTURE\t: Completed determining classes.");
        resolve(determinedData);
      });
    });
  })
  .then((determinedData: Array<DeterminedClass>) => {
    logger(
      "FILTER\t: Filtering " + determinedData.length + " obtained content.."
    );

    // Filter off uninterested types

    return determinedData.filter((value) => {
      return value.type != "none";
    });
  })
  .then(async (filteredRes: Array<DeterminedClass>) => {
    logger(
      "FILTER\t: Obtained " + filteredRes.length + " results. (Expected 4)"
    );

    // Parse based on type

    return await new Promise<Array<ParsedClass>>(
      (resolve: any, reject: any) => {
        let jobList: Array<Promise<ParsedClass>> = [];
        filteredRes.forEach((value: DeterminedClass) => {
          if (value.type == "state") {
            logger("PARSE\t: Parsing state data.. ");
            jobList.push(stateParser(value));
          } else if (value.type == "district") {
            logger("PARSE\t: Parsing district data.. ");
            jobList.push(districtParser(value));
          } else if (value.type == "mukim") {
            logger("PARSE\t: Parsing mukim data.. ");
            jobList.push(mukimParser(value));
          } else if (value.type == "cluster") {
            logger("PARSE\t: Parsing cluster data.. ");
            jobList.push(clusterParser(value));
          }
        });

        Promise.all(jobList).then((parsedData: Array<ParsedClass>) => {
          logger("PARSE\t: Completed parsing all data.");
          resolve(parsedData);
        });
      }
    );
  })
  .then(async (data: Array<ParsedClass>) => {
    logger("SAVE_RAW\t: Saving obtained raw data..");
    // Save parsed raw data

    const date = new Date();
    const preString: string =
      "" +
      numString(date.getFullYear()) +
      numString(date.getMonth() + 1) +
      numString(date.getDate());

    data.forEach((value: ParsedClass) => {
      logger("SAVE_RAW\t: Saving " + value.type + " raw data..");

      fs.writeFile(
        "../../misc/raw/" +
          value.type +
          "/" +
          preString +
          "-" +
          value.type +
          "-raw.json",
        js_beautify(value.parsedString),
        "utf-8",
        (err) => {
          if (err != null) {
            logger("SAVE_RAW\t: ERROR: [" + value.type + "]" + err);
          } else {
            logger("SAVE_RAW\t: Completed saving " + value.type + " raw data.");
          }
        }
      );
    });

    function dataConvert(value: ParsedClass): Promise<ConvertedClass> {
      return new Promise((resolve, reject) => {});
    }

    // Since saving and conversion can be run asynchronously, I won't separate out conversion
    return await new Promise<Array<ConvertedClass>>((resolve, reject) => {
      let jobList: Array<Promise<ConvertedClass>> = [];
      data.forEach(async (value: ParsedClass) => {
        if (value.type == "state") {
          logger("CONVERT\t: Converting state data.. ");
          jobList.push(stateDataConverter(value));
        } else if (value.type == "district") {
          logger("CONVERT\t: Converting district data.. ");

          jobList.push(districtDataConverter(value));
        } else if (value.type == "mukim") {
          jobList.push(mukimDataConverter(value));
        } else if (value.type == "cluster") {
          logger("CONVERT\t: Cluster data conversion skipped");
        } else {
          logger("CONVERT\t: Data type out of range");
          reject("Out of range.");
        }
      });

      Promise.all(jobList).then((convertedData: Array<ConvertedClass>) => {
        resolve(convertedData);
      });
    });
  })
  .then(async (data: Array<ConvertedClass>) => {
    logger("SAVE_PROC\t: Saving processed data..");
    // Save parsed raw data

    const date = new Date();
    const preString: string =
      "" +
      numString(date.getFullYear()) +
      numString(date.getMonth() + 1) +
      numString(date.getDate());
    data
      .filter((value: ConvertedClass) => value.type != "cluster")
      .forEach((value: ConvertedClass) => {
        logger("SAVE_PROC\t: Saving " + value.type + " processed data..");
        fs.writeFile(
          "../../data/" +
            value.type +
            "/" +
            preString +
            "-" +
            value.type +
            ".json",
          js_beautify(value.convertedString),
          "utf-8",
          (err) => {
            if (err != null) {
              logger("SAVE_PROC\t: ERROR: [" + value.type + "]" + err);
            } else {
              logger(
                "SAVE_PROC\t: Completed saving " +
                  value.type +
                  " processed data."
              );
            }
          }
        );
      });
  })
  .catch((err) => {
    console.log(err);
  });
