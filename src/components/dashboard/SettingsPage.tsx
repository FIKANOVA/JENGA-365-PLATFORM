"use client";

import ProfileSection from "./settings/ProfileSection";
import TwoFactorSection from "./settings/TwoFactorSection";
import AuthorProfileSection from "./settings/AuthorProfileSection";
import DataExportSection from "./settings/DataExportSection";
import DangerZoneSection from "./settings/DangerZoneSection";

interface SettingsPageProps {
    userId?: string;
    role?: string;
    initialName?: string;
    initialEmail?: string;
    initialImage?: string | null;
    initialLocationRegion?: string;
    initialProfession?: string;
    initialBio?: string;
    initialLinkedIn?: string;
    initialX?: string;
    initialInstagram?: string;
    initialYoutube?: string;
    initialTiktok?: string;
    initialWebsite?: string;
    twoFactorEnabled?: boolean;
}

export default function SettingsPage({
    userId,
    role = "Mentee",
    initialName = "",
    initialEmail = "",
    initialImage = null,
    initialLocationRegion = "",
    initialProfession = "",
    initialBio = "",
    initialLinkedIn = "",
    initialX = "",
    initialInstagram = "",
    initialYoutube = "",
    initialTiktok = "",
    initialWebsite = "",
    twoFactorEnabled = false,
}: SettingsPageProps) {
    return (
        <div className="flex-1 bg-background h-full overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6 md:p-10 space-y-10">
                <div>
                    <h1 className="text-display-md text-foreground mb-1">Account settings</h1>
                    <p className="text-body-sm text-foreground-muted">Manage your profile and security preferences.</p>
                </div>

                <ProfileSection
                    userId={userId}
                    initialName={initialName}
                    initialEmail={initialEmail}
                    initialImage={initialImage}
                    initialLocationRegion={initialLocationRegion}
                    initialProfession={initialProfession}
                    initialBio={initialBio}
                    initialLinkedIn={initialLinkedIn}
                    initialX={initialX}
                    initialInstagram={initialInstagram}
                    initialYoutube={initialYoutube}
                    initialTiktok={initialTiktok}
                    initialWebsite={initialWebsite}
                />

                <TwoFactorSection twoFactorEnabled={twoFactorEnabled} />

                <AuthorProfileSection />

                <DataExportSection />

                <DangerZoneSection />
            </div>
        </div>
    );
}
