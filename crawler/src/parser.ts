const JSSoup = require("jssoup").default;

import { rejects } from "assert";
import { logger } from "./utils";
import {
  MkiniClusterData,
  MkiniDistrictData,
  MkiniDistrictDataSingle,
  MkiniForeignerData,
  MkiniGeneralData,
  MkiniMukimData,
  MkiniMukimDataSingle,
  MkiniStateData,
  MkiniStateDataSingle,
} from "../models/mkini";
import {
  ConvertedClass,
  DataClass,
  DeterminedClass,
  ParsedClass,
  ProjectDistrictData,
  ProjectGeneralData,
  ProjectMukimData,
  ProjectStateData,
  ProjectStateDataSingle,
} from "../models/thisProject";

export function findScript(htmlResponse: string): Promise<Array<string>> {
  return new Promise(async (resolve, reject) => {
    const soup = new JSSoup(htmlResponse);
    var iterationVar = soup.find("head").find("link");

    let interestedURLs: Array<string> = [];
    try {
      while (iterationVar != undefined) {
        // Get scripts that are defined as preloaded
        if (
          iterationVar.attrs != undefined &&
          iterationVar.attrs.href != undefined &&
          iterationVar.attrs.rel == "preload"
        ) {
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
    } catch (err) {
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
  });
}

// import * as fs from "fs";

export function determineClass(
  htmlResponse: string,
  counter: number
): Promise<DataClass> {
  return new Promise((resolve) => {
    // fs.writeFileSync("../" + counter + ".js", htmlResponse);
    // Check if contain state data
    if (/\[{.*{"state":"Kelantan".*}]/g.test(htmlResponse)) {
      // Check if contain district data
      if (/\[{.*"district":"Bachok".*}]/g.test(htmlResponse)) {
        // Check if contain mukim data
        if (/\[{.*"mukim":"Sg Panjang".*}]/g.test(htmlResponse)) {
          logger("DETERMINE\t: Detected mukim data");
          resolve("mukim");
        } else {
          logger("DETERMINE\t: Detected district data");
          resolve("district");
        }
      } else {
        logger("DETERMINE\t: Detected state data");
        resolve("state");
      }
    } else if (
      // Check if contain cluster data
      /[aet]\.exports = JSON\.parse\('\[{"enName":"Total"/g.test(htmlResponse)
    ) {
      logger("DETERMINE\t: Detected cluster data");
      resolve("cluster");
    } else if (
      // Check if contain foreigner batch testing data
      /\[{.*"depot":"Foreigners".*}]/g.test(htmlResponse)
    ) {
      logger("DETERMINE\t: Detected foreigner data");
      resolve("foreigner");
    } else if (
      /\s*[aet]\.exports = JSON\.parse\('{\"version\":\"1\.0\",\"encoding\":\"UTF-8\"/g.test(
        htmlResponse
      )
    ) {
      logger("DETERMINE\t: Detected general data");
      resolve("general");
    } else {
      resolve("none");
    }
  });
}

// A function that cleans data based on edge cases
function cleaner(dirtyString: string): string {
  return dirtyString
    .replace(/"\\\\"\\u/g, '"\\u')
    .replace(/\\\\"",/g, '",')
    .replace(/\\\'/g, "'")
    .replace(/: \\\\/g, '":')
    .replace(
      /"dateUpdate":"mukimNe":"\\u092a\\u0928\\u094d\\u091a\\u0902\\u0917  \\u092c\\u0947\\u0926\\u0947\\u0928\\u093e\\\\",","activeCases"/g,
      '"dateUpdate": "2020-01-24","mukimNe":"\\u092a\\u0928\\u094d\\u091a\\u0902\\u0917  \\u092c\\u0947\\u0926\\u0947\\u0928\\u093e\\\\","activeCases"'
    );
  // Temporary cleaning
}

export function stateParser(rawData: DeterminedClass): Promise<ParsedClass> {
  return new Promise((resolve, reject) => {
    // Narrow down search based on the 'e.exports' string
    const narrowedData = /[et].exports = JSON\.parse.*\]/g.exec(
      rawData.content
    );

    if (narrowedData) {
      const extractedData = /\[.*\]/g.exec(narrowedData?.[0]);
      if (extractedData) {
        resolve({
          url: rawData.url,
          content: rawData.content,
          type: rawData.type,
          parsed: JSON.parse(extractedData?.[0]) as MkiniStateData,
          parsedString: extractedData?.[0],
        });
      }
    }
  });
}

import * as fs from "fs";
export function districtParser(rawData: DeterminedClass): Promise<ParsedClass> {
  return new Promise((resolve, reject) => {
    // Narrow down search based on the 't.exports' string
    const narrowedData = /[aet].exports = JSON\.parse.*\]/g.exec(
      rawData.content
    );

    if (narrowedData) {
      const extractedData = /\[.*\]/g.exec(narrowedData?.[0]);
      if (extractedData) {
        const cleanedData = cleaner(extractedData?.[0]);
        fs.writeFileSync("../../stateDebug.json", cleanedData);
        resolve({
          url: rawData.url,
          content: rawData.content,
          type: rawData.type,
          parsed: (JSON.parse(cleanedData) as unknown) as MkiniDistrictData,
          parsedString: cleanedData,
        });
      }
    }
  });
}

export function mukimParser(rawData: DeterminedClass): Promise<ParsedClass> {
  return new Promise((resolve, reject) => {
    // Narrow down search based on the 'e.exports' string
    const narrowedData = /[aet].exports = JSON\.parse.*\]/g.exec(
      rawData.content
    );

    if (narrowedData) {
      const extractedData = /\[.*\]/g.exec(narrowedData?.[0]);
      if (extractedData) {
        resolve({
          url: rawData.url,
          content: rawData.content,
          type: rawData.type,
          parsed: JSON.parse(cleaner(extractedData?.[0])) as MkiniMukimData,
          parsedString: cleaner(extractedData?.[0]),
        });
      }
    }
  });
}

export function clusterParser(rawData: DeterminedClass): Promise<ParsedClass> {
  return new Promise((resolve, reject) => {
    // Narrow down search based on the 'e.exports' string
    const narrowedData = /[aet].exports = JSON\.parse.*\]/g.exec(
      rawData.content
    );

    if (narrowedData) {
      const extractedData = /\[.*\]/g.exec(narrowedData?.[0]);
      if (extractedData) {
        resolve({
          url: rawData.url,
          content: rawData.content,
          type: rawData.type,
          parsed: JSON.parse(cleaner(extractedData?.[0])) as MkiniClusterData,
          parsedString: cleaner(extractedData?.[0]),
        });
      }
    }
  });
}

export function foreignerParser(
  rawData: DeterminedClass
): Promise<ParsedClass> {
  return new Promise((resolve, reject) => {
    // Narrow down search based on the 'e.exports' string
    const narrowedData = /[aet].exports = JSON\.parse.*\]/g.exec(
      rawData.content
    );
    if (narrowedData) {
      const extractedData = /\[.*\]/g.exec(narrowedData?.[0]);
      if (extractedData) {
        resolve({
          url: rawData.url,
          content: rawData.content,
          type: rawData.type,
          parsed: JSON.parse(cleaner(extractedData?.[0])) as MkiniForeignerData,
          parsedString: cleaner(extractedData?.[0]),
        });
      }
    }
  });
}

export function generalParser(rawData: DeterminedClass): Promise<ParsedClass> {
  return new Promise((resolve, reject) => {
    // Narrow down search based on the 'e.exports' string
    const narrowedData = /[aet]\.exports = JSON\.parse.*\]}}/g.exec(
      rawData.content
    );

    if (narrowedData) {
      const extractedData = /\{.*}}\]}}/g.exec(narrowedData?.[0]);
      if (extractedData) {
        resolve({
          url: rawData.url,
          content: rawData.content,
          type: rawData.type,
          parsed: JSON.parse(cleaner(extractedData?.[0])) as MkiniGeneralData,
          parsedString: cleaner(extractedData?.[0]),
        });
      }
    }
  });
}
// -----------------------------------
// Converters start here
// -----------------------------------

