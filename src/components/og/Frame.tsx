import type { ReactNode } from "react"
import { og, OG_HEIGHT, OG_WIDTH, type OGAssets } from "../../utils/og"
import { site } from "../../data/site"

interface Props {
  assets: OGAssets
  /** Small mono label in the top-left corner, after the domain */
  section?: string
  children: ReactNode
}

/**
 * The shared chrome of every OG image: the site's header gradient as the
 * background, a mono eyebrow with the domain, and a thin accent rule.
 * satori only supports flexbox, so every box declares display: flex.
 */
export default function Frame({ assets, section, children }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        position: "relative",
        backgroundColor: og.background,
        color: og.text,
      }}
    >
      <img
        src={assets.background}
        width={OG_WIDTH}
        height={OG_HEIGHT}
        style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
      />
      {/* Darken the lower half so long text stays readable over the glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          background: "linear-gradient(180deg, rgba(9,11,17,0) 0%, rgba(9,11,17,0.55) 60%, rgba(9,11,17,0.85) 100%)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: "56px 72px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: og.font.mono,
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: og.accent,
          }}
        >
          <span>{site.domain}</span>
          {section && <span style={{ color: og.faint }}>/</span>}
          {section && <span style={{ color: og.muted }}>{section}</span>}
        </div>

        {children}
      </div>
    </div>
  )
}
