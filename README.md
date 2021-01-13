# OpenCovidMY

## Introduction

This project was started due to the lack of detailed datasets regarding the covid cases in Malaysia. In particularly regarding zones, districts and states. Country-wide data is common enough that this project probably will only introduce in after we finish off our backlogs.

It is also devised due to my WebDev project during my studies at Universiti Teknikal Malaysia Melaka.

## Team

| Name / Organization | Role           | SocMed                                                                                    |
| ------------------- | -------------- | ----------------------------------------------------------------------------------------- |
| Kwong Tung Nan      | Project Leader | [GitHub](http://www.github.com/kwongtn), [LinkedIn](https://www.linkedin.com/in/kwongtn/) |

## Credits

The journalist team at MalaysiaKini. Without them, we would not have ported this data so efficiently.

## Data Format

There are 3 types of data in this project (by cluster, by state, by district, by mukim) for now, that are organized into their respective folders.

The folder will contain a file that has all of the data, whereas others will be named according to date. A typical folder structure would be as such:

```
/
|- mukim
|- |- mukim_all.json
|- |- 20201228-mukim.json
|- |- 20201229-mukim.json
|- |- 20201230-mukim.json
|- |- 20201231-mukim.json
|- |- 20210101-mukim.json
```

There will also be a miscellaneous folder that stores raw data obtained from our data source, and also name translations (that exist in raw data but I feel that will not be important when fetching other data).

```
/
|- misc
|- |- raw
|- |- |- mukim-raw
|- |- |- 2020-12-28-mukim-raw.json
|- |- |- 2020-12-29-mukim-raw.json
|- |- |- 2020-12-30-mukim-raw.json
|- |- |- 2020-12-31-mukim-raw.json
|- |- |- 2021-01-01-mukim-raw.json
```

I will focus on states, district and mukim, before proceeding to cluster.

### State

```ts
[
    {
        state: string,
        confirmed: +ve number | 0,
        newCases: +ve number | 0,
        importedNewCases: +ve number | 0,
        death: +ve number | 0,
        newDeath: +ve number | 0,
        active: +ve number | 0,
        changeActive: number,
        activeFourteen: +ve number | 0,
        changeActiveFourteen: number
    }
]
```

| Key                  | Description                                  | Sample     |
| -------------------- | -------------------------------------------- | ---------- |
| state                | State of datapoint                           | `Selangor` |
| district             | District of datapoint                        | `Petaling` |
| confirmed            | Total number of confirmed cases historically | `1691`     |
| importedNewCases     | Number of imported new cases on that day     | `0`        |
| death                | Total number of deaths historically          | `10`       |
| newDeath             | New deaths on that day                       | `1`        |
| active               | Total number of current active cases         | `12`       |
| changeActive         | Change of active cases                       | `-10`      |
| activeFourteen       | Active cases in the last 13 days + today     | `446`      |
| changeActiveFourteen | Active cases in the last fourteen days       | `446`      |

### District

```ts
[
    {
        state: string,
        district: string,
        cases: +ve number | 0
        newCases: +ve number | 0
        active: +ve number | 0,
        changeActive: number,
        activeFourteen: +ve number | 0,
        changeActiveFourteen: number
    }
]
```

| Key                  | Description                              | Sample     |
| -------------------- | ---------------------------------------- | ---------- |
| state                | State of datapoint                       | `Selangor` |
| district             | District of datapoint                    | `Petaling` |
| cases                | Total number of cases historically       | `1691`     |
| newCases             | Number of new cases on that day          | `0`        |
| active               | Total number of current active cases     | `12`       |
| changeActive         | Change of active cases                   | `-10`      |
| activeFourteen       | Active cases in the last 13 days + today | `446`      |
| changeActiveFourteen | Active cases in the last fourteen days   | `446`      |

### Mukim

```ts
[
    {
        state: string,
        district: string,
        mukim: string,
        cases: +ve number | 0
        newCases: +ve number | 0
        active: +ve number | 0,
        changeActive: number,
        activeFourteen: +ve number | 0,
        changeActiveFourteen: number
    }
]
```

| Key                  | Description                              | Sample      |
| -------------------- | ---------------------------------------- | ----------- |
| state                | State of datapoint                       | `Selangor`  |
| district             | District of datapoint                    | `Petaling`  |
| mukim                | Mukim of datapoint                       | `Damansara` |
| cases                | Total number of cases historically       | `1691`      |
| newCases             | Number of new cases on that day          | `0`         |
| active               | Total number of current active cases     | `12`        |
| changeActive         | Change of active cases                   | `-10`       |
| activeFourteen       | Active cases in the last 13 days + today | `446`       |
| changeActiveFourteen | Active cases in the last fourteen days   | `446`       |

### All

```ts
[
    {
        date: Date,
        data: Array<StateData | DistrictData | MukimData | ClusterData>
    }
]
```

| Key  | Description            | Sample       |
| ---- | ---------------------- | ------------ |
| date | Date of the data point | `2021-01-02` |
| data | Any data in series     | `[]`         |

## Running the crawl script

1. If this is the first time running, run

```bash
npm install --dev
```

2. If it is non-production use, run

```
npm run devStart
```

### Notes

- The `foreginers` class data has been discontinued since 12 Jan 2021

### Require Help

- Data required for `20210112-general` cause the script failed.

- Need help on collecting data for Year 2020. Very sorry that I devised this project so late.
