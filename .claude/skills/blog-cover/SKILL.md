---
name: blog-cover
description: Draw or fix a blog cover image for rafaaudibert.dev. Use when a post is added, when a cover looks off, or when the user asks for a cover, hero image or thumbnail for a blog post. Covers are generated SVG diagrams in one shared style, never stock images or screenshots.
---

# Blog covers

Every blog post has a cover at `src/assets/blog/<slug>.png`, 1600x900, drawn by
`scripts/generate-blog-covers.ts` and regenerated with `bun run blog-covers`.
The covers must read as one set on `/blog/` and on the homepage, so they share a
canvas and a drawing vocabulary. The cards and the OG images carry the title,
so covers have no text.

## The style

**Canvas.** `backdrop()` in the script draws it for every cover: the site's
navy (`#090b11`) with a purple glow top-left, a blue glow top-right, a faint
warm glow at the bottom, and a dot grid at 40px. Never change it for one post.

**Subject.** One monoline diagram of the post's actual mechanism, drawn from
geometry, not an illustration of the topic. Sorting is bars mid-swap; a hash
table is keys flowing into a hash box and out into buckets; a migration is
boxes crossing from a faded grid to a lit one. Ask "what does the post
explain?" and draw that.

**Strokes.** `STROKE` is 6px, round caps and joins, corner radius `RADIUS` 8px.
Shapes are outlined; fills are translucent (`fill-opacity` 0.15 to 0.35).
Structure is grey (`GREY` `#a3acc8`, `GREY_DIM` `#505d84`); the one thing the
post is about is purple (`PURPLE` `#7611a6`, `PURPLE_LIGHT` `#c561f6`); a
single white accent (`WHITE`) marks the focal point, such as the colliding key
or the magnifying glass. Dashed strokes mean faded, old or optional.

**Composition.** Fill the frame. Keep the drawing inside a margin of about
80px on every side and let it span at least two thirds of the height; a
diagram centred in the middle third leaves the top and bottom empty and reads
as small. Prefer one strong left-to-right or top-to-bottom motion. Three to
twelve shapes is the right count; more turns into texture.

## Adding a cover

1. Write a `function <camelSlug>()` in the script that builds an SVG body
   string with the helpers `rect()` and `line()` and returns `wrap(body)`.
   Compute positions from `W`, `H` and the shape sizes so the drawing is
   centred or bottom-anchored by arithmetic, not by eye. Comment the function
   with one sentence saying what the diagram shows.
2. Register it in `COVERS` under the post's slug.
3. Run `bun run blog-covers`. It writes every cover, so unrelated PNGs may
   change bytes; that is fine.
4. Set `img: <slug>.png` and an `img_alt` in the post's frontmatter. The alt
   describes the drawing in one sentence ("A funnel of six bars narrowing from
   many applications down to one"), not the post.
5. Look at it. Compose a contact sheet with sharp, or open `/blog/` on the dev
   server, and check the new cover next to the others for size, weight and
   margins. Check it in the card on the homepage too, where the top is covered
   by the title label.

## Common fixes

- Too much empty space: the shapes are too small or the composition is
  centred in the middle band. Scale the shapes up and anchor them low or
  high so a secondary element (an arc, a curve) can use the rest.
- Reads as noise: too many shapes, or more than one purple element. Drop
  shapes and keep one focal point.
- Looks like another cover: the same primitive (a grid of boxes, a row of
  bars) used for a different idea. Change the motion or the primitive.
