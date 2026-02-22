import Niract from "./niract.ts";

const root = document.getElementById("root");

function App() {
  const [syncedBlasts, setSyncedBlasts] = Niract.useState(0);
  const colorBoxRef = Niract.useRef(null);
  const blastCountRef = Niract.useRef(0);
  const hueRef = Niract.useRef(18);

  const blastColor = () => {
    blastCountRef.current += 1;
    hueRef.current = (hueRef.current + 47) % 360;

    if (!colorBoxRef.current) return;

    const scale = 1.05 + Math.random() * 0.45;
    colorBoxRef.current.style.transform = `scale(${scale}) rotate(${hueRef.current}deg)`;
    colorBoxRef.current.style.background = `linear-gradient(135deg, hsl(${hueRef.current} 95% 62%), hsl(${(hueRef.current + 95) % 360} 95% 62%))`;
    colorBoxRef.current.style.boxShadow = `0 0 40px hsl(${hueRef.current} 95% 62% / 0.65)`;

    setTimeout(() => {
      if (!colorBoxRef.current) return;
      colorBoxRef.current.style.transform = "scale(1) rotate(0deg)";
    }, 180);
  };

  const syncRefToUi = () => {
    setSyncedBlasts(blastCountRef.current);
  };

  return (
    <div style={{ fontFamily: "ui-rounded, system-ui", padding: "24px" }}>
      <h2 style={{ margin: "0 0 8px" }}>Niract Ref Playground</h2>
      <p style={{ margin: "0 0 16px", color: "#334155" }}>
        Blast the color box using only refs, then sync into state.
      </p>

      <div
        ref={colorBoxRef}
        style={{
          width: "220px",
          height: "220px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #fb7185, #f59e0b)",
          boxShadow: "0 0 20px rgba(244, 63, 94, 0.25)",
          transition: "transform 180ms ease, box-shadow 200ms ease",
          marginBottom: "16px",
        }}
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button onClick={blastColor}>Blast Color (ref)</button>
        <button onClick={syncRefToUi}>Sync Ref to UI</button>
      </div>

      <p style={{ margin: 0 }}>Synced blasts (state): {syncedBlasts}</p>
      <p style={{ margin: "4px 0 0", color: "#64748b" }}>
        Tip: click "Blast Color" a few times, then click "Sync Ref to UI".
      </p>
    </div>
  );
}

Niract.render(<App />, root);

console.log("Niract playground loaded!");
