import { getSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { fetchProducts } from "@/lib/sanity/queries";
import { getMerchandiseMap } from "@/lib/actions/merchandise";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import InventoryStockEditor from "@/components/dashboard/moderator/InventoryStockEditor";

export default async function ModeratorInventoryPage() {
    const session = await getSession();
    if (!session || !["Moderator", "SuperAdmin"].includes((session.user as any).role)) {
        redirect("/login");
    }

    const [products, stockMap] = await Promise.all([
        fetchProducts(),
        getMerchandiseMap(),
    ]);

    return (
        <div className="flex-1 p-8 lg:p-12 min-h-screen" style={{ background: "var(--surface-1)" }}>
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-display-md text-foreground mb-2">Inventory management</h1>
                    <p className="text-body-sm text-foreground-muted">
                        Set stock counts and visibility for store products. Edit product details in Sanity Studio.
                    </p>
                </div>
                <Link
                    href="/dashboard/moderator/studio/structure/product"
                    className="inline-flex items-center h-11 rounded-md px-5 text-label font-medium transition-opacity hover:opacity-90"
                    style={{ background: "var(--brand-red)", color: "var(--brand-red-fg)" }}
                >
                    Add / edit products
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.length === 0 ? (
                    <div
                        className="col-span-full py-12 text-center rounded-lg border border-border bg-background"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                        <p className="text-body-sm text-foreground-muted">No products found in inventory.</p>
                        <p className="text-body-sm text-foreground-subtle mt-2">
                            Click &quot;Add / edit products&quot; to create some.
                        </p>
                    </div>
                ) : (
                    products.map((product: any) => {
                        const dbRecord = stockMap?.[product._id];
                        const initialStock = dbRecord?.stockCount ?? 0;
                        const initialActive = dbRecord?.isActive ?? true;

                        return (
                            <Card
                                key={product._id}
                                className="overflow-hidden bg-background border border-border rounded-lg flex flex-col"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <CardHeader className="p-0 h-48 relative overflow-hidden" style={{ background: "var(--surface-1)" }}>
                                    {product.mainImage?.asset?.url ? (
                                        <img
                                            src={product.mainImage.asset.url}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-foreground-subtle text-body-sm">
                                            No image
                                        </div>
                                    )}
                                    <div
                                        className="absolute top-2 right-2 px-2 py-1 text-eyebrow rounded"
                                        style={{
                                            background: "var(--background)",
                                            color: initialStock === 0 ? "var(--brand-red)" : initialStock <= 5 ? "#b45309" : "var(--brand-green)",
                                            boxShadow: "var(--shadow-sm)",
                                        }}
                                    >
                                        {initialStock === 0 ? "Out of stock" : `${initialStock} in stock`}
                                    </div>
                                    {!initialActive && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="text-eyebrow text-white bg-black/60 px-3 py-1 rounded">Inactive</span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="p-4 flex-1">
                                    <p className="text-eyebrow mb-1" style={{ color: "var(--brand-red)" }}>
                                        {product.category || "Uncategorized"}
                                    </p>
                                    <h3 className="text-headline text-foreground mb-2 line-clamp-1">
                                        {product.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-headline text-foreground">
                                            KES {product.price?.toLocaleString() ?? 0}
                                        </span>
                                        {product.discountPrice && (
                                            <span className="text-body-sm text-foreground-subtle line-through">
                                                KES {product.discountPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                                <InventoryStockEditor
                                    sanityProductId={product._id}
                                    name={product.title}
                                    price={product.price ?? 0}
                                    initialStock={initialStock}
                                    initialActive={initialActive}
                                />
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
