/**
 * The resume data carries a little inline HTML (<strong>, <b>, <i>) because
 * the resume page renders it with set:html. Tool output is read by models,
 * not browsers, so it is converted to Markdown instead.
 */
export function htmlToMarkdown(html: string): string {
  return html
    .replace(/<\/?(strong|b)>/g, "**")
    .replace(/<\/?(i|em)>/g, "_")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}
