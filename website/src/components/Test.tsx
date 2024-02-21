import { useEffect } from "react";

export default function Test() {
  useEffect(() => {
    console.log("====================================");
    console.log(111);
    console.log("====================================");
  }, []);

  return <div></div>;
}
