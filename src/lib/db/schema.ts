import {
    pgTable,
    uuid,
    text,
    timestamp,
    varchar,
    integer,
    boolean,
    jsonb,
    vector,
    pgEnum,
    decimal,
    index,
    uniqueIndex,
    check,
    pgView,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", [
    "SuperAdmin",
    "Moderator",
    "CorporatePartner",
    "Mentor",
    "Mentee",
    "user",
]);

export const mentorStatusEnum = pgEnum("mentor_status", [
    "pending",
    "active",
    "suspended",
    "declined"
]);

export const mentorshipStatusEnum = pgEnum("mentorship_status", [
    "pending",
    "active",
    "completed",
    "declined",
]);

export const eventTypeEnum = pgEnum("event_type", ["Webinar", "Clinic"]);

export const articleStatusEnum = pgEnum("article_status", [
    "draft",
    "in_review",
    "published",
    "rejected",
    "unpublished"
]);

export const articleCategoryEnum = pgEnum("article_category", [
    "Rugby",
    "Mentorship",
    "Education",
    "Business",
    "Impact",
    "Community",
    "Wellness"
]);

export const badgeTypeEnum = pgEnum("badge_type", [
    "Supporter",
    "Verified",
    "TopMentor",
]);

export const orderStatusEnum = pgEnum("order_status", [
    "pending",
    "paid",
    "shipped",
    "cancelled",
    "refunded"
]);

export const projectTypeEnum = pgEnum("project_type", [
    "clinic",
    "webinar",
    "tree_planting",
    "mentorship_hub",
    "corporate_funded",
    "workshop",
]);

export const documentTierEnum = pgEnum("document_tier", ["1", "2", "3"]);

export const documentStatusEnum = pgEnum("document_status", [
    "draft",
    "published",
    "archived"
]);

export const documentAccessActionEnum = pgEnum("document_access_action", [
    "view",
    "download",
    "print_attempt"
]);

export const assetTypeEnum = pgEnum("asset_type", ["CV", "LinkedIn", "Portfolio", "Other"]);

// Tables

export const corporatePartners = pgTable("corporate_partners", {
    id: uuid("id").primaryKey().defaultRandom(),
    orgName: varchar("org_name", { length: 255 }).notNull(),
    logoUrl: text("logo_url"),
    contactEmail: varchar("contact_email", { length: 255 }).notNull(),
    sponsorshipTier: varchar("sponsorship_tier", { length: 50 }),
    employeeCount: integer("employee_count").default(0),
    impactTreesPlanted: integer("impact_trees_planted").default(0),
    impactHoursContributed: integer("impact_hours_contributed").default(0),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    guestEmail: varchar("guest_email", { length: 255 }),
    image: text("image"),
    role: userRoleEnum("role").default("Mentee").notNull(),
    isApproved: boolean("is_approved").default(false).notNull(),
    mentorStatus: mentorStatusEnum("mentor_status"),
    locationRegion: varchar("location_region", { length: 255 }),
    embedding: vector("embedding", { dimensions: 768 }),
    embeddingStale: boolean("embedding_stale").default(false).notNull(),
    intakeCompleted: boolean("intake_completed").default(false).notNull(),
    partnerId: uuid("partner_id").references(() => corporatePartners.id, { onDelete: 'set null' }),
    accountCreatedBy: uuid("account_created_by"),
    moderationScope: varchar("moderation_scope", { length: 255 }),
    rejectionReason: text("rejection_reason"),
    reapplyEligibleAt: timestamp("reapply_eligible_at"),
    badgeIds: text("badge_ids").array(),

    // GDPR & Compliance
    consentGivenAt: timestamp("consent_given_at"),
    marketingOptIn: boolean("marketing_opt_in").default(false),
    dataDeletionRequestedAt: timestamp("data_deletion_requested_at"),
    deletedAt: timestamp("deleted_at"),

    // NDA & Compliance
    ndaSigned: boolean("nda_signed").default(false).notNull(),
    ndaVersion: varchar("nda_version", { length: 50 }),
    ndaSignedAt: timestamp("nda_signed_at"),
    onboarded: boolean("onboarded").default(false).notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
    status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, active, suspended
    isMentorVerified: boolean("is_mentor_verified").default(false),
    // Role-specific registration data (meetingPreference, orgType, contributionType, etc.)
    metadata: jsonb("metadata").$type<Record<string, string>>(),
    // Mentor specialisation tags used for goal-alignment matching (e.g. ['entrepreneur','finance'])
    mentorSpecialisations: text("mentor_specialisations").array(),
    banned: boolean("banned").default(false).notNull(),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
    embeddingIdx: index("embedding_idx").using("ivfflat", table.embedding.op("vector_cosine_ops"))
}));

