import Niract from "./niract.ts";

const app = (
  <div>
    <h2>Hello from Niract!</h2>
    <p style={{ color: "red" }}>It works.</p>
  </div>
);

Niract.render(app, document.getElementById("root"));

// Playground — try your framework here!
// Vite transforms JSX into MiniReact.createElement() calls automatically.
//
// Example (will work once you implement createElement + render):
//
// const app = <div>
//   <h2>Hello from Mini React!</h2>
//   <p>It works.</p>
// </div>;
//
// MiniReact.render(app, document.getElementById("root"));

console.log("Mini React playground loaded. Start building!");
