import React from "react";
import flyd from "flyd";
import { useState, useEffect } from "react";
import * as R from "ramda";

export const useStream = (stream) => {
  const [state, setState] = useState(stream());

  useEffect(() => {
    const s = flyd.on((n) => {
      setState(n);
    }, stream);

    return () => {
      s.end(true);
    };
  }, []);

  return state;
};

export const Bind = ({ stream, view }) => {
  const state = useStream(stream);
  return React.createElement(view, state);
};

export const combineNamed = (streamModel) => {
  return flyd.combine((...args) => {
    const combineStreams = args.slice(0, -2);
    const streamNames = R.keys(streamModel);
    return combineStreams.reduce((acc, stream$, idx) => {
      return R.assoc(streamNames[idx], stream$())(acc);
    }, {});
  }, R.values(streamModel));
};

export const run = (param, func) => func(param);
