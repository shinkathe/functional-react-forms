import flyd from "flyd";
import * as S from "../s-utils/s-utils";
import filter from "flyd/module/filter";

export const initMonitor = ({ timer, sampleState }) => {
  const monitorStateFiltered = filter(
    ({ timer, sampleState }) => timer.count > 2 && sampleState.count > 2,
    S.combineNamed({
      timer,
      sampleState,
    })
  );

  const monitorState = flyd.stream({ visible: false });

  const monitorStateTrigger = flyd.on((val) => {
    monitorState({ visible: true });
  }, monitorStateFiltered);

  return {
    monitorState,
    monitorStateTrigger,
  };
};
