import { getStorefrontMerchandise } from "@/lib/actions/merchandise";
import ShopClient from "@/components/marketing/ShopClient";

export const metadata = {
    title: "Store - Jenga365",
    description: "Shop Jenga365 merchandise to support our impact fund.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage() {
    const products = await getStorefrontMerchandise();
    return <ShopClient initialProducts={products} />;
}
