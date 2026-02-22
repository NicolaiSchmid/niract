import Niract from "./niract.ts";

const root = document.getElementById("root");

function App() {
  const [count, setCount] = Niract.useState(0);

  return (
    <div>
      <h2>Hello from Niract!</h2>
      <p style={{ color: "red" }}>It works.</p>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount((prev) => prev + 1)}>+1</button>
    </div>
  );
}

Niract.render(<App />, root);

console.log("Niract playground loaded!");
