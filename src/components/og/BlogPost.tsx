import type { CollectionEntry } from "astro:content"
import { convertToHumanReadableDate } from "../../utils/date"
import { og, type OGAssets } from "../../utils/og"
import { site } from "../../data/site"
import Frame from "./Frame"

interface Props {
  post: CollectionEntry<"blog">
  assets: OGAssets
}

/** Long titles step down in size rather than getting cut off */
function titleSize(title: string) {
  if (title.length <= 32) return 84
  if (title.length <= 56) return 68
  return 58
}

export default function BlogPost({ post, assets }: Props) {
  const { title, description, publishDate } = post.data

  return (
    <Frame assets={assets} section="Blog">
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "flex-end", gap: 28 }}>
        <div
          style={{
            display: "flex",
            fontFamily: og.font.brand,
            fontWeight: 600,
            fontSize: titleSize(title),
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            lineClamp: 3,
          }}
        >
          {title}
        </div>

        {description && (
          <div
            style={{
              display: "flex",
              fontFamily: og.font.reading,
              fontSize: 28,
              lineHeight: 1.45,
              color: og.muted,
              maxWidth: 1000,
              lineClamp: 2,
            }}
          >
            {description.trim()}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 12 }}>
          <img src={assets.portrait} width={56} height={56} style={{ borderRadius: 28 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: og.font.mono,
              fontSize: 22,
              color: og.muted,
            }}
          >
            <span style={{ color: og.text }}>{site.name}</span>
            <span style={{ color: og.faint }}>·</span>
            <span>{convertToHumanReadableDate(publishDate)}</span>
          </div>
        </div>
      </div>
    </Frame>
  )
}
