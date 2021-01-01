/**
 * Model file describing data from malaysia kini webpage.
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
