import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { ndaDocuments, ndaSignatures, users } from "@/lib/db/schema";
import { count, desc, eq } from "drizzle-orm";
import NDAManager, { type NdaVersionRow } from "@/components/dashboard/Admin/NDAManager";

export default async function NDAManagerPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");
    if ((session.user as any).role !== "SuperAdmin") redirect("/dashboard");

    const [docs, totalRow] = await Promise.all([
        db.select().from(ndaDocuments).orderBy(desc(ndaDocuments.createdAt)),
        db.select({ count: count() }).from(users).then((r) => r[0]),
    ]);
    const totalUsers = totalRow?.count ?? 0;

    const versions: NdaVersionRow[] = await Promise.all(
        docs.map(async (doc) => {
            const [signedRow] = await db
                .select({ count: count() })
                .from(ndaSignatures)
                .where(eq(ndaSignatures.documentVersion, doc.version));
            return {
                id: doc.id,
                version: doc.version,
                uploadedAt: new Date(doc.createdAt).toISOString().slice(0, 10),
                status: doc.isActive ? "active" : "archived",
                signedCount: signedRow?.count ?? 0,
                totalUsers,
            };
        }),
    );

    return <NDAManager versions={versions} />;
}
