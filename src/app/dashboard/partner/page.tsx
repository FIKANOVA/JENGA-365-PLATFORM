import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import PartnerDashboard from "@/components/dashboard/Partner/PartnerDashboard";
import { getCsrStats } from "@/lib/actions/csr";
import { db } from "@/lib/db";
import { corporatePartners, users, events } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const metadata: Metadata = {
    title: "Partner Impact Portal | Jenga365",
    description: "Welcome to your Jenga365 Corporate Partner Impact Portal.",
};

export default async function PartnerDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const partnerId = (session?.user as any)?.partnerId as string | undefined;

    const [csrStats, partner, sponsoredMentors, upcomingEvents] = await Promise.all([
        partnerId ? getCsrStats(partnerId).catch(() => null) : Promise.resolve(null),
        partnerId
            ? db.query.corporatePartners.findFirst({ where: eq(corporatePartners.id, partnerId) }).catch(() => null)
            : Promise.resolve(null),
        partnerId
            ? db
                .select({ id: users.id, name: users.name, image: users.image })
                .from(users)
                .where(eq(users.partnerId, partnerId))
                .limit(6)
                .catch(() => [])
            : Promise.resolve([]),
        db
            .select()
            .from(events)
            .orderBy(desc(events.date))
            .limit(3)
            .catch(() => []),
    ]);

    return (
        <PartnerDashboard
            company={partner?.orgName ?? session?.user?.name ?? "Your Organisation"}
            tier={partner?.sponsorshipTier ?? "Partner"}
            csrStats={csrStats}
            mentors={sponsoredMentors}
            upcomingEvents={upcomingEvents}
        />
    );
}
