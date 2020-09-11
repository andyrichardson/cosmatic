import { getState } from "./state";
import fetch from "node-fetch";

/** Trigger fetch request with session and token headers */
export const execFetch = async (...[a, b]: Parameters<typeof fetch>) => {
  const state = getState();
  const res = await fetch(a, {
    ...b,
    headers: {
      ...b?.headers,
      ...(state.sessionId ? { "x-chromatic-session-id": state.sessionId } : {}),
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    },
  });

  if (!res.ok) {
    throw Error("Network request failed");
  }

  return await res.json();
};

/** Execute a GraphQL query */
const execGraphql = ({
  query,
  variables,
}: {
  query: string;
  variables: any;
  token?: string;
}) => {
  const state = getState();

  return fetch("https://www.chromaticqa.com/graphql", {
    method: "POST",
    body: JSON.stringify({
      query,
      variables,
    }),
    headers: {
      "Content-Type": "application/json",
      "x-chromatic-cli-version": "3.5.2",
      ...(state.sessionId ? { "x-chromatic-session-id": state.sessionId } : {}),
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    },
  }).then((res) => {
    if (!res.ok) {
      throw Error("GraphQL request failed");
    }

    return res.json();
  });
};

/** Get a token for auth session */
export const getAuthToken = async () => {
  const res = await execGraphql({
    query: `
    mutation TesterCreateAppTokenMutation($token: String!) {
      createAppToken(code: $token)
    }
  `,
    variables: {
      token: process.env.CHROMATIC_TOKEN,
    },
  });

  console.log(res);
  return res.data.createAppToken;
};

export const getPaths = async (paths: string[]) => {
  const res = await execGraphql({
    query: `
      mutation TesterGetUploadUrlsMutation($paths: [String!]!) {
        getUploadUrls(paths: $paths) {
          domain
          urls {
            path
            url
            contentType
          }
        }
      }
    `,
    variables: {
      paths,
    },
  });

  console.log(res);
  return res.data.getUploadUrls;
};

export const createBuild = async ({
  input,
}: {
  cachedUrl: string;
  appId: any; // todo - check ObjID on schema
  autoAcceptChanges: boolean;
  preserveMissingSpecs: boolean;
  branch: string;
  commit: string;
  committedAt: number;
  committerEmail: string;
  committerName: string;
  baselineCommits: string[];
  runtimeSpecs: any[]; // todo - check RuntimeSpecInput on schema
  only: string;
  fromCI: boolean;
  isTravisPrBuild: boolean;
  patchBaseRef: string;
  patchHeadRef: string;
  packageVersion: string;
  storybookVersion: string;
  viewLayer: string;
  addons: any[]; // todo - check AddonInput on schema
  environment: string;
}) => {
  const res = await execGraphql({
    query: `
      mutation TesterCreateBuildMutation($input: CreateBuildInput!, $isolatorUrl: String!) {
        createBuild(input: $input, isolatorUrl: $isolatorUrl) {
          id
          number
          specCount
          snapshotCount
          componentCount
          webUrl
          cachedUrl
          reportToken
          features {
            uiTests
            uiReview
          }
          wasLimited
          app {
            account {
              exceededThreshold
              paymentRequired
              billingUrl
            }
            repository {
              provider
            }
            setupUrl
          }
          snapshots {
            spec {
              name
              component {
                name
                displayName
              }
            }
            parameters {
              viewport
              viewportIsDefault
            }
          }
        }
      }
    `,
    variables: {
      paths,
    },
  });
};