export const ndaDocuments = pgTable("nda_documents", {
    id: uuid("id").primaryKey().defaultRandom(),
    version: varchar("version", { length: 50 }).notNull().unique(),
    content: text("content").notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: 'set null' }),
});

export const ndaSignatures = pgTable("nda_signatures", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    documentVersion: varchar("document_version", { length: 50 }).notNull(),
    sha256Hash: text("sha256_hash").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    signatureName: varchar("signature_name", { length: 255 }).notNull(),
    roleAtSigning: userRoleEnum("role_at_signing").notNull(),
    signedAt: timestamp("signed_at").defaultNow().notNull(),
});

export const mentorshipPairs = pgTable("mentorship_pairs", {
    id: uuid("id").primaryKey().defaultRandom(),
    mentorId: uuid("mentor_id")
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    menteeId: uuid("mentee_id")
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    status: mentorshipStatusEnum("status").default("pending").notNull(),
    matchedAt: timestamp("matched_at").defaultNow().notNull(),
    matchScore: decimal("match_score", { precision: 5, scale: 2 }),
    partnerId: uuid("partner_id").references(() => corporatePartners.id, { onDelete: 'set null' }),
}, (table) => ({
    pairIdx: uniqueIndex("pair_idx").on(table.mentorId, table.menteeId),
}));

export const learningPathways = pgTable("learning_pathways", {
    id: uuid("id").primaryKey().defaultRandom(),
    pairId: uuid("pair_id")
        .references(() => mentorshipPairs.id, { onDelete: 'cascade' })
        .notNull(),
    milestones: jsonb("milestones").default([]).notNull(),
    progress: integer("progress").default(0).notNull(),
    lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const sessionsLog = pgTable("sessions_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    pairId: uuid("pair_id")
        .references(() => mentorshipPairs.id, { onDelete: 'cascade' })
        .notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    notes: text("notes"),
    sessionDate: timestamp("session_date").notNull(),
    loggedBy: uuid("logged_by").references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const donations = pgTable("donations", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'set null' }),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("NGN").notNull(),
    paystackReference: varchar("paystack_reference", { length: 255 }),
    paystackSubscriptionCode: varchar("paystack_subscription_code", { length: 255 }),
    isRecurring: boolean("is_recurring").default(false),
    fundAllocation: varchar("fund_allocation", { length: 100 }),
    donatedAt: timestamp("donated_at").defaultNow().notNull(),
});

export const merchandise = pgTable("merchandise", {
    id: uuid("id").primaryKey().defaultRandom(),
    sanityProductId: varchar("sanity_product_id", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    stockCount: integer("stock_count").default(0).notNull(),
    imageUrl: text("image_url"),
    category: varchar("category", { length: 100 }),
    isActive: boolean("is_active").default(true).notNull(),
});

export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'set null' }),
    guestEmail: varchar("guest_email", { length: 255 }),
    paystackReference: varchar("paystack_reference", { length: 255 }),
    status: orderStatusEnum("status").default("pending").notNull(),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
    items: jsonb("items").notNull(),
    impactFundContribution: decimal("impact_fund_contribution", { precision: 12, scale: 2 }),
    orderedAt: timestamp("ordered_at").defaultNow().notNull(),
});

