import { redirect } from "next/navigation";
import { absoluteUrl } from "@repo/utils/navigate";
import RouteLinks from "@repo/utils/route-links";

export default function Home() {
  redirect(absoluteUrl(RouteLinks.website));
}
