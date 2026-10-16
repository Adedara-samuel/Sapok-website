import { z } from "zod";

/*
 * Everything on the public site that the admin portal can edit.
 * The schema doubles as validation for the admin "save content" API.
 */

const text = (max = 400) => z.string().trim().max(max);
const url = z.union([z.literal(""), z.string().trim().max(600).regex(/^(https?:\/\/|\/|mailto:|tel:)/, "Must be a link (https://, /, mailto: or tel:)")]);

export const productMarks = ["onegrid", "pay", "ai", "withu", "vibesphere"] as const;

export const contentSchema = z.object({
  company: z.object({
    name: text(60),
    tagline: text(120),
    founded: text(40),
    owner: text(80),
    ownerTitle: text(80),
  }),
  hero: z.object({
    eyebrow: text(120),
    headline: text(120),
    highlight: text(80),
    subtitle: text(400),
    ideas: z.array(text(120)).max(12),
  }),
  about: z.object({
    heading: text(160),
    paragraphs: z.array(text(900)).max(6),
  }),
  mission: text(900),
  vision: text(900),
  values: z.array(z.object({ title: text(60), body: text(300) })).max(8),
  services: z.array(z.object({ title: text(80), body: text(400), tags: z.array(text(40)).max(6) })).max(12),
  process: z.array(z.object({ title: text(40), body: text(300) })).max(8),
  products: z
    .array(
      z.object({
        slug: z.string().trim().regex(/^[a-z0-9-]{2,40}$/, "lowercase letters, numbers and dashes"),
        name: text(60),
        category: text(60),
        status: z.enum(["Live", "In progress", "Coming soon"]),
        summary: text(400),
        features: z.array(text(160)).max(8),
        link: url,
        mark: z.enum(productMarks),
      }),
    )
    .max(10),
  clients: z.array(z.object({ name: text(80), logo: url, link: url, sector: text(60) })).max(24),
  stats: z.array(z.object({ value: z.number().int().min(0).max(1_000_000), suffix: text(6), label: text(60) })).max(6),
  contact: z.object({
    email: z.string().trim().max(120).pipe(z.email()),
    phone: text(40),
    whatsapp: text(40),
    address: text(240),
    hours: text(120),
  }),
  socials: z.array(z.object({ label: text(40), href: url })).max(10),
});

export type SiteContent = z.infer<typeof contentSchema>;
export type Product = SiteContent["products"][number];

