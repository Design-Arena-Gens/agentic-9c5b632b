"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Loader2, Play, Sparkles, TrendingUp } from "lucide-react";

interface AgentResponse {
  channel: {
    id: string;
    title: string;
    url: string;
    description: string;
    handle?: string;
    subscriberCount?: number;
    publishedAt?: string;
  };
  latestUploads: Array<{
    id: string;
    title: string;
    publishedAt: string;
    link: string;
    views?: number | null;
    description?: string;
  }>;
  uploadCadence: {
    averageDays: number | null;
    last30Days: number;
    consistencyScore: number;
    summary: string;
  };
  keywordInsights: Array<{
    keyword: string;
    count: number;
  }>;
  actions: Array<{
    title: string;
    description: string;
  }>;
  playbook: {
    narrativeHook: string;
    cadenceFocus: string;
    packagingTips: string[];
    collaborationIdeas: string[];
  };
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));

const formatInterval = (value: number | null) => {
  if (!value) return "Not enough data";
  if (value < 1) return "Multiple uploads per day";
  if (value < 2) return "~ every other day";
  if (value < 4) return "2-3 videos per week";
  if (value < 8) return "Weekly";
  if (value < 15) return "Bi-weekly";
  if (value < 30) return "Monthly";
  return "Sporadic";
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AgentResponse | null>(null);

  const topVideo = useMemo(() => {
    if (!data?.latestUploads?.length) return null;
    return data.latestUploads.reduce((prev, curr) => {
      if (!prev) return curr;
      if ((curr.views || 0) > (prev.views || 0)) {
        return curr;
      }
      return prev;
    });
  }, [data]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Unable to analyze channel");
      }

      const payload = (await response.json()) as AgentResponse;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-12 lg:px-12">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-emerald-500/10 backdrop-blur">
          <div className="flex items-center gap-3 text-sm font-medium text-emerald-300">
            <Sparkles className="h-4 w-4" />
            YouTube Growth Pilot
          </div>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Launch an agent that reverse-engineers your YouTube momentum.
            </h1>
            <p className="text-lg text-white/70">
              Paste your channel handle, link, or ID. We ingest your latest
              uploads, surface evergreen themes, and hand you an actionable
              publishing game plan.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur md:flex-row md:items-center"
          >
            <div className="flex-1">
              <label className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                Channel URL, Handle, or ID
              </label>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="https://www.youtube.com/@yourchannel"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-400 focus:bg-white/15"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto md:px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Auditing…
                </>
              ) : (
                <>
                  Launch Agent
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </header>

        {data && (
          <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-3">
            <section className="lg:col-span-2 space-y-6">
              <article className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                      Channel Overview
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold">{data.channel.title}</h2>
                  </div>
                  <a
                    href={data.channel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-emerald-400 hover:text-emerald-200"
                  >
                    Visit channel
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
                <p className="mt-4 max-w-3xl text-base text-white/70">
                  {data.channel.description || "No channel description provided."}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm">
                    <dt className="text-white/60">Handle</dt>
                    <dd className="mt-1 font-semibold text-white">
                      {data.channel.handle || "—"}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm">
                    <dt className="text-white/60">Avg interval</dt>
                    <dd className="mt-1 font-semibold text-white">
                      {formatInterval(data.uploadCadence.averageDays)}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm">
                    <dt className="text-white/60">Uploads (30d)</dt>
                    <dd className="mt-1 font-semibold text-white">
                      {data.uploadCadence.last30Days}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm">
                    <dt className="text-white/60">Consistency</dt>
                    <dd className="mt-1 font-semibold text-white">
                      {Math.round(data.uploadCadence.consistencyScore * 100)}%
                    </dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300">
                  <TrendingUp className="h-4 w-4" />
                  Momentum Signals
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {data.actions.map((action) => (
                    <div
                      key={action.title}
                      className="rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-white/80"
                    >
                      <h3 className="text-base font-semibold text-white">
                        {action.title}
                      </h3>
                      <p className="mt-3 leading-relaxed text-white/70">
                        {action.description}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300">
                  <Play className="h-4 w-4" />
                  Latest Uploads
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4">
                  {data.latestUploads.map((video) => (
                    <a
                      key={video.id}
                      href={video.link}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-5 transition hover:border-emerald-400/60"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/60">
                        <span>{formatDate(video.publishedAt)}</span>
                        {video.views ? (
                          <span className="font-medium text-emerald-300">
                            {video.views.toLocaleString()} views
                          </span>
                        ) : (
                          <span aria-hidden className="opacity-0">placeholder</span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white transition group-hover:text-emerald-200">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="line-clamp-2 text-sm text-white/60">
                          {video.description}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </article>
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                  Narrative Hook
                </h3>
                <p className="mt-4 text-base text-white/70">
                  {data.playbook.narrativeHook}
                </p>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                  Cadence Focus
                </h3>
                <p className="mt-4 text-base text-white/70">
                  {data.playbook.cadenceFocus}
                </p>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                  Packaging Beats
                </h3>
                <ul className="mt-4 flex list-disc flex-col gap-3 pl-5 text-sm text-white/70">
                  {data.playbook.packagingTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                  Collaboration Ideas
                </h3>
                <ul className="mt-4 flex list-disc flex-col gap-3 pl-5 text-sm text-white/70">
                  {data.playbook.collaborationIdeas.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </section>

              {topVideo && (
                <section className="rounded-3xl border border-white/10 bg-emerald-400/10 p-8 backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
                    Breakout Upload
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {topVideo.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">
                    Published {formatDate(topVideo.publishedAt)}
                  </p>
                  {topVideo.views && (
                    <p className="mt-2 text-sm text-emerald-200">
                      {topVideo.views.toLocaleString()} views
                    </p>
                  )}
                  <a
                    href={topVideo.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-white"
                  >
                    Watch
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </section>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
