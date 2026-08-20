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
        padding: "48px 58px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#080a0d",
        color: "#f2f1ea",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>
          mscrape
          <div style={{ width: 9, height: 9, borderRadius: 999, background: "#c8ff3d" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#81858a", fontSize: 15, letterSpacing: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: "#c8ff3d" }} />
          PENCARIAN BISNIS LOKAL
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 50 }}>
        <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", fontSize: 80, fontWeight: 600, lineHeight: .9, letterSpacing: -5 }}>
          <span>Baca pasar lokal.</span>
          <span style={{ color: "#c7c8c2", fontWeight: 400 }}>Baris demi baris.</span>
        </div>
        <div style={{ width: 300, border: "1px solid #3a424c", display: "flex", flexDirection: "column", background: "#10141a" }}>
          <div style={{ height: 44, padding: "0 16px", borderBottom: "1px solid #242a31", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#81858a", fontSize: 12 }}>
            <span>QUERY / 001</span><span style={{ color: "#c8ff3d" }}>SIAP</span>
          </div>
          <div style={{ height: 78, padding: "0 16px", display: "flex", alignItems: "center", gap: 12, fontSize: 18 }}>
            <span style={{ color: "#c8ff3d" }}>›</span><span>Klinik gigi di Makassar</span>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 22, borderTop: "1px solid #3a424c", display: "flex", justifyContent: "space-between", color: "#81858a", fontSize: 15, letterSpacing: 1 }}>
        <span>NICHE → WILAYAH → DATASET</span>
        <span>CSV · TXT · JSON</span>
      </div>
    </div>,
    size,
  );
}
