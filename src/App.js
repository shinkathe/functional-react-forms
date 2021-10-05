import React from "react";
import { initSample } from "./components/sample/sample-actions";
import { sampleIncrement } from "./components/sample/sample-actions";
import { initTimer } from "./components/timer/timer";
import { initMonitor } from "./components/monitor/monitor-actions";
import { Form } from "./components/form/form";
import { TextInput } from "./components/text-input/text-input";
import flyd from "flyd";

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

  const TestVisible = ({ visible }) =>
    visible ? <div>Moi</div> : <div>Ei</div>;

  const reset$ = flyd.stream();

  return (
    <div className="App">
      {/* <Bind stream={appState.sampleState} view={SampleCounter} />
      <button onClick={() => appState.incrementAction(sampleIncrement)}>
        Test
      </button>
      <div>
        <Bind stream={appState.timer} view={SampleCounter} />
      </div>

      <div>
        <Bind stream={appState.monitorState} view={TestVisible} />
      </div>

      <span>Sample form</span> */}

      <button onClick={() => reset$(true)}>Test</button>
      <div>
        <Form value={{ name: "Lari" }} reset$={reset$}>
          <TextInput accessor={["name"]}></TextInput>
          <TextInput accessor={["test"]}></TextInput>
        </Form>
      </div>
    </div>
  );
}
