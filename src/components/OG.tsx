import { type CollectionEntry } from "astro:content";
import { convertToHumanReadableDate } from "../utils/date";

// Using CSS here for simplicity, but we could use Tailwind or other CSS-in-JS libraries
export default function (props: CollectionEntry<"blog">) {
  const { title, description, publishDate } = props.data
  const date = convertToHumanReadableDate(publishDate)

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "12px", alignItems: "flex-start", justifyContent: "center", backgroundColor: "#4f46e5", color: "white" }}>
      <div style={{ display: "flex", fontWeight: "bolder", fontSize: "96px" }}>{title}</div>
      <div style={{ display: "flex", fontSize: "40px", marginTop: "12px" }}>{description}</div>
      <div style={{ display: "flex", fontSize: "24px", marginTop: "24px" }}>{date}</div>
    </div>
  );
}