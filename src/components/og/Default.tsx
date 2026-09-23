import { og, type OGAssets } from "../../utils/og"
import { site } from "../../data/site"
import Frame from "./Frame"

/** The site-wide card, used by every page without a more specific image. */
export default function Default({ assets }: { assets: OGAssets }) {
  return (
    <Frame assets={assets}>
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 720 }}>
          <div
            style={{
              display: "flex",
              fontFamily: og.font.brand,
              fontWeight: 600,
              fontSize: 96,
              lineHeight: 1.04,
              letterSpacing: "-0.025em",
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: og.font.reading,
              fontSize: 34,
              lineHeight: 1.4,
              color: og.muted,
            }}
          >
            {site.tagline}
          </div>
        </div>

        <img
          src={assets.portrait}
          width={280}
          height={280}
          style={{
            borderRadius: 140,
            border: `6px solid ${og.accent}`,
            flexShrink: 0,
          }}
        />
      </div>
    </Frame>
  )
}
