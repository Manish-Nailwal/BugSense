import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, matchPath } from "react-router-dom";

const SITE = "Trace";

const DEFAULT = {
  title: "Trace | Socratic AI Debugging Platform by Manish Labs",
  description:
    "Trace turns cryptic errors and stack traces into clear, Socratic explanations and mental models, so you fix the bug and actually learn. Built by Manish Labs.",
};

// First match wins. `title: null` uses the full default title (for the homepage).
// Pages with dynamic data (e.g. an article) render their own <Helmet> to override.
const ROUTES = [
  { path: "/", title: null, description: DEFAULT.description },
  { path: "/library", title: "Library", description: "Browse real-world bug fixes and debugging write-ups shared by the Trace community: searchable solutions across React, Node, TypeScript and more." },
  { path: "/library/:slug", title: "Library", description: "A community-shared debugging solution on Trace." },
  { path: "/guide", title: "Guide", description: "Learn how to get the most out of Trace, from pasting your first error to reading your growth analytics and publishing fixes." },
  { path: "/about", title: "About", description: "What Trace is, how it works, and the story behind it: a Socratic AI debugging platform built by Manish Labs." },
  { path: "/terms", title: "Terms of Service", description: "The terms that govern your use of Trace, the AI-assisted debugging platform by Manish Labs." },
  { path: "/privacy", title: "Privacy Policy", description: "How Trace collects, uses, and protects your data on its privacy-first AI debugging platform, by Manish Labs." },
  { path: "/auth/login", title: "Log In", description: "Log in to Trace to debug errors with AI guidance and track your growth as an engineer." },
  { path: "/auth/register", title: "Create your account", description: "Create your free Trace account and start turning errors into understanding." },
  { path: "/dashboard", title: "Analytics", description: "Your debugging insights: recurring error patterns, success rate, and the skills and learning paths Trace recommends next." },
  { path: "/analytics/reports", title: "Reports", description: "Your generated Trace insight reports, recommended resources, and skill gaps over time." },
  { path: "/analytics/learning", title: "Skills & Learning Paths", description: "Every recommended skill and official learning path Trace has surfaced from your debugging activity." },
  { path: "/workspace", title: "Workspace", description: "Manage your debugging conversations and the fixes you've published to the Trace Library." },
  { path: "/c/:sessionId", title: "Debugging Session", description: "Work through a bug step by step with Trace's Socratic AI debugger." },
];

/**
 * Drives <title> + meta description (and Open Graph / Twitter tags) from the
 * current route. Because it re-renders on every navigation, the title can never
 * "stick" from a previous page. Mounted once, near the top of the app.
 */
const RouteMeta = () => {
  const { pathname } = useLocation();

  const match = ROUTES.find((r) => matchPath({ path: r.path, end: true }, pathname));
  const title = match
    ? match.title
      ? `${match.title} | ${SITE}`
      : DEFAULT.title
    : DEFAULT.title;
  const description = match?.description || DEFAULT.description;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default RouteMeta;
