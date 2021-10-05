import flyd from "flyd";
import * as S from "../s-utils/s-utils";
import * as R from "ramda";

export const sampleIncrement = R.over(R.lensProp("count"), R.add(1));

export const initSample = () => {
  const incrementAction = flyd.stream();
  const sampleState = flyd.scan(S.run, { count: 0 }, incrementAction);

  return {
    sampleState,
    incrementAction,
  };
};
