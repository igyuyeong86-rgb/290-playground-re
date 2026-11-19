/**
 * All personal content for the home page lives here. Replace the sample values with your own.
 * Case studies and blog posts live in content/work.json and content/blog.json.
 */
export const profile = {
  name: "twoninezero",
  short: "290",
  role: "cybersecurity student",
  location: "충주, 건국대학교 글로컬캠퍼스",
  timezone: "UTC",
  email: "igyuyeong86@gmail.com",
  github: "https://github.com/igyuyeong86-rgb",
  githubUser: "igyuyeong86-rgb", // powers the GitHub activity graph
  resume: "/resume", // the generated /resume page; point to your own PDF URL if you prefer
  avatar: "/img/avatar-dark.webp",
  avatarLight: "/img/avatar-light.webp",
  // Optional, used for structured data. Leave empty strings to omit.
  region: "",
  country: "",
  about: [
    "이것저것 배워보려 하고 있는 290입니다.",
    "재미있어 보이는건 다 해보는 중입니다"
  ],
  snapshot: [
    "CS 스터디",
    "컴퓨터 툴 공부",
    "파이썬 언어 공부"
  ],
};

export type Category = "Web" | "Mobile" | "Desktop" | "Tooling";

export const projectFilters: ("All" | Category)[] = ["All", "Web", "Mobile", "Desktop", "Tooling"];

export const projects: {
  title: string;
  image: string;
  year: string;
  category: Category;
  featured?: boolean;
  status: "LIVE" | "WIP" | "PRIVATE";
  description: string;
  tags: string[];
  live?: string;
  repo?: string;
  /** Path of a case study in content/work.json, e.g. "/work/northwind-dashboard". */
  caseStudy?: string;
}[] = [
  {
    title: "Northwind Dashboard",
    image: "/img/projects/northwind-dashboard.jpg",
    year: "2026",
    category: "Web",
    featured: true,
    status: "LIVE",
    description:
      "A sample analytics dashboard: real-time charts, role-based access and CSV export, built as a fast single-page app on a typed API.",
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    live: "https://example.com",
    repo: "https://github.com/octocat/Hello-World",
    caseStudy: "/work/northwind-dashboard",
  },
  {
    title: "Pocket Budget",
    image: "/img/projects/pocket-budget.jpg",
    year: "2025",
    category: "Mobile",
    featured: true,
    status: "LIVE",
    description:
      "A sample personal-finance app that works offline first: log spending in seconds and sync when a connection returns.",
    tags: ["React Native", "SQLite", "TypeScript"],
    live: "https://example.com",
    caseStudy: "/work/pocket-budget",
  },
  {
    title: "Plainfile CLI",
    image: "/img/projects/plainfile-cli.jpg",
    year: "2025",
    category: "Tooling",
    featured: true,
    status: "LIVE",
    description:
      "A sample command-line tool that keeps folders of plain text files in sync, with conflict resolution and a dry-run mode.",
    tags: ["Node.js", "CLI", "TypeScript"],
    repo: "https://github.com/octocat/Hello-World",
    caseStudy: "/work/plainfile-cli",
  },
  {
    title: "Orbit Notes",
    image: "/img/projects/orbit-notes.jpg",
    year: "2026",
    category: "Desktop",
    status: "WIP",
    description:
      "A sample desktop notes app with local-first storage and instant search. This entry has no case study, which is fine.",
    tags: ["Electron", "React", "SQLite"],
    repo: "https://github.com/octocat/Hello-World",
  },
];

export const experience = [
  {
    role: "Senior Full Stack Developer",
    company: "Acme Corp",
    period: "2023 – Present",
    body: "Sample entry. Lead a small team building customer-facing web products, from architecture and APIs to CI/CD and performance budgets.",
  },
  {
    role: "Full Stack Developer",
    company: "Globex",
    period: "2020 – 2023",
    body: "Sample entry. Built and shipped internal tools and a public dashboard used by thousands of people every week.",
  },
];

export const stackGroups: Record<string, string[]> = {
  Languages: ["Python"],
  Tools: ["Git", "kali linux", "Burp Suite", "wireshark"],
};
