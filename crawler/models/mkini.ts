/**
 * Model file describing data extracted from malaysia kini webpage.
 */

export interface MkiniStateDataSingle {
  state: string;
  confirmed: number;
  newCases: number;
  importedNewCases: number;
  death: number;
  newDeath: number;
  active: number | null;
  newActive: number;
  newActive2: number | null;
  fourteen: number;
  newFourteen: number;
}

export interface MkiniStateData extends Array<MkiniStateDataSingle> {}

export interface MkiniDistrictDataSingle {
  state: string;
  district: string;
  districtZh: string | null;
  districtNe: string | null;
  districtMm: string | null;
  districtBe: string | null;
  confirmed: number | null;
  ytdConfirmed: number | null;
  new: number | null;
  dateUpdate: string;
  activeCases: number | null;
  ytdActive: number | null;
  newActive: number | null;
  activeDateUpdate: string | null;
  fourteen: number | null;
  ytdFourteen: number | null;
  newFourteen: number;
  timestamp: string | null;
}

export interface MkiniDistrictData extends Array<MkiniDistrictDataSingle> {}

export interface MkiniMukimDataSingle {
  state: string;
  district: string;
  districtZh: string | null;
  districtNe: string | null;
  districtMm: string | null;
  districtBe: string | null;
  mukim: string;
  mukimZh: string | null;
  mukimNe: string | null;
  mukimMm: string | null;
  mukimBe: string | null;
  cases: number | null;
  ytdcases: number | null;
  newCases: number | null;
  newCasesDate: string | null;
  active: number | null;
  ytdactive: number | null;
  newActive: number | null;
  newActiveDate: string | null;
  fourteen: number | null;
  ytdfourteen: number | null;
  newFourteen: number | null;
  newFourteenDate: string | null;
  timestamp: string | null;
  "CROSSCHECK (DO NOT AMEND)": null;
}

export interface MkiniMukimData extends Array<MkiniMukimDataSingle> {}

export interface MkiniClusterDataSingle {
  enName: string;
  newCases: number;
  weight: string | number;
  ytdWeight: number;
  myName: string;
  zhName: string;
  location: string | null;
  status: "active" | null;
  death: number | null;
  "index case": string | null;
  "Other notes": string | null;
}

export interface MkiniClusterData extends Array<MkiniClusterDataSingle> {}

export interface MkiniForeignerDataSingle {
  depot: string;
  sampled: number;
  positive: number | null;
  foreigners: number | string;
  treatment: number | string;
  death: number;
  zhDepot: string | null;
  localTransmission: number | string | null;
  yestLocalTranmission: number | string | null;
  newLocalTransmission: number | string | null;
}

export interface MkiniForeignerData extends Array<MkiniForeignerDataSingle> {}

export interface MkiniGeneralData {
  version: string;
  encoding: string;
  feed: {
    entry: [
      {
        gsx$positif: {
          $t: string;
        };
        gsx$negatif: {
          $t: string;
        };
        gsx$pending: {
          $t: string;
        };
        gsx$timestamp: {
          $t: string;
        };
      }
    ];
  };
}
