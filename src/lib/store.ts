import "server-only";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { MongoClient, type Collection } from "mongodb";
import { contentSchema, defaultContent, type Enquiry, type EnquiryInput, type EnquiryStatus, type SiteContent } from "./content";

/*
 * Storage. Uses MongoDB when MONGODB_URI is set (production / Vercel).
 * Without it, falls back to JSON files in ./.data so the site runs locally with zero setup.
 * The file fallback is refused in production because serverless file systems are read-only.
 */

export interface AdminRecord {
  email: string;
  /** scrypt hash: "scrypt$<salt>$<hash>" */
  passwordHash: string;
  updatedAt: string;
}

interface Store {
  getAdmin(): Promise<AdminRecord | null>;
  setAdmin(admin: AdminRecord): Promise<void>;
  getContent(): Promise<SiteContent>;
  saveContent(content: SiteContent): Promise<void>;
  addEnquiry(input: Omit<EnquiryInput, "website">, emailed: boolean): Promise<Enquiry>;
  markEmailed(id: string, emailed: boolean): Promise<void>;
  listEnquiries(): Promise<Enquiry[]>;
  updateEnquiry(id: string, status: EnquiryStatus): Promise<boolean>;
  deleteEnquiry(id: string): Promise<boolean>;
}

/** Merge stored content over defaults so newly added fields always have a value. */
function withDefaults(stored: unknown): SiteContent {
  const parsed = contentSchema.partial().safeParse(stored);
  return parsed.success ? { ...defaultContent, ...parsed.data } : defaultContent;
}

/* ---------------------------------- MongoDB --------------------------------- */

type ContentDoc = { _id: string; content: SiteContent; updatedAt: Date };
type AdminDoc = AdminRecord & { _id: string };
type EnquiryDoc = Omit<Enquiry, "id"> & { _id: string };

const g = globalThis as unknown as { __sapokMongo?: Promise<MongoClient> };

async function collections() {
  if (!g.__sapokMongo) g.__sapokMongo = new MongoClient(process.env.MONGODB_URI!).connect();
  const db = (await g.__sapokMongo).db(process.env.MONGODB_DB || "sapok_website");
  return {
    site: db.collection<ContentDoc>("site"),
    enquiries: db.collection<EnquiryDoc>("enquiries"),
    admins: db.collection<AdminDoc>("admins"),
  };
}

const toEnquiry = ({ _id, ...rest }: EnquiryDoc): Enquiry => ({ id: _id, ...rest });

const mongoStore: Store = {
  async getAdmin() {
    const { admins } = await collections();
    const doc = await admins.findOne({ _id: "owner" });
    return doc ? { email: doc.email, passwordHash: doc.passwordHash, updatedAt: doc.updatedAt } : null;
  },
  async setAdmin(admin) {
    const { admins } = await collections();
    await admins.updateOne({ _id: "owner" }, { $set: admin }, { upsert: true });
  },
  async getContent() {
    const { site } = await collections();
    return withDefaults((await site.findOne({ _id: "content" }))?.content);
  },
  async saveContent(content) {
    const { site } = await collections();
    await site.updateOne({ _id: "content" }, { $set: { content, updatedAt: new Date() } }, { upsert: true });
  },
  async addEnquiry(input, emailed) {
    const { enquiries } = await collections();
    const doc: EnquiryDoc = { _id: randomUUID(), ...input, status: "new", createdAt: new Date().toISOString(), emailed };
    await enquiries.insertOne(doc);
    return toEnquiry(doc);
  },
  async markEmailed(id, emailed) {
    const { enquiries } = await collections();
    await enquiries.updateOne({ _id: id }, { $set: { emailed } });
  },
  async listEnquiries() {
    const { enquiries } = await collections();
    return (await (enquiries as Collection<EnquiryDoc>).find().sort({ createdAt: -1 }).limit(1000).toArray()).map(toEnquiry);
  },
  async updateEnquiry(id, status) {
    const { enquiries } = await collections();
    return (await enquiries.updateOne({ _id: id }, { $set: { status } })).matchedCount > 0;
  },
  async deleteEnquiry(id) {
    const { enquiries } = await collections();
    return (await enquiries.deleteOne({ _id: id })).deletedCount > 0;
  },
};

/* ------------------------------- Local JSON file ------------------------------ */

const DATA_DIR = path.join(process.cwd(), ".data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const ENQUIRIES_FILE = path.join(DATA_DIR, "enquiries.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

const fileStore: Store = {
  async getAdmin() {
    return readJson<AdminRecord | null>(ADMIN_FILE, null);
  },
  async setAdmin(admin) {
    await writeJson(ADMIN_FILE, admin);
  },
  async getContent() {
    return withDefaults(await readJson<unknown>(CONTENT_FILE, null));
  },
  async saveContent(content) {
    await writeJson(CONTENT_FILE, content);
  },
  async addEnquiry(input, emailed) {
    const list = await readJson<Enquiry[]>(ENQUIRIES_FILE, []);
    const enquiry: Enquiry = { id: randomUUID(), ...input, status: "new", createdAt: new Date().toISOString(), emailed };
    await writeJson(ENQUIRIES_FILE, [enquiry, ...list].slice(0, 1000));
    return enquiry;
  },
  async markEmailed(id, emailed) {
    const list = await readJson<Enquiry[]>(ENQUIRIES_FILE, []);
    await writeJson(ENQUIRIES_FILE, list.map((e) => (e.id === id ? { ...e, emailed } : e)));
  },
  async listEnquiries() {
    return readJson<Enquiry[]>(ENQUIRIES_FILE, []);
  },
  async updateEnquiry(id, status) {
    const list = await readJson<Enquiry[]>(ENQUIRIES_FILE, []);
    if (!list.some((e) => e.id === id)) return false;
    await writeJson(ENQUIRIES_FILE, list.map((e) => (e.id === id ? { ...e, status } : e)));
    return true;
  },
  async deleteEnquiry(id) {
    const list = await readJson<Enquiry[]>(ENQUIRIES_FILE, []);
    const next = list.filter((e) => e.id !== id);
    if (next.length === list.length) return false;
    await writeJson(ENQUIRIES_FILE, next);
    return true;
  },
};

export function store(): Store {
  if (process.env.MONGODB_URI) return mongoStore;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    throw new Error("MONGODB_URI is not set. Add it in your Vercel project settings — the local file store cannot run on Vercel.");
  }
  return fileStore;
}
