import { v4 as uuid } from "uuid";
import { setState } from "./state";
import { getAuthToken, getPaths } from "./graphql";
import { createReadStream, statSync } from "fs";
import fetch from "node-fetch";

const sessionId = uuid();
// TODO: Remove
// const sessionId = "ae047f10-d9c5-4598-a024-2a4f295f1c2f";

setState((s) => ({
  ...s,
  sessionId,
}));
console.log(`Starting cosmatic with session id: ${sessionId}`);

(async () => {
  const token = await getAuthToken();
  setState((s) => ({
    ...s,
    token,
  }));
  console.log(`Successfully retrieved auth token.`);

  const paths = await getPaths(["a -> b", "a -> c"]);
  console.log(`Successfully retrieved paths for snapshots.`);

  // TODO: Unlimit
  const uploads = [paths.urls[0]].map(async ({ path, url, contentType }) => {
    const filePath = `${__dirname}/Frame 2.png`;
    const contentLength = statSync(filePath).size;

    console.log(`Uploading snapshot '${path}'`);

    const res = await fetch(url, {
      method: "PUT",
      body: createReadStream(filePath),
      headers: {
        "content-type": contentType,
        "content-length": `${contentLength}`,
      },
    });

    if (!res.ok) {
      console.log(res);
      throw Error("Unable to upload image");
    }

    console.log(res);
  });

  await Promise.all(uploads);
})();
