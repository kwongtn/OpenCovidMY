import { rejects } from "assert";
import * as fs from "fs";
import { js_beautify } from "js-beautify";

export type DataClass =
  | "state"
  | "district"
  | "mukim"
  | "none"
  | "cluster"
  | "foreigner"
  | "general";

// Mukim Combiner
function combiner(dataType: DataClass): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.promises
      .readdir("../../data/" + dataType)
      .then(async (res: Array<string>) => {
        function getData(file: string): Promise<any> {
          return new Promise(async (resolve: any) => {
            const date = await new Promise<Date>((resolve: any) => {
              var promiseDate = new Date();
              promiseDate.setFullYear(
                parseInt(file.slice(0, 4)),
                parseInt(file.slice(4, 6)) - 1,
                parseInt(file.slice(6, 8))
              );

              promiseDate.setHours(0, 0, 0);
              // console.log(
              //   parseInt(file.slice(0, 4)),
              //   parseInt(file.slice(4, 6)) - 1,
              //   parseInt(file.slice(6, 8))
              // );
              resolve(promiseDate);
            });

            // console.log(date.toISOString());
            fs.readFile(
              "../../data/" + dataType + "/" + file,
              (err: any, data: Buffer) => {
                // console.log(
                //   "[" +
                //     dataType.toLocaleUpperCase() +
                //     "] Done reading " +
                //     date.toISOString()
                // );
                // console.log(data.byteLength);
                try {
                  resolve({
                    date: date.toISOString(),
                    data: JSON.parse(data.toString()),
                  });
                } catch (err) {
                  console.log(
                    "[" +
                      dataType.toLocaleUpperCase() +
                      "] " +
                      date.toISOString()
                  );
                  console.log(err);
                  // console.log(data.toString);
                }
              }
            );
          });
        }

        return await new Promise<any>((resolve) => {
          var jobList: Array<Promise<any>> = [];
          res.forEach((file: string) => {
            if (file.charAt(0) != dataType.charAt(0)) {
              jobList.push(getData(file));
            }
          });

          Promise.all(jobList).then((data: any) => {
            console.log("[" + dataType.toLocaleUpperCase() + "] Read Complete");
            resolve(data);
          });
        });
      })
      .then((data: any) => {
        fs.writeFile(
          "../../data/" + dataType + "_all.json",
          js_beautify(JSON.stringify(data)),
          (err) => {
            if (err) {
              console.log(err);
              resolve(false);
            } else {
              console.log(
                "[" + dataType.toLocaleUpperCase() + "] Write complete."
              );
              resolve(true);
            }
          }
        );
      });
  });
}

var jobList = [
  combiner("mukim"),
  combiner("district"),
  combiner("state"),
  combiner("general"),
];

Promise.all(jobList).then(() => {
  console.log("Completed all.");
});
