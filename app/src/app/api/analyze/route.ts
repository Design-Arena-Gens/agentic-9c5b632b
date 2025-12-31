import { NextResponse } from "next/server";

import {
  analyzeFeed,
  fetchChannelFeed,
  resolveChannelId,
} from "@/lib/channelAgent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { query } = (await request.json()) as { query?: string };

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: "Provide a YouTube channel URL, handle, or ID" },
        { status: 400 }
      );
    }

    const resolved = await resolveChannelId(query);
    const feed = await fetchChannelFeed(resolved.id);
    const analysis = analyzeFeed({ channel: feed, handle: resolved.handle });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[analyze]", error);
    const message =
      error instanceof Error ? error.message : "Unable to analyze channel";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
