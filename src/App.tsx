import { useState } from "react";
import "./App.css";
import { LoginForm } from "./components/login-form";
import { cn } from "./lib/utils";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <LoginForm className={cn("fixed-width")} style={{ width: "300px" }} />
    </>
  );
}

export default App;
