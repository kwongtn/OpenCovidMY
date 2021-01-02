const JSSoup = require("jssoup").default;

import { rejects } from "assert";
import {
  MkiniClusterData,
  MkiniDistrictData,
  MkiniDistrictDataSingle,
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
  ProjectMukimData,
  ProjectStateData,
  ProjectStateDataSingle,
} from "../models/thisProject";

export function findScript(htmlResponse: string): Promise<Array<string>> {
  return new Promise(async (resolve, reject) => {
    const soup = new JSSoup(htmlResponse);
    var iterationVar = soup.find("head").find("link");

    try {
      let interestedURLs: Array<string> = [];
      while (iterationVar != undefined) {
        // Get scripts that are defined as preloaded
        if (
          iterationVar.attrs != undefined &&
          iterationVar.attrs.href != undefined &&
          iterationVar.attrs.rel == "preload"
        ) {
          // Narrow down scripts to be queried
          if (/.*(chunks).*\.js/g.test(iterationVar.attrs.href)) {
            if (
              !/.*(chunks)\/(?=)(framework|styles).*\.js/g.test(
                iterationVar.attrs.href
              )
            ) {
              interestedURLs.push(iterationVar.attrs.href);
            }
          }
        }
        iterationVar = iterationVar.nextElement;
      }
      resolve(interestedURLs);
    } catch (err) {
      reject(err);
    }
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
          resolve("mukim");
        } else {
          resolve("district");
        }
      } else {
        resolve("state");
      }
    } else if (
      /e\.exports = JSON\.parse\('\[{"enName":"Total"/g.test(htmlResponse)
    ) {
      resolve("cluster");
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
    .replace(/\\\'/g, "'");
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

export function districtParser(rawData: DeterminedClass): Promise<ParsedClass> {
  return new Promise((resolve, reject) => {
    // Narrow down search based on the 't.exports' string
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
          parsed: JSON.parse(extractedData?.[0]) as MkiniDistrictData,
          parsedString: extractedData?.[0],
        });
      }
    }
  });
}

export function mukimParser(rawData: DeterminedClass): Promise<ParsedClass> {
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
          parsed: JSON.parse(cleaner(extractedData?.[0])) as MkiniClusterData,
          parsedString: cleaner(extractedData?.[0]),
        });
      }
    }
  });
}

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
