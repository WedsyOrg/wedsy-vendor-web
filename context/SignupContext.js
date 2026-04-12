import React, { createContext, useContext, useMemo, useState } from "react";

const SignupContext = createContext(null);

export function SignupProvider({ children }) {
  const [signupDocs, setSignupDocs] = useState({
    documentType: "Aadhar Card",
    documentFront: null,
    documentBack: null,
  });

  const value = useMemo(() => ({ signupDocs, setSignupDocs }), [signupDocs]);
  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>;
}

export function useSignup() {
  const ctx = useContext(SignupContext);
  if (!ctx) {
    throw new Error("useSignup must be used within a SignupProvider");
  }
  return ctx;
}

