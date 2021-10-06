import { useStream } from "../s-utils/s-utils";
import { initFormState } from "../form/form-actions";
import React from "react";
import * as R from "ramda";
import flyd from "flyd";
import skip from "flyd-skip";

export const getHtmlEventValue = (e) => {
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
const UpdateOn = ({ onChangeStream$, valueStream$, children }) => {
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
  onValueChanged$,
  validationListener$,
  children,
  accessor,
}) => {
  const initialValue = R.view(R.lensPath(accessor), formValues$());
  const onChangeStream$ = flyd.stream(initialValue);
  const valueStream$ = flyd.map(getHtmlEventValue, onChangeStream$);

  // Sync any input values onto the higher order formvalues
  flyd.on(() => {
    setFormValueAction$(R.assoc(accessor, valueStream$()));
    onValueChanged$?.(valueStream$());
    validationListener$?.(valueStream$());
  }, valueStream$);

  flyd.on(() => {
    setFormValueAction$(R.assoc(accessor, initialValue));
    onChangeStream$(initialValue);
  }, skip(0, reset$));

  return (
    <UpdateOn onChangeStream$={onChangeStream$} valueStream$={valueStream$}>
      {children}
    </UpdateOn>
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

// use cases:
// array values
// validation
// reset form X
// set single value from outside
// dependant state from the outside X
// form dirty & touched state atomic

export const Form = (props) => {
  const { value, children, reset$, onChange$ } = props;
  const { setFormValueAction$, formState$ } = initFormState(value, reset$);

  flyd.map(onChange$, formState$);

  const View = ({ children }) => {
    return (
      <form>
        {recursiveMap(children, (child) => {
          const accessor = child.props.accessor;
          const onValueChanged$ = child.props.onValueChanged$;
          const validationListener$ = child.props.validationListener$;

          return !R.isNil(accessor) ? (
            <Field
              reset$={reset$}
              formValues$={formState$}
              setFormValueAction$={setFormValueAction$}
              accessor={accessor}
              onValueChanged$={onValueChanged$}
              validationListener$={validationListener$}
              {...child.props}
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
