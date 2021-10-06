import React from "react";
import flyd from "flyd";
import * as R from "ramda";
import { useStream } from "../s-utils/s-utils";
import { dropRepeatsWith } from "flyd/module/droprepeats";

export const ValidationState = ({ validationStream$, as }) => {
  const state = useStream(validationStream$);
  return <>{as(state)}</>;
};
// Attaches a listener stream to the input's validation
export const ValidateOn = ({ children, validatorFn, as }) => {
  const validationListener$ = flyd.stream();
  const validationResult$ = flyd.map(
    validatorFn,
    dropRepeatsWith(R.equals, validationListener$) // Drop repeats to only render validation state when it changes
  );

  // Pass down validation listener stream to any child that has accessor defined
  const childrenWithProps = React.Children.map(children, (child) =>
    React.cloneElement(
      child,
      !R.isNil(child.props.accessor)
        ? { ...child.props, validationListener$ }
        : child.props
    )
  );

  return (
    <>
      {childrenWithProps}
      <ValidationState validationStream$={validationResult$} as={as} />
    </>
  );
};
