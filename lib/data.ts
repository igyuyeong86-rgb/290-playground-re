/**
 * All personal content for the home page lives here. Replace the sample values with your own.
 * Case studies and blog posts live in content/work/ and content/blog/.
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

export type Category = "test" | "test2";

export const projectFilters: ("All" | Category)[] = ["All", "test", "test2"];

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
  /** Route for a Markdown file in content/work/, e.g. "/work/northwind-dashboard". */
  caseStudy?: string;
}[] = [
  {
    title: "Northwind Dashboard (샘플)",
    image: "/img/projects/northwind-dashboard.jpg",
    year: "2026",
    category: "test",
    featured: true,
    status: "WIP",
    description: "프로젝트 카드와 상세 글을 연결하는 방법을 보여주는 예시입니다.",
    tags: ["React", "TypeScript", "Node.js"],
    caseStudy: "/work/northwind-dashboard",
  },
];

export const experience = [
  {
    role: "충북 정보보호 해커톤 대상 수상",
    company: "허니 하이라이트 콤보 팀",
    period: "2026.11.21",
    body: "충북 정보보호 해커톤 대회에 '허니 하이라이트 콤보'팀으로 참여하여 대상을 수상하였습니다.",
  },
];

export const stackGroups: Record<string, string[]> = {
  Languages: ["Python"],
  Tools: ["Git", "kali linux", "Burp Suite", "wireshark"],
};