export function stateDataConverter(raw: ParsedClass): Promise<ConvertedClass> {
  return new Promise<ConvertedClass>((resolve, reject) => {
    var stateData: ProjectStateData = [];
    const workingArray = raw.parsed as MkiniStateData;
    workingArray.forEach((value: MkiniStateDataSingle, index: number) => {
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
          convertedString: JSON.stringify((stateData as unknown) as JSON),
          type: raw.type,
          url: raw.url,
        });
      }
    });
  });
}

export function districtDataConverter(
  raw: ParsedClass
): Promise<ConvertedClass> {
  return new Promise<ConvertedClass>((resolve, reject) => {
    var districtData: ProjectDistrictData = [];
    const workingArray = raw.parsed as MkiniDistrictData;

    workingArray.forEach((value: MkiniDistrictDataSingle, index: number) => {
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
          convertedString: JSON.stringify((districtData as unknown) as JSON),
          type: raw.type,
          url: raw.url,
        });
      }
    });
  });
}

export function mukimDataConverter(raw: ParsedClass): Promise<ConvertedClass> {
  return new Promise<ConvertedClass>((resolve, reject) => {
    var mukimData: ProjectMukimData = [];
    const workingArray = raw.parsed as MkiniMukimData;
    workingArray.forEach((value: MkiniMukimDataSingle, index: number) => {
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
          convertedString: JSON.stringify((mukimData as unknown) as JSON),
          type: raw.type,
          url: raw.url,
        });
      }
    });
  });
}

export function generalDataConverter(
  raw: ParsedClass
): Promise<ConvertedClass> {
  return new Promise<ConvertedClass>((resolve, reject) => {
    const workingObj = raw.parsed as MkiniGeneralData;

    const generalData: ProjectGeneralData = {
      positiveTested:
        workingObj.feed.entry[0].gsx$positif.$t != ""
          ? parseInt(workingObj.feed.entry[0].gsx$positif.$t)
          : null,
      negativeTested:
        workingObj.feed.entry[0].gsx$negatif.$t != ""
          ? parseInt(workingObj.feed.entry[0].gsx$negatif.$t)
          : null,
      pending:
        workingObj.feed.entry[0].gsx$pending.$t != ""
          ? parseInt(workingObj.feed.entry[0].gsx$pending.$t)
          : null,
      timestamp: workingObj.feed.entry[0].gsx$timestamp.$t,
    };

    resolve({
      content: raw.content,
      parsed: raw.parsed,
      parsedString: raw.parsedString,
      converted: generalData,
      convertedString: JSON.stringify((generalData as unknown) as JSON),
      type: raw.type,
      url: raw.url,
    });
  });
}
