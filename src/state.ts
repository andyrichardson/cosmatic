type State = {
  sessionId?: string;
  token?: string;
};

let state: State = {};

export const setState = (setter: (s: State) => State) =>
  (state = setter(state));

export const getState = () => state;
