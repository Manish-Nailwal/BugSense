// Parent ecosystem hub. Trace (trace.manishlabs.com) is one node of Manish Labs;
// these cross-links quietly route interested visitors back to the hub.
export const MANISH_LABS_URL = "https://manishlabs.com";
export const TRACE_URL = "https://trace.manishlabs.com";
export const PORTFOLIO_URL = "https://me.manishlabs.com";

// Public contact for legal / support pages.
export const CONTACT_EMAIL = "workmanishnailwal@gmail.com";

// The person behind Trace + Manish Labs.
export const CREATOR = {
  name: "Manish Nailwal",
  role: "Software Engineer & Designer",
  bio: "Software engineer and designer specializing in high-performance web systems and minimal, functional UI design. Trace is one of the products built under Manish Labs.",
  portfolio: PORTFOLIO_URL,
};

// Social links surfaced in footers and the About page. `icon` maps to a
// lucide-react component in the rendering component.
export const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Manish-Nailwal", icon: "github" },
  { label: "LinkedIn", href: "https://linkedin.com/in/manish-nailwal", icon: "linkedin" },
  { label: "X (Twitter)", href: "https://x.com/manishnailwal_", icon: "twitter" },
  { label: "Email", href: `mailto:${CONTACT_EMAIL}`, icon: "mail" },
];

// Other nodes of the Manish Labs ecosystem (for cross-promotion on About).
export const ECOSYSTEM = [
  {
    name: "CauseConnect",
    url: "https://cause.manishlabs.com",
    tagline: "Milestone-locked, transparent peer-to-peer fundraising.",
    status: "Live",
  },
  {
    name: "Quill",
    url: "https://quill.manishlabs.com",
    tagline: "Multi-tenant SaaS publishing engine with subdomain mapping.",
    status: "In planning",
  },
  {
    name: "Flash Challenge",
    url: "https://flash.manishlabs.com",
    tagline: "A low-latency Simon-Says memory arcade game.",
    status: "Completed",
  },
];
