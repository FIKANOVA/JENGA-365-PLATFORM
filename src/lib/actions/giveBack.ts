"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { giveBackTracking } from "@/lib/db/schema";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

export async function logGiveBackActivity(params: {
  quarter: string;
  activityType: string;
  description: string;
}): Promise<{ id: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("UNAUTHORIZED");

  const [row] = await db
    .insert(giveBackTracking)
    .values({
      userId: session.user.id,
      quarter: params.quarter,
      activityType: params.activityType,
      activityDescription: params.description,
      activityCompleted: true,
    })
    .returning({ id: giveBackTracking.id });

  return { id: row.id };
}

export async function getGiveBackStatus(
  quarter: string
): Promise<typeof giveBackTracking.$inferSelect | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("UNAUTHORIZED");

  const [row] = await db
    .select()
    .from(giveBackTracking)
    .where(
      and(
        eq(giveBackTracking.userId, session.user.id),
        eq(giveBackTracking.quarter, quarter)
      )
    )
    .limit(1);

  return row ?? null;
}
