import { v4 as uuid } from "uuid";
import { setState } from "./state";
import { getAuthToken, getPaths } from "./graphql";

// const sessionId = uuid();
// TODO: Remove
const sessionId = "ae047f10-d9c5-4598-a024-2a4f295f1c2f";

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
  console.log(paths);
})();
