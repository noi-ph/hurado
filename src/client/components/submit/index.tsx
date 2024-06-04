"use client";

import React from "react";
import { FunctionComponent } from "react";
import http from "client/http";

export const SubmitComponent: FunctionComponent = () => {
  const submit = React.useCallback(async () => {
    const response = await http.post("/api/v1/submissions", { task: 1 });
    console.log("Testing response", response.data);
  }, []);

  return (
    <button type="submit" onClick={submit}>
      Submit
    </button>
  );
};
