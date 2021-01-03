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

export interface ProjectGeneralData {
  positiveTested: number | null;
  negativeTested: number | null;
  pending: number | null;
  timestamp: string;
}

export interface UnDeterminedClass {
  url: string;
  content: string;
}

export type DataClass =
  | "state"
  | "district"
  | "mukim"
  | "none"
  | "cluster"
  | "foreigner"
  | "general";

export interface DeterminedClass extends UnDeterminedClass {
  type: DataClass;
}

import {
  MkiniMukimData,
  MkiniDistrictData,
  MkiniStateData,
  MkiniClusterData,
  MkiniForeignerData,
  MkiniGeneralData,
} from "../models/mkini";

export interface ParsedClass extends DeterminedClass {
  parsed:
    | MkiniMukimData
    | MkiniDistrictData
    | MkiniStateData
    | MkiniClusterData
    | MkiniForeignerData
    | MkiniGeneralData;

  parsedString: string;
}

export interface ConvertedClass extends ParsedClass {
  converted:
    | ProjectStateData
    | ProjectDistrictData
    | ProjectMukimData
    | ProjectGeneralData;
  convertedString: string;
}
