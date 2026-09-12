"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Loader2, Check, Save, Eye } from "lucide-react";
import { updateProfile } from "@/lib/actions/settings";
import AvatarUpload from "@/components/shared/AvatarUpload";

interface ProfileSectionProps {
    userId?: string;
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
}

export default function ProfileSection({
    userId,
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
}: ProfileSectionProps) {
    const [name, setName] = useState(initialName);
    const [imageUrl, setImageUrl] = useState<string | null>(initialImage);
    const [locationRegion, setLocationRegion] = useState(initialLocationRegion);
    const [profession, setProfession] = useState(initialProfession);
    const [bio, setBio] = useState(initialBio);
    const [linkedIn, setLinkedIn] = useState(initialLinkedIn);
    const [x, setX] = useState(initialX);
    const [instagram, setInstagram] = useState(initialInstagram);
    const [youtube, setYoutube] = useState(initialYoutube);
    const [tiktok, setTiktok] = useState(initialTiktok);
    const [website, setWebsite] = useState(initialWebsite);

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    async function handleSaveProfile(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile({
                name,
                locationRegion: locationRegion || undefined,
                profession: profession || undefined,
                bio: bio || undefined,
                linkedIn: linkedIn || undefined,
                x: x || undefined,
                instagram: instagram || undefined,
                youtube: youtube || undefined,
                tiktok: tiktok || undefined,
                website: website || undefined,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="border border-border/50 rounded-md bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-3">
                    <User className="w-5 h-5" style={{ color: "var(--brand-green)" }} />
                    <h2 className="text-headline text-foreground">Profile</h2>
                </div>
                {userId && (
                    <Link
                        href={`/profile/${userId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-border bg-background hover:bg-[color:var(--surface-2)] text-foreground transition-colors"
                    >
                        <Eye className="w-3.5 h-3.5" style={{ color: "var(--brand-green)" }} />
                        <span>View Rendered Profile</span>
                    </Link>
                )}
            </div>

            <div className="pb-4 border-b border-border/50">
                <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
                    Profile Picture
                </label>
                <AvatarUpload
                    currentImageUrl={imageUrl}
                    userName={name || "User"}
                    onAvatarChange={(newUrl) => setImageUrl(newUrl)}
                    size="md"
                />
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        value={initialEmail}
                        disabled
                        className="w-full border border-input bg-muted rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">
                            Profession / Job Title
                        </label>
                        <input
                            type="text"
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            placeholder="e.g. Software Engineer, Rugby Coach"
                            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">
                            Location / Region
                        </label>
                        <input
                            type="text"
                            value={locationRegion}
                            onChange={(e) => setLocationRegion(e.target.value)}
                            placeholder="e.g. Nairobi, Kenya"
                            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                        Bio / Personal Statement
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="A brief introduction about your background, expertise, or goals..."
                        rows={3}
                        className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                        Website / Portfolio URL
                    </label>
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                </div>

                {/* Social Media & Channels */}
                <div className="pt-2 border-t border-border/40 space-y-3">
                    <p className="text-xs font-semibold text-foreground">Social Profiles & Channels</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                                LinkedIn
                            </label>
                            <input
                                type="text"
                                value={linkedIn}
                                onChange={(e) => setLinkedIn(e.target.value)}
                                placeholder="linkedin.com/in/username"
                                className="w-full border border-input bg-background rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                                X (Twitter)
                            </label>
                            <input
                                type="text"
                                value={x}
                                onChange={(e) => setX(e.target.value)}
                                placeholder="@handle or x.com/handle"
                                className="w-full border border-input bg-background rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                                Instagram
                            </label>
                            <input
                                type="text"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder="@username or instagram.com/user"
                                className="w-full border border-input bg-background rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                                YouTube
                            </label>
                            <input
                                type="text"
                                value={youtube}
                                onChange={(e) => setYoutube(e.target.value)}
                                placeholder="@channel or youtube.com/@channel"
                                className="w-full border border-input bg-background rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] text-muted-foreground mb-1">
                                TikTok
                            </label>
                            <input
                                type="text"
                                value={tiktok}
                                onChange={(e) => setTiktok(e.target.value)}
                                placeholder="@handle or tiktok.com/@handle"
                                className="w-full border border-input bg-background rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? "Saved!" : "Save Changes"}
                </button>
            </form>
        </section>
    );
}
