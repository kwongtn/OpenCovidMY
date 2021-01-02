import axios, { AxiosRequestConfig } from "axios";
import * as env from "./envs";

export function httpGet(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (env.TESTING_MODE) {
      resolve(env.testHTML);
    } else {
      const config: AxiosRequestConfig = {
        method: "GET",
        url: url,
      };

      axios(config)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error);
          reject("HTTP GET error: " + error);
        });
    }
  });
}
