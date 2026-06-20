import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
    FileText,
    ShoppingBag,
    BookOpen,
    Calendar,
    HelpCircle,
    Mic,
    Video,
    Briefcase,
    UserCircle,
    Users,
    Settings,
    PenSquare,
    Megaphone,
    ExternalLink,
} from "lucide-react";
import { auth } from "@/lib/auth/config";
import { resolveEffectiveRole, STUDIO_BLOCKED_ROLES, type EffectiveRole } from "@/lib/sanity/roleAccess";

interface ContentCard {
    schema: string;
    label: string;
    description: string;
    Icon: typeof FileText;
    href?: string; // overrides default Studio deep-link
    sameTab?: boolean; // override new-tab behaviour for in-app routes
}

const STUDIO_BASE = "/studio";

const ROLE_CARDS: Record<EffectiveRole, ContentCard[]> = {
    SuperAdmin: [
        { schema: "article",       label: "Articles",        description: "Long-form journal and blog posts",   Icon: PenSquare },
        { schema: "product",       label: "Store products",  description: "Merchandise catalog and pricing",    Icon: ShoppingBag },
        { schema: "resource",      label: "Resources",       description: "Mentorship guides and toolkits",     Icon: BookOpen },
        { schema: "event",         label: "Events",          description: "Webinars, clinics, and meetups",     Icon: Calendar },
        { schema: "helpTopic",     label: "Help center",     description: "Support articles and FAQs",          Icon: HelpCircle },
        { schema: "userManual",    label: "User manuals",    description: "Platform how-to guides",             Icon: FileText },
        { schema: "voices",        label: "Voices",          description: "Success stories from the community", Icon: Megaphone },
        { schema: "video",         label: "Videos",          description: "Video library and embeds",           Icon: Video },
        { schema: "partner",       label: "Partner profiles",description: "Corporate and NGO partner pages",    Icon: Briefcase },
        { schema: "coach",         label: "Coach profiles",  description: "Mentor / coach public pages",        Icon: Users },
        { schema: "author",        label: "Authors",         description: "Article author bios",                Icon: UserCircle },
        { schema: "speaker",       label: "Speakers",        description: "Event speaker profiles",             Icon: Mic },
        { schema: "teamOfficial",  label: "Team officials",  description: "Staff and team page entries",        Icon: Users },
        { schema: "siteSettings",  label: "Site settings",   description: "Global homepage and brand config",   Icon: Settings },
    ],
    Moderator: [
        { schema: "article",   label: "Articles",       description: "Edit and curate published articles",   Icon: PenSquare },
        { schema: "product",   label: "Store products", description: "Update merchandise details and media", Icon: ShoppingBag },
        { schema: "resource",  label: "Resources",      description: "Manage mentorship guides and toolkits",Icon: BookOpen },
        { schema: "event",     label: "Events",         description: "Schedule and edit events",             Icon: Calendar },
        { schema: "helpTopic", label: "Help center",    description: "Maintain help articles",               Icon: HelpCircle },
        { schema: "voices",    label: "Voices",         description: "Curate community stories",             Icon: Megaphone },
        { schema: "video",     label: "Videos",         description: "Manage the video library",             Icon: Video },
    ],
    Mentor: [
        { schema: "article", label: "My articles", description: "Write and submit articles for review", Icon: PenSquare, href: "/dashboard/articles", sameTab: true },
    ],
    Mentee: [
        { schema: "article", label: "My articles", description: "Draft and submit articles for review", Icon: PenSquare, href: "/dashboard/articles", sameTab: true },
    ],
    CorporatePartner: [
        { schema: "partner", label: "Our partner profile", description: "Edit your organisation's public page", Icon: Briefcase },
        { schema: "voices",  label: "Impact stories",      description: "Share your ESG impact stories",        Icon: Megaphone },
    ],
    NGO: [
        { schema: "partner", label: "Our NGO profile", description: "Edit your organisation's public page", Icon: Briefcase },
    ],
};

export default async function ContentPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const effectiveRole = await resolveEffectiveRole(
        session.user.id,
        (session.user as any).role,
    );
    const cards = ROLE_CARDS[effectiveRole];
    const showStudioCta = !STUDIO_BLOCKED_ROLES.includes(effectiveRole);

    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-5xl mx-auto space-y-10">
                <header className="space-y-2">
                    <h1 className="text-display-md text-foreground">Content management</h1>
                    <p className="text-body-sm text-foreground-muted max-w-2xl">
                        Pick what you want to edit. Each card opens that content type in Sanity Studio,
                        where you can create, edit, and publish documents.
                    </p>
                </header>

                {cards.length === 0 ? (
                    <div
                        className="rounded-md border border-dashed border-border p-10 text-center"
                        style={{ background: "var(--surface-1)" }}
                    >
                        <p className="text-body-sm text-foreground-muted">
                            No content surfaces are assigned to your role yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cards.map(({ schema, label, description, Icon, href, sameTab }) => {
                            const linkHref = href ?? `${STUDIO_BASE}/structure/${schema}`;
                            const opensNewTab = !sameTab;
                            return (
                                <Link
                                    key={schema}
                                    href={linkHref}
                                    target={opensNewTab ? "_blank" : undefined}
                                    rel={opensNewTab ? "noopener noreferrer" : undefined}
                                    className="group rounded-md border border-border bg-background p-5 transition-colors hover:border-[color:var(--border-strong,#D4D4D8)] flex flex-col gap-4 min-h-[140px]"
                                    style={{ boxShadow: "var(--shadow-sm)" }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div
                                            className="w-9 h-9 rounded-md flex items-center justify-center"
                                            style={{ background: "var(--surface-2)", color: "var(--brand-green)" }}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        {opensNewTab && (
                                            <ExternalLink className="w-4 h-4 text-foreground-subtle group-hover:text-foreground transition-colors" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-headline text-foreground">{label}</h3>
                                        <p className="text-body-sm text-foreground-muted">{description}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {showStudioCta && (
                    <div
                        className="rounded-md border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        style={{ background: "var(--surface-1)" }}
                    >
                        <div>
                            <p className="text-label text-foreground">Need the full Studio?</p>
                            <p className="text-body-sm text-foreground-muted">
                                Open Sanity Studio with every schema type your role can access.
                            </p>
                        </div>
                        <Link
                            href={STUDIO_BASE}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 h-10 rounded-md px-4 text-label font-medium transition-opacity hover:opacity-90 self-start sm:self-auto"
                            style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                        >
                            Open Studio
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
