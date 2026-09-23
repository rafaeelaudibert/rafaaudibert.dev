import Default from "../components/og/Default"
import { loadOGAssets, renderOG } from "../utils/og"

export async function GET() {
  const png = await renderOG(Default({ assets: await loadOGAssets() }))
  return new Response(png, { headers: { "Content-Type": "image/png" } })
}