export const userBadges = pgTable("user_badges", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    badgeType: badgeTypeEnum("badge_type").notNull(),
    awardedAt: timestamp("awarded_at").defaultNow().notNull(),
    awardedBy: uuid("awarded_by").references(() => users.id, { onDelete: 'set null' }),
});

export const events = pgTable("events", {
    id: uuid("id").primaryKey().defaultRandom(),
    sanityDocId: varchar("sanity_doc_id", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    type: eventTypeEnum("type").notNull(),
    date: timestamp("date").notNull(),
    location: varchar("location", { length: 255 }),
    isOnline: boolean("is_online").default(false),
    capacity: integer("capacity"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventAttendees = pgTable("event_attendees", {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
        .references(() => events.id, { onDelete: 'cascade' })
        .notNull(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    registeredAt: timestamp("registered_at").defaultNow().notNull(),
    attended: boolean("attended").default(false).notNull(),
});

export const articles = pgTable("articles", {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    coAuthorIds: text("co_author_ids").array(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    excerpt: text("excerpt"),
    bodyPortableText: jsonb("body_portable_text"),
    coverImageUrl: text("cover_image_url"),
    coverImageAlt: text("cover_image_alt"),
    category: articleCategoryEnum("category"),
    tags: text("tags").array(),
    readTimeMinutes: integer("read_time_minutes"),
    wordCount: integer("word_count"),
    status: articleStatusEnum("status").default("draft").notNull(),
    moderatorId: uuid("moderator_id").references(() => users.id, { onDelete: 'set null' }),
    moderatorNote: text("moderator_note"),
    rejectionFeedback: text("rejection_feedback"),
    approvedBy: uuid("approved_by").references(() => users.id, { onDelete: 'set null' }),
    sanityDocId: varchar("sanity_doc_id", { length: 255 }),
    isFeatured: boolean("is_featured").default(false).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    submittedForReviewAt: timestamp("submitted_for_review_at"),
    publishedAt: timestamp("published_at"),
    lastEditedAt: timestamp("last_edited_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});

export const articleSaves = pgTable("article_saves", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    articleId: uuid("article_id").references(() => articles.id, { onDelete: 'cascade' }).notNull(),
    savedAt: timestamp("saved_at").defaultNow().notNull(),
}, (table) => ({
    uniqueUserArticleSave: uniqueIndex("unique_user_article_save_idx").on(table.userId, table.articleId),
}));

export const articleHelpfulVotes = pgTable("article_helpful_votes", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    articleId: uuid("article_id").references(() => articles.id, { onDelete: 'cascade' }).notNull(),
    votedAt: timestamp("voted_at").defaultNow().notNull(),
}, (table) => ({
    uniqueUserArticleVote: uniqueIndex("unique_user_article_vote_idx").on(table.userId, table.articleId),
}));

export const activityLog = pgTable("activity_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    actionType: varchar("action_type", { length: 100 }).notNull(),
    entityId: uuid("entity_id"),
    impactPoints: integer("impact_points").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    activityUserDateIdx: index("activity_user_date_idx").on(table.userId, table.createdAt),
}));

export const moderationLog = pgTable("moderation_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    moderatorId: uuid("moderator_id")
        .references(() => users.id, { onDelete: 'set null' }),
    actionType: varchar("action_type", { length: 100 }).notNull(),
    targetId: uuid("target_id").notNull(),
    targetType: varchar("target_type", { length: 50 }).notNull(),
    requiresCosign: boolean("requires_cosign").default(false),
    notes: text("notes"),
    actionedAt: timestamp("actioned_at").defaultNow().notNull(),
});

export const inviteLinks = pgTable("invite_links", {
    id: uuid("id").primaryKey().defaultRandom(),
    inviterId: uuid("inviter_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    roleAssigned: userRoleEnum("role_assigned").notNull(),
    partnerId: uuid("partner_id").references(() => corporatePartners.id, { onDelete: 'cascade' }),
    inviteeEmail: varchar("invitee_email", { length: 255 }),
    moderationScope: varchar("moderation_scope", { length: 50 }),
    isUsed: boolean("is_used").default(false).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationTypeEnum = pgEnum("notification_type", [
    "nda_signed",
    "user_approved",
    "user_rejected",
    "new_match",
    "match_accepted",
    "match_declined",
    "payment_success",
    "session_reminder",
    "article_approved",
    "article_rejected",
    "general"
]);

export const notifications = pgTable("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    body: text("body").notNull(),
    link: text("link"),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    notifUserIdx: index("notif_user_idx").on(table.userId, table.createdAt),
}));

export const stockNotifications = pgTable("stock_notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    merchandiseId: uuid("merchandise_id").references(() => merchandise.id, { onDelete: 'cascade' }).notNull(),
    isNotified: boolean("is_notified").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const webhookEvents = pgTable("webhook_events", {
    id: uuid("id").primaryKey().defaultRandom(),
    stripeEventId: varchar("stripe_event_id", { length: 255 }).notNull().unique(),
    processedAt: timestamp("processed_at").defaultNow().notNull(),
});

export const impactReports = pgTable("impact_reports", {
    id: uuid("id").primaryKey().defaultRandom(),
    reportPeriod: varchar("report_period", { length: 50 }).notNull(),
    totalMentorshipHours: integer("total_mentorship_hours").default(0),
    totalDonations: decimal("total_donations", { precision: 20, scale: 2 }).default("0"),
    treesPlanted: integer("trees_planted").default(0),
    clinicsHeld: integer("clinics_held").default(0),
    youthEngaged: integer("youth_engaged").default(0),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
});
export const projectLocations = pgTable("project_locations", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
    projectType: projectTypeEnum("project_type").notNull(),
    funderId: uuid("funder_id").references(() => corporatePartners.id, { onDelete: 'set null' }),
    amountFunded: decimal("amount_funded", { precision: 12, scale: 2 }).default("0"),
    youthReached: integer("youth_engaged").default(0), // matched with impactReports column names if needed
    treesPlanted: integer("trees_planted").default(0),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
}, (table) => ({
    geoIdx: index("geo_idx").on(table.latitude, table.longitude),
    typeIdx: index("project_type_idx").on(table.projectType),
    funderIdx: index("funder_idx").on(table.funderId),
}));

export const menteeDocuments = pgTable("mentee_documents", {
    id: uuid("id").primaryKey().defaultRandom(),
    menteeId: uuid("mentee_id")
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    uploadedBy: uuid("uploaded_by")
        .references(() => users.id, { onDelete: 'set null' })
        .notNull(),
    documentName: varchar("document_name", { length: 255 }).notNull(),
    documentUrl: text("document_url").notNull(),
    documentType: varchar("document_type", { length: 50 }), // pdf/docx
    fileSizeBytes: integer("file_size_bytes"),
    isVisibleToMentee: boolean("is_visible_to_mentee").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
}, (table) => ({
    menteeDocsIdx: index("mentee_docs_idx").on(table.menteeId),
}));

export const moodJournal = pgTable("mood_journal", {
    id: uuid("id").primaryKey().defaultRandom(),
    menteeId: uuid("mentee_id")
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    sessionId: uuid("session_id")
        .references(() => sessionsLog.id, { onDelete: 'set null' }),
    moodScore: integer("mood_score").notNull(), // 1-5
    notes: text("notes"),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
}, (table) => ({
    moodMenteeDateIdx: index("mood_mentee_date_idx").on(table.menteeId, table.recordedAt),
}));

export const platformDocuments = pgTable("platform_documents", {
    id: uuid("id").primaryKey().defaultRandom(),
    tier: documentTierEnum("tier").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    version: varchar("version", { length: 20 }).notNull(),
    filename: varchar("filename", { length: 255 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size").notNull(),
    checksum: varchar("checksum", { length: 64 }), // Optional SHA-256
    uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: 'set null' }),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
    publishedAt: timestamp("published_at"),
    status: documentStatusEnum("status").default("draft").notNull(),
    require2fa: boolean("require_2fa").default(false),
    isIndexed: boolean("is_indexed").default(false).notNull(),
});

export const documentChunks = pgTable("document_chunks", {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
        .references(() => platformDocuments.id, { onDelete: 'cascade' })
        .notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 768 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    docIdx: index("doc_idx").on(table.documentId),
    chunkEmbeddingIdx: index("chunk_embedding_idx").using("ivfflat", table.embedding.op("vector_cosine_ops"))
}));

export const documentAccessLogs = pgTable("document_access_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
        .references(() => platformDocuments.id, { onDelete: 'cascade' })
        .notNull(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: 'set null' }),
    action: documentAccessActionEnum("action").notNull(),
    accessedAt: timestamp("accessed_at").defaultNow().notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    success: boolean("success").default(true),
    failureReason: varchar("failure_reason", { length: 255 }),
});

export const userProfileAssets = pgTable("user_profile_assets", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    type: assetTypeEnum("type").notNull(),
    url: text("url"),
    filename: varchar("filename", { length: 255 }),
    contentSummary: text("content_summary"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

export const userChunks = pgTable("user_chunks", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 768 }),
    chunkType: varchar("chunk_type", { length: 50 }), // e.g., "experience", "skill", "education"
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    userChunkIdx: index("user_chunk_idx").on(table.userId),
    userEmbeddingIdx: index("user_chunk_embedding_idx").using("ivfflat", table.embedding.op("vector_cosine_ops"))
}));

