import Niract from "./niract.ts";

const root = document.getElementById("root");

function App(count) {
  return (
    <div>
      <h2>Hello from Niract!</h2>
      <p style={{ color: "red" }}>It works.</p>
      <h2>Count: {count}</h2>
      <button onClick={() => {
        Niract.render(App(count + 1), root);
      }}>+1</button>
    </div>
  );
}

Niract.render(App(0), root);

console.log("Niract playground loaded!");
