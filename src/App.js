import React from "react";
import { initSample } from "./components/sample/sample-actions";
import { sampleIncrement } from "./components/sample/sample-actions";
import { initTimer } from "./components/timer/timer";
import { initMonitor } from "./components/monitor/monitor-actions";
import { Form } from "./components/form/form";
import { TextInput } from "./components/text-input/text-input";
import flyd from "flyd";
import * as R from "ramda";
import { ValidateOn } from "./components/form/form-validation";

export default function App() {
  const _appState = {
    ...initSample(),
    ...initTimer({ count: 0 }, sampleIncrement, 1000, "timer"),
    ...initTimer({ count: 0 }, sampleIncrement, 10, "test"),
  };

  const appState = {
    ..._appState,
    ...initMonitor(_appState),
  };

  window.appState = appState;

  const reset$ = flyd.stream();

  const validationFnExample = (value) => {
    if (value === "test") return true;
    return "Invalid result";
  };

  const notifyOnNameChange$ = flyd.stream();
  flyd.on((n) => {
    console.log("name changed", n);
  }, notifyOnNameChange$);

  const nameChanged$ = flyd.stream();
  const testChanged$ = flyd.stream();
  const formChanged$ = flyd.stream();

  const errorView = (error) =>
    R.is(Boolean, error) ? <div>moi</div> : <div>{error}</div>;

  return (
    <div className="App">
      <button onClick={() => reset$(true)}>Test</button>
      <div>
        <Form value={{ name: "Lari" }} reset$={reset$} onChange$={formChanged$}>
          <ValidateOn validatorFn={validationFnExample} as={errorView}>
            <label htmlFor="hep">Testi</label>
            <TextInput
              id="hep"
              accessor={["name"]}
              onValueChanged$={nameChanged$}
            />
          </ValidateOn>

          <ValidateOn validatorFn={validationFnExample} as={errorView}>
            <TextInput accessor={["test"]} onValueChanged$={testChanged$} />
          </ValidateOn>
        </Form>
      </div>
    </div>
  );
}
