import { getMatch } from "@/lib/football-api";
import WatchFromMatchContent from "./watch-from-match-content";

export const metadata = {
  title: "Watch Match",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getMatch(id);

  return <WatchFromMatchContent match={match} />;
}
