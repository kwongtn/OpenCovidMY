/**
 * Model file describing our datatype used.
 */

export interface ProjectStateDataSingle {
  state: string;
  confirmed: number;
  newCases: number;
  importedNewCases: number;
  death: number;
  newDeath: number;
  active: number;
  changeActive: number;
  activeFourteen: number;
  changeActiveFourteen: number;
}

export interface ProjectStateData extends Array<ProjectStateDataSingle> {}

export interface ProjectDistrictDataSingle {
  state: string;
  district: string;
  cases: number;
  newCases: number;
  active: number;
  changeActive: number;
  activeFourteen: number;
  changeActiveFourteen: number;
}

export interface ProjectDistrictData extends Array<ProjectDistrictDataSingle> {}

export interface ProjectMukimDataSingle {
  state: string;
  district: string;
  mukim: string;
  cases: number;
  newCases: number;
  active: number;
  changeActive: number;
  activeFourteen: number;
  changeActiveFourteen: number;
}

export interface ProjectMukimData extends Array<ProjectMukimDataSingle> {}

export interface UnDeterminedClass {
  url: string;
  content: string;
}

export type DataClass = "state" | "district" | "mukim" | "none" | "cluster";

export interface DeterminedClass extends UnDeterminedClass {
  type: DataClass;
}

import {
  MkiniMukimData,
  MkiniDistrictData,
  MkiniStateData,
  MkiniClusterData,
} from "../models/mkini";

export interface ParsedClass extends DeterminedClass {
  parsed:
    | MkiniMukimData
    | MkiniDistrictData
    | MkiniStateData
    | MkiniClusterData;

  parsedString: string;
}

export interface ConvertedClass extends ParsedClass {
  converted: ProjectStateData | ProjectDistrictData | ProjectMukimData;
  convertedString: string;
}
