import * as fs from "fs";
import { js_beautify } from "js-beautify";

fs.promises
  .readFile("../../data/district/20210101-district.json")
  .then(async (value: Buffer) => {
    var myValues: Array<any> = JSON.parse(value.toString());

    const mukims = await new Promise((resolve) => {
      var mukims: Array<any> = [];

      myValues.forEach((element: any, index: number) => {
        mukims.push(element.district);

        if (index == myValues.length - 1) {
          resolve(mukims);
        }
      });
    });

    return mukims as Array<string>;
  })
  .then((mukims: Array<string>) => {
    fs.writeFile(
      "../names.json",
      js_beautify(JSON.stringify(mukims)),
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("File write complete");
        }
      }
    );
  });