// Better Auth Core Tables

export const sessions = pgTable("session", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const verifications = pgTable("verification", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const twoFactors = pgTable("two_factor", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const menteeIntake = pgTable("mentee_intake", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" })
        .unique(),
    academicStanding: text("academic_standing").notNull(),
    careerTags: text("career_tags").array().notNull(),
    careerFreeText: text("career_free_text"),
    supportTypes: text("support_types").array().notNull(),
    preferredMentorshipStyle: text("preferred_mentorship_style").notNull(),
    // Goal categories used for goal-alignment matching (e.g. ['entrepreneurship','career_change'])
    goalCategories: text("goal_categories").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
    check("academic_standing_check",
        sql`${t.academicStanding} IN ('Good', 'Probation', 'Honors')`),
    check("career_tags_length_check",
        sql`cardinality(${t.careerTags}) BETWEEN 1 AND 3`),
    check("career_free_text_length_check",
        sql`${t.careerFreeText} IS NULL OR char_length(${t.careerFreeText}) <= 280`),
    check("support_types_length_check",
        sql`cardinality(${t.supportTypes}) BETWEEN 1 AND 2`),
    check("mentorship_style_check",
        sql`${t.preferredMentorshipStyle} IN ('Strict', 'Supportive', 'Mixed')`),
]);

export const resilienceAssessments = pgTable("resilience_assessments", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    q1Response: text("q1_response").notNull(),
    q2Response: text("q2_response").notNull(),
    identityResponse: text("identity_response"),
    isBaseline: boolean("is_baseline").default(true).notNull(),
    reassessmentDueDate: timestamp("reassessment_due_date"),
    assessedAt: timestamp("assessed_at").defaultNow().notNull(),
}, (t) => [
    check("score_range_check",
        sql`${t.score} BETWEEN 1 AND 10`),
    check("identity_required_on_reassessment",
        sql`${t.isBaseline} = true OR ${t.identityResponse} IS NOT NULL`),
    index("resilience_user_idx").on(t.userId),
]);

// ─── Sprint B: MEAL Automation Tables ────────────────────────────────────────

/**
 * Tree survival field audits ingested from KoboToolbox webhook.
 * koboSubmissionId is the idempotency key — duplicate POSTs are silently ignored.
 * Schema drives the KoboToolbox form design (not the other way around).
 */
export const treeSurvivalChecks = pgTable("tree_survival_checks", {
    id: uuid("id").primaryKey().defaultRandom(),
    koboSubmissionId: text("kobo_submission_id").notNull().unique(),
    projectLocationId: uuid("project_location_id").references(() => projectLocations.id, { onDelete: "set null" }),
    checkIntervalMonths: integer("check_interval_months").notNull(), // 6 | 12 | 24
    surveyDate: timestamp("survey_date", { withTimezone: true }).notNull(),
    treesPlanted: integer("trees_planted").notNull(),
    treesAlive: integer("trees_alive").notNull(),
    surveyorName: text("surveyor_name"),
    photoUrl: text("photo_url"),
    geoLat: decimal("geo_lat", { precision: 10, scale: 7 }),
    geoLng: decimal("geo_lng", { precision: 10, scale: 7 }),
    rawPayload: jsonb("raw_payload"),  // full KoboToolbox JSON archived for re-derivation
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    surveyDateIdx: index("tree_survey_date_idx").on(table.surveyDate),
    locationIdx: index("tree_location_idx").on(table.projectLocationId),
}));

