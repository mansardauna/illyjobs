import { ImageResponse } from "next/og";

export const alt = "Illy Jobs: jobs in Ilorin and Kwara State";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0f172a",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800 }}>
          <span>Illy</span>
          <span style={{ color: "#34d399" }}>Jobs</span>
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 800, marginTop: 24, lineHeight: 1.1 }}>
          Jobs in Ilorin and Kwara State
        </div>
        <div style={{ display: "flex", fontSize: 36, marginTop: 28, color: "#cbd5e1" }}>
          Verified employers. Apply online or on WhatsApp. Free for job seekers.
        </div>
      </div>
    ),
    size
  );
}
