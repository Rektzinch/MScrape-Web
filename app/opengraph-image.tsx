import { ImageResponse } from "next/og";

export const alt = "MScrape — business discovery workspace untuk pasar lokal Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "58px 64px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f8faff",
        color: "#111a33",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, fontWeight: 700 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "#111a33", color: "#8be4ae" }}>M</div>
          MScrape
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#516078", fontSize: 17, letterSpacing: 2 }}>
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "#54bf82" }} />
          GOOGLE MAPS LIVE
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ color: "#3157df", fontSize: 18, fontWeight: 700, letterSpacing: 3, marginBottom: 22 }}>BUSINESS DISCOVERY / INDONESIA</div>
        <div style={{ maxWidth: 980, display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 700, lineHeight: .92, letterSpacing: -5 }}>
          <span>Cari data bisnis.</span>
          <span style={{ color: "#3157df" }}>Temukan peluang lokal.</span>
        </div>
      </div>

      <div style={{ paddingTop: 24, borderTop: "2px solid #dbe2ef", display: "flex", justifyContent: "space-between", color: "#516078", fontSize: 18 }}>
        <span>NICHE → WILAYAH → DATASET</span>
        <span>CSV · TXT · JSON</span>
      </div>
    </div>,
    size,
  );
}
