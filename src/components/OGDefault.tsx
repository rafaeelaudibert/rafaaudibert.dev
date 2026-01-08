import { site } from "../data/site";

export default function OGDefault() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "48px",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "#4f46e5",
        color: "white",
      }}
    >
      <div style={{ display: "flex", fontWeight: "bolder", fontSize: "96px" }}>
        {site.name}
      </div>
      <div style={{ display: "flex", fontSize: "40px", marginTop: "12px" }}>
        {site.tagline}
      </div>
      <div style={{ display: "flex", fontSize: "28px", marginTop: "24px" }}>
        {site.domain}
      </div>
    </div>
  );
}