/**
 * Give-back activity log — simplified (GPS evidence offloaded to KoboToolbox).
 * Three Strikes cron reads activityCompleted per quarter per mentee.
 */
export const giveBackTracking = pgTable("give_back_tracking", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    quarter: text("quarter").notNull(),           // e.g. '2026-Q2'
    activityCompleted: boolean("activity_completed").default(false),
    activityType: text("activity_type"),           // 'tree_planting' | 'book_drive' | etc.
    activityDescription: text("activity_description"),
    strikeCount: integer("strike_count").default(0),
    suspended: boolean("suspended").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    userQuarterIdx: index("give_back_user_quarter_idx").on(table.userId, table.quarter),
}));

/**
 * Corporate partner ESG milestones — unlocked when currentValue >= thresholdValue.
 * milestoneType: 'tree_survival' | 'mentorship_hours' | 'youth_served'
 */
export const corporateUnlockMilestones = pgTable("corporate_unlock_milestones", {
    id: uuid("id").primaryKey().defaultRandom(),
    corporatePartnerId: uuid("corporate_partner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    milestoneType: text("milestone_type").notNull(),
    thresholdValue: integer("threshold_value").notNull(),
    currentValue: integer("current_value").default(0),
    status: text("status").default("LOCKED"),      // 'LOCKED' | 'UNLOCKED'
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedBy: uuid("verified_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Resources that unlock when a milestone is met.
 * resourceType: 'funding' | 'mentorship_slots' | 'equipment'
 */
export const corporateResources = pgTable("corporate_resources", {
    id: uuid("id").primaryKey().defaultRandom(),
    milestoneId: uuid("milestone_id").notNull().references(() => corporateUnlockMilestones.id, { onDelete: "cascade" }),
    resourceType: text("resource_type").notNull(),
    amount: decimal("amount"),
    currency: text("currency").default("KES"),
    status: text("status").default("LOCKED"),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * NGO MOU agreements — NGO partners bypass financial flow entirely.
 */
export const ngoMouAgreements = pgTable("ngo_mou_agreements", {
    id: uuid("id").primaryKey().defaultRandom(),
    partnerId: uuid("partner_id").notNull().references(() => corporatePartners.id, { onDelete: "cascade" }),
    mouDocumentUrl: text("mou_document_url"),
    resourceTypes: text("resource_types").array(),
    signedAt: timestamp("signed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * NGO resource exchange log — no payment reference by design.
 */
export const resourceExchangeLog = pgTable("resource_exchange_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    fromPartnerId: uuid("from_partner_id").notNull(),
    toPartnerId: uuid("to_partner_id").notNull(),
    resourceType: text("resource_type").notNull(),
    quantity: integer("quantity"),
    notes: text("notes"),
    exchangedAt: timestamp("exchanged_at", { withTimezone: true }).defaultNow(),
});

/**
 * Power Hour: individual session logs for mentor commitment tracking.
 */
export const powerHourSessions = pgTable("power_hour_sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    mentorId: uuid("mentor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    menteeId: uuid("mentee_id").references(() => users.id, { onDelete: "set null" }),
    sessionDate: timestamp("session_date", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Monthly mentor commitment rollup — cron writes here; moderators read here.
 */
export const mentorCommitmentTracker = pgTable("mentor_commitment_tracker", {
    id: uuid("id").primaryKey().defaultRandom(),
    mentorId: uuid("mentor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    month: text("month").notNull(),               // '2026-04'
    hoursLogged: integer("hours_logged").default(0),
    status: text("status").default("at_risk"),    // 'met' | 'at_risk' | 'failed'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    mentorMonthIdx: uniqueIndex("mentor_month_idx").on(table.mentorId, table.month),
}));

// ─── Looker Studio Views (read-only — Drizzle pgView) ────────────────────────

/**
 * View 1: Corporate Partner ESG Scorecard
 * Looker reads this to build per-partner dashboards and automated ESG reports.
 */
export const vCorporatePartnerScorecard = pgView("v_corporate_partner_scorecard").as((qb) =>
    qb
        .select({
            corporatePartnerId: corporateUnlockMilestones.corporatePartnerId,
            milestoneType: corporateUnlockMilestones.milestoneType,
            thresholdValue: corporateUnlockMilestones.thresholdValue,
            currentValue: corporateUnlockMilestones.currentValue,
            milestoneStatus: corporateUnlockMilestones.status,
            verifiedAt: corporateUnlockMilestones.verifiedAt,
        })
        .from(corporateUnlockMilestones)
);

/**
 * View 2: Unlocked Resources per Partner
 * Shows which funding/slots/equipment have been released.
 */
export const vUnlockedResources = pgView("v_unlocked_resources").as((qb) =>
    qb
        .select({
            milestoneId: corporateResources.milestoneId,
            corporatePartnerId: corporateUnlockMilestones.corporatePartnerId,
            milestoneType: corporateUnlockMilestones.milestoneType,
            resourceType: corporateResources.resourceType,
            amount: corporateResources.amount,
            currency: corporateResources.currency,
            resourceStatus: corporateResources.status,
            unlockedAt: corporateResources.unlockedAt,
        })
        .from(corporateResources)
        .innerJoin(corporateUnlockMilestones, sql`${corporateResources.milestoneId} = ${corporateUnlockMilestones.id}`)
);

/**
 * View 3: Tree Survival Time-Series (The Green Game)
 * One row per field audit submission — Looker plots 6/12/24-month trend lines.
 */
export const vTreeSurvivalTimeSeries = pgView("v_tree_survival_time_series").as((qb) =>
    qb
        .select({
            id: treeSurvivalChecks.id,
            projectLocationId: treeSurvivalChecks.projectLocationId,
            checkIntervalMonths: treeSurvivalChecks.checkIntervalMonths,
            surveyDate: treeSurvivalChecks.surveyDate,
            treesPlanted: treeSurvivalChecks.treesPlanted,
            treesAlive: treeSurvivalChecks.treesAlive,
            survivalRate: sql<number>`round(${treeSurvivalChecks.treesAlive}::numeric / nullif(${treeSurvivalChecks.treesPlanted}, 0) * 100, 1)`.as('survival_rate'),
            surveyorName: treeSurvivalChecks.surveyorName,
            geoLat: treeSurvivalChecks.geoLat,
            geoLng: treeSurvivalChecks.geoLng,
        })
        .from(treeSurvivalChecks)
);
