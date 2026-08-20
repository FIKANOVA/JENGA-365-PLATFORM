import { Metadata } from "next";
import { fetchSiteSettings } from "@/lib/sanity/queries";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
    title: "Contact Jenga365 | Connect With Us",
    description: "Get in touch with the Jenga365 team for mentorship inquiries, corporate partnerships, or community engagement.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContactPage() {
    const settings = await fetchSiteSettings();
    const faqItems = settings?.faqItems && settings.faqItems.length > 0
        ? settings.faqItems.map((item: { question?: string; answer?: string }) => ({
            question: item.question ?? "",
            answer: item.answer ?? "",
        })).filter((item: { question: string; answer: string }) => item.question.length > 0)
        : [];

    return <ContactClient faqItems={faqItems} />;
}
