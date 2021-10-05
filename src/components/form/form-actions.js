import flyd from "flyd";
import React from "react";
import * as R from "ramda";
import * as S from "../s-utils/s-utils";

export const initFormState = (initialState, reset$) => {
  const setFormValueAction$ = flyd.stream();
  const formState$ = flyd.scan(S.run, initialState, setFormValueAction$);

  flyd.on((value) => {
    console.log(value);
  }, formState$);

  return {
    formState$,
    setFormValueAction$,
  };
};

export const setFormValue = R.assoc;
