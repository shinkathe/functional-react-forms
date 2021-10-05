import flyd from "flyd";
import every from "flyd/module/every";

export const initTimer = (initial, setState, interval, name) => {
  const everySecond = every(interval);
  const timer = flyd.scan(setState, initial, everySecond);
  return {
    [name]: timer,
  };
};