export const defaultContent: SiteContent = {
  company: {
    name: "SAPOK TECH",
    tagline: "Building solutions. Empowering futures.",
    founded: "January 2025",
    owner: "Adedara Samuel Sapok",
    ownerTitle: "Founder & CEO",
  },
  hero: {
    eyebrow: "Technology company · Consulting · Product studio",
    headline: "If you can think it,",
    highlight: "we can build it.",
    subtitle:
      "SAPOK TECH turns ideas into working technology — websites, apps, platforms, payments and AI — designed, engineered and supported end to end.",
    ideas: [
      "A booking app for my salon",
      "An online store with Paystack checkout",
      "A school portal for results and fees",
      "A hospital records system for my clinic",
      "An AI assistant for my customer service",
      "A real-estate site with an admin panel",
    ],
  },
  about: {
    heading: "An all-round technology partner for ideas of every size.",
    paragraphs: [
      "SAPOK TECH is a technology and consulting company. Bring us a problem, a sketch or a half-formed idea, and we take it the whole way: strategy, design, engineering, launch and the support that keeps it running.",
      "We build for clients across healthcare, real estate, retail, faith communities and finance — and we build our own products too, so we know what it takes to run software, not just ship it.",
    ],
  },
  mission:
    "To deliver solutions that do more than satisfy — technology that goes beyond the brief and brings anything our clients can imagine into reality, and leaves them smiling long after launch.",
  vision:
    "To be Africa's most trusted all-round technology solutions company: the first call for anyone with an idea, known for products that last and clients who stay happy.",
  values: [
    { title: "Beyond satisfaction", body: "We aim past “good enough” — the goal is a client who is genuinely delighted." },
    { title: "Built to last", body: "Clean architecture, security and support, so what we build keeps working for years." },
    { title: "Imagination first", body: "If you can think it, it can be real. No idea is too early or too ambitious to start." },
    { title: "Partnership", body: "We stay with you after launch — iterating, supporting and growing the product with you." },
  ],
  services: [
    { title: "Tech consulting", body: "Not sure where to start? We shape the idea, pick the right technology and map the road from concept to launch.", tags: ["Strategy", "Architecture", "Roadmaps"] },
    { title: "Websites & web apps", body: "Fast, beautiful sites and full web platforms with admin panels you can run yourself.", tags: ["Next.js", "CMS", "SEO"] },
    { title: "Mobile & desktop apps", body: "Native-feeling apps for Android, iOS and desktop that share one robust backend.", tags: ["React Native", "Tauri", "Offline-ready"] },
    { title: "Enterprise systems", body: "Hospital, school, HR, document and operations systems with roles, audit trails and reports.", tags: ["RBAC", "Audit logs", "Dashboards"] },
    { title: "Payments & fintech", body: "Wallets, checkouts, payouts and reconciliation — integrated properly with Paystack and banks.", tags: ["Paystack", "Wallets", "Ledgers"] },
    { title: "AI & automation", body: "Assistants, smart search and automations that save hours — always respecting who can see what.", tags: ["AI assistants", "RAG", "Automation"] },
    { title: "UI/UX & branding", body: "Logos, brand identities and product design that make people trust you at first glance.", tags: ["Brand", "UI/UX", "Design systems"] },
    { title: "Cloud & support", body: "Hosting, monitoring, backups and ongoing care so your product stays fast and online.", tags: ["Cloud", "Maintenance", "Security"] },
  ],
  process: [
    { title: "Imagine", body: "You tell us the idea — however rough. We listen, ask the right questions and find what success looks like." },
    { title: "Design", body: "We sketch flows and design the experience, and you see it before a line of code is written." },
    { title: "Build", body: "We engineer it properly — secure, tested and fast — and show progress every step of the way." },
    { title: "Launch", body: "We deploy, train your team and make sure the first day is a great day." },
    { title: "Grow", body: "We stay on: support, improvements and new features as your business grows." },
  ],
  products: [
    {
      slug: "onegrid",
      name: "Sapok OneGrid",
      category: "Organisation management",
      status: "In progress",
      summary: "One desktop app that runs an entire organisation — staff, payroll, operations and more — with modules and permissions tailored to each company.",
      features: ["Multi-organisation desktop app", "Modules switched on per subscription", "Roles & permissions", "Payroll and operations"],
      link: "",
      mark: "onegrid",
    },
    {
      slug: "sapok-pay",
      name: "SAPOK Pay",
      category: "Fintech",
      status: "In progress",
      summary: "Wallets, ledgers and payouts for businesses — sign up, get a wallet instantly and move money from your own apps with API keys.",
      features: ["Instant business wallets", "Payouts & payroll payments", "Developer API keys", "Fast · Secure · Simple"],
      link: "",
      mark: "pay",
    },
    {
      slug: "sapok-ai",
      name: "SAPOK AI",
      category: "Artificial intelligence",
      status: "In progress",
      summary: "AI assistance and knowledge search for organisations and developers — smart, fast, and it never shows anyone what they're not allowed to see.",
      features: ["AI assistants", "Knowledge search", "Developer platform", "Permission-aware"],
      link: "",
      mark: "ai",
    },
    {
      slug: "withu",
      name: "WITHU",
      category: "Lifestyle · Social",
      status: "Live",
      summary: "A private space for two people who are apart — chat, play games, watch together and keep a shared memory book. Always with you.",
      features: ["Realtime chat", "Games together", "Watch & listen together", "Web and mobile"],
      link: "https://withu-web-seven.vercel.app",
      mark: "withu",
    },
    {
      slug: "vibesphere",
      name: "VibeSphere",
      category: "Social media",
      status: "In progress",
      summary: "A social platform with its own language — Pulses, Waves, Echoes and Tribes — with short videos, realtime chat and trending content.",
      features: ["Short-video Pulses", "Trending Waves", "Realtime chat", "Tribes & Echoes"],
      link: "",
      mark: "vibesphere",
    },
  ],
  clients: [
    { name: "Epilux Water", logo: "/clients/epilux.png", link: "", sector: "Manufacturing · E-commerce" },
    { name: "Future Homes Properties", logo: "/clients/future-homes.png", link: "https://futurehomesproperties.vercel.app", sector: "Real estate" },
    { name: "Ruomax Properties", logo: "/clients/ruomax.png", link: "https://ruomax.vercel.app", sector: "Real estate" },
    { name: "Redeemer's Health Village", logo: "/clients/rhv.png", link: "", sector: "Healthcare" },
  ],
  stats: [
    { value: 24, suffix: "+", label: "Projects delivered" },
    { value: 5, suffix: "", label: "In-house products" },
    { value: 4, suffix: "+", label: "Industries served" },
    { value: 100, suffix: "%", label: "Commitment to clients" },
  ],
  contact: {
    email: "sapoktech.c@gmail.com",
    phone: "+234 724 099 7853",
    whatsapp: "+234 909 099 7853",
    address: "14, Tree of Life, off RHV Road, Redemption City, Ogun State, Nigeria",
    hours: "Mon – Sat · 9:00 – 18:00 WAT",
  },
  socials: [
    { label: "GitHub", href: "https://github.com/Adedara-samuel" },
    { label: "LinkedIn", href: "https://linkedin.com/in/adedara-samuel" },
    { label: "Twitter / X", href: "https://twitter.com/AdedaraSP" },
    { label: "Pinterest", href: "https://www.pinterest.com/adedarapsalmuel/" },
  ],
};

/** Strip a phone number to digits with country code, for tel: and wa.me links. */
export function phoneDigits(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") ? `234${d.slice(1)}` : d;
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                           */
/* ------------------------------------------------------------------ */

export const enquiryInputSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().max(160).pipe(z.email("Please enter a valid email")),
  phone: z.string().trim().max(40).optional().default(""),
  company: z.string().trim().max(120).optional().default(""),
  service: z.string().trim().max(80).optional().default(""),
  budget: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(4000),
  idea: z.string().trim().max(200).optional().default(""),
  // Honeypot — real visitors never fill this in
  website: z.string().max(0).optional().default(""),
});

export type EnquiryInput = z.infer<typeof enquiryInputSchema>;

export type EnquiryStatus = "new" | "read" | "archived";

export interface Enquiry extends Omit<EnquiryInput, "website"> {
  id: string;
  status: EnquiryStatus;
  createdAt: string;
  emailed: boolean;
}
