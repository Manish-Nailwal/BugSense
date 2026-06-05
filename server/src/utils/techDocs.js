/**
 * Maps a tech-stack name (as suggested by the AI) to its OFFICIAL documentation.
 * Used to turn the report's recommendations into "Official Learning Paths" cards.
 */
const DOCS = {
  javascript: { url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", level: "Language" },
  js: { url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", level: "Language" },
  typescript: { url: "https://www.typescriptlang.org/docs/", level: "Language" },
  ts: { url: "https://www.typescriptlang.org/docs/", level: "Language" },
  react: { url: "https://react.dev/learn", level: "Framework" },
  reactjs: { url: "https://react.dev/learn", level: "Framework" },
  "react native": { url: "https://reactnative.dev/docs/getting-started", level: "Mobile" },
  vue: { url: "https://vuejs.org/guide/introduction.html", level: "Framework" },
  angular: { url: "https://angular.dev/overview", level: "Framework" },
  svelte: { url: "https://svelte.dev/docs", level: "Framework" },
  next: { url: "https://nextjs.org/docs", level: "Fullstack" },
  nextjs: { url: "https://nextjs.org/docs", level: "Fullstack" },
  node: { url: "https://nodejs.org/docs/latest/api/", level: "Runtime" },
  nodejs: { url: "https://nodejs.org/docs/latest/api/", level: "Runtime" },
  express: { url: "https://expressjs.com/en/guide/routing.html", level: "Backend" },
  expressjs: { url: "https://expressjs.com/en/guide/routing.html", level: "Backend" },
  tailwind: { url: "https://tailwindcss.com/docs", level: "Styling" },
  tailwindcss: { url: "https://tailwindcss.com/docs", level: "Styling" },
  css: { url: "https://developer.mozilla.org/en-US/docs/Web/CSS", level: "Styling" },
  html: { url: "https://developer.mozilla.org/en-US/docs/Web/HTML", level: "Markup" },
  mongodb: { url: "https://www.mongodb.com/docs/", level: "Database" },
  mongoose: { url: "https://mongoosejs.com/docs/guide.html", level: "Database" },
  postgresql: { url: "https://www.postgresql.org/docs/", level: "Database" },
  postgres: { url: "https://www.postgresql.org/docs/", level: "Database" },
  sql: { url: "https://www.postgresql.org/docs/current/tutorial-sql.html", level: "Database" },
  mysql: { url: "https://dev.mysql.com/doc/", level: "Database" },
  redis: { url: "https://redis.io/docs/latest/", level: "Cache" },
  prisma: { url: "https://www.prisma.io/docs", level: "ORM" },
  graphql: { url: "https://graphql.org/learn/", level: "API" },
  docker: { url: "https://docs.docker.com/get-started/", level: "DevOps" },
  kubernetes: { url: "https://kubernetes.io/docs/home/", level: "DevOps" },
  k8s: { url: "https://kubernetes.io/docs/home/", level: "DevOps" },
  git: { url: "https://git-scm.com/doc", level: "Tooling" },
  vite: { url: "https://vite.dev/guide/", level: "Tooling" },
  webpack: { url: "https://webpack.js.org/concepts/", level: "Tooling" },
  jest: { url: "https://jestjs.io/docs/getting-started", level: "Testing" },
  python: { url: "https://docs.python.org/3/", level: "Language" },
  django: { url: "https://docs.djangoproject.com/en/stable/", level: "Framework" },
  flask: { url: "https://flask.palletsprojects.com/", level: "Framework" },
  fastapi: { url: "https://fastapi.tiangolo.com/", level: "Framework" },
  java: { url: "https://docs.oracle.com/en/java/", level: "Language" },
  spring: { url: "https://spring.io/projects/spring-boot", level: "Framework" },
  go: { url: "https://go.dev/doc/", level: "Language" },
  golang: { url: "https://go.dev/doc/", level: "Language" },
  rust: { url: "https://doc.rust-lang.org/book/", level: "Language" },
  php: { url: "https://www.php.net/docs.php", level: "Language" },
  laravel: { url: "https://laravel.com/docs", level: "Framework" },
  ruby: { url: "https://www.ruby-lang.org/en/documentation/", level: "Language" },
  rails: { url: "https://guides.rubyonrails.org/", level: "Framework" },
  firebase: { url: "https://firebase.google.com/docs", level: "Platform" },
  aws: { url: "https://docs.aws.amazon.com/", level: "Cloud" },

  // Engineering concepts & well-known reference sites (no single vendor "official"
  // doc, so these point at the canonical reputable resource).
  "refactoring.guru": { url: "https://refactoring.guru", level: "Reference" },
  refactoring: { url: "https://refactoring.guru/refactoring", level: "Practice" },
  "design patterns": { url: "https://refactoring.guru/design-patterns", level: "Patterns" },
  solid: { url: "https://refactoring.guru/design-patterns", level: "Principles" },
  "solid principles": { url: "https://refactoring.guru/design-patterns", level: "Principles" },
  oop: { url: "https://refactoring.guru/design-patterns", level: "Concept" },
  "object oriented programming": { url: "https://refactoring.guru/design-patterns", level: "Concept" },
  "clean code": { url: "https://refactoring.guru/refactoring/smells", level: "Practice" },
  "system design": { url: "https://roadmap.sh/system-design", level: "Architecture" },
  architecture: { url: "https://roadmap.sh/software-design-architecture", level: "Architecture" },
  "software architecture": { url: "https://roadmap.sh/software-design-architecture", level: "Architecture" },
  "software engineering": { url: "https://roadmap.sh/software-design-architecture", level: "Engineering" },
  "software engineering principles": { url: "https://roadmap.sh/software-design-architecture", level: "Engineering" },
  testing: { url: "https://martinfowler.com/testing/", level: "Testing" },
  "unit testing": { url: "https://martinfowler.com/bliki/UnitTest.html", level: "Testing" },
  security: { url: "https://owasp.org/www-project-top-ten/", level: "Security" },
  "web security": { url: "https://owasp.org/www-project-top-ten/", level: "Security" },
  rest: { url: "https://developer.mozilla.org/en-US/docs/Web/HTTP", level: "API" },
  "rest api": { url: "https://developer.mozilla.org/en-US/docs/Web/HTTP", level: "API" },
  api: { url: "https://developer.mozilla.org/en-US/docs/Web/HTTP", level: "API" },
  http: { url: "https://developer.mozilla.org/en-US/docs/Web/HTTP", level: "Web" },
  "data structures": { url: "https://roadmap.sh/datastructures-and-algorithms", level: "CS" },
  algorithms: { url: "https://roadmap.sh/datastructures-and-algorithms", level: "CS" },
};

const norm = (s = "") => s.toLowerCase().trim().replace(/\.js$/, "").replace(/\s+/g, " ");

/**
 * @returns {{ name: string, url: string, level: string }}
 */
export const resolveTechDocs = (rawName) => {
  const name = String(rawName || "").trim();
  if (!name) return null;
  const key = norm(name);
  const hit = DOCS[key] || DOCS[key.replace(/\s/g, "")];
  if (hit) return { name, url: hit.url, level: hit.level };
  // Fallback: DevDocs (a real documentation aggregator) rather than a web search.
  return {
    name,
    url: `https://devdocs.io/#q=${encodeURIComponent(name)}`,
    level: "Reference",
  };
};
