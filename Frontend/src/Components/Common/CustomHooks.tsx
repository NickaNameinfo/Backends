import { useState } from "react";
import { setCookie } from "../../JsFiles/CommonFunction.mjs";

export const useBoolean = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);
  const toggle = () => setValue((prevValue) => !prevValue);

  return [value, setTrue, setFalse, toggle];
};

export const authenticate = (user, next) => {
  const now = new Date();
  if (typeof window !== "undefined") {
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    // Persist in both cookies + localStorage (mobile uses local persistence)
    try {
      localStorage.setItem("token", user.token ?? "");
      localStorage.setItem("role", String(user.role ?? ""));
      localStorage.setItem("id", String(user.id ?? ""));
    } catch {}
    setCookie(
      "token",
      user.token,
      expiresAt
    );
    setCookie("role", user.role, expiresAt);
    setCookie("id", user.id, expiresAt);
    setCookie(
      "vendorId",
      user?.data?.vendorId,
      expiresAt
    );
    setCookie(
      "storeId",
      user?.data?.storeId,
      expiresAt
    );
    setCookie(
      "plan",
      user?.data?.plan,
      expiresAt
    );
    next();
  }
};
