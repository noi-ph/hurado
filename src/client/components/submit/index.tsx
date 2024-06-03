"use client";

import React from "react";
import { FunctionComponent } from "react";

function getCookie(name: string) {
  function escape(s: string) {
    return s.replace(/([.*+?^$(){}|[\]/\\])/g, "\\$1");
  }
  var match = document.cookie.match(RegExp("(?:^|;\\s*)" + escape(name) + "=([^;]*)"));
  return match ? match[1] : null;
}

export const SubmitComponent: FunctionComponent = () => {
  const submit = React.useCallback(async () => {
    const token = getCookie("hurado/token");
    const response = await fetch("/api/v1/submissions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: 1,
      }),
    });
    const body = await response.json();
    console.log("Read the response", body);
  }, []);

  return (
    <button type="submit" onClick={submit}>
      Submit
    </button>
  );
};
