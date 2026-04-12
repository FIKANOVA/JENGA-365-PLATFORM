import { fetchProducts } from "@/lib/sanity/queries";
import ShopClient from "@/components/marketing/ShopClient";

export const metadata = {
    title: "Store - Jenga365",
    description: "Shop Jenga365 merchandise to support our impact fund.",
};

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function ShopPage() {
    const products = await fetchProducts();

    return <ShopClient initialProducts={products} />;
}
