import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, User } from "@/lib/db/schema";
import { hashValue, compareValue } from "../helpers/hash";

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const results = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
  return results[0];
}

export async function findUserById(id: string): Promise<User | undefined> {
  const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return results[0];
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordPlain: string;
  pinPlain: string;
}): Promise<User> {
  const passwordHash = await hashValue(data.passwordPlain);
  const pinHash = await hashValue(data.pinPlain);

  const [newUser] = await db
    .insert(users)
    .values({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash,
      pinHash,
    })
    .returning();

  return newUser;
}

export async function verifyUserCredentials(email: string, passwordPlain: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const isValid = await compareValue(passwordPlain, user.passwordHash);
  return isValid ? user : null;
}

export async function verifyUserPin(userId: string, pinPlain: string): Promise<boolean> {
  const user = await findUserById(userId);
  if (!user) return false;
  return compareValue(pinPlain, user.pinHash);
}
