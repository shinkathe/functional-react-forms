import { TextInput } from "../text-input/text-input";
import { Bind, useStream } from "../s-utils/s-utils";
import { initFormState } from "../form/form-actions";
import React from "react";
import * as R from "ramda";
import flyd from "flyd";
import filter from "flyd/module/filter";
import skip from "flyd-skip";

export const getHtmlEventValue = (e) => {
  console.log("get html event value", e);
  // If we're dealing with a pure HTML element, it will have a type
  const type = R.path(["target", "type"], e);
  const getHtmlElementValue = () => {
    switch (type) {
      case "checkbox":
        return R.path(["target", "checked"], e);
      case "number":
        return R.compose(parseInt, R.path(["target", "value"]))(e);
      default:
        return R.path(["target", "value"], e);
    }
  };
  return getHtmlElementValue() ?? e ?? "";
};

// Wrap creates the listener for the valuestream
const Wrap = ({ onChangeStream$, valueStream$, children }) => {
  const value = useStream(valueStream$);
  return React.cloneElement(children, {
    onChange$: onChangeStream$,
    value,
  });
};

// Field creates a HoC, which creates a local state for any singular field and hooks it up to the global form state
const Field = ({
  formValues$,
  setFormValueAction$,
  reset$,
  children,
  accessor,
}) => {
  console.log("field binds", reset$);
  const initialValue = R.view(R.lensPath(accessor), formValues$());
  const onChangeStream$ = flyd.stream(initialValue);
  const valueStream$ = flyd.map(getHtmlEventValue, onChangeStream$);

  // Sync any input values onto the higher order formvalues
  flyd.on(() => {
    setFormValueAction$(R.assoc(accessor, valueStream$()));
  }, valueStream$);

  flyd.on(() => {
    setFormValueAction$(R.assoc(accessor, initialValue));
    onChangeStream$(initialValue);
  }, skip(0, reset$));

  return (
    <Wrap onChangeStream$={onChangeStream$} valueStream$={valueStream$}>
      {children}
    </Wrap>
  );
};

const recursiveMap = (children, fn) => {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    if (child.props.children) {
      child = React.cloneElement(child, {
        children: recursiveMap(child.props.children, fn),
      });
    }

    return fn(child);
  });
};

export const Form = ({ value, children, reset$ }) => {
  const { setFormValueAction$, formState$ } = initFormState(value, reset$);

  const View = ({ children }) => {
    return (
      <form>
        {recursiveMap(children, (child) => {
          const accessor = child.props.accessor;
          return !R.isEmpty(accessor) ? (
            <Field
              reset$={reset$}
              formValues$={formState$}
              setFormValueAction$={setFormValueAction$}
              accessor={accessor}
            >
              {child}
            </Field>
          ) : (
            <>{child}</>
          );
        })}
      </form>
    );
  };

  return <View>{children}</View>;
};
