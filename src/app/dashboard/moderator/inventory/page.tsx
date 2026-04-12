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
        <div className="flex-1 p-8 lg:p-12 bg-[#FAFAF8] min-h-screen">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl text-[#1A1A1A] font-playfair font-black mb-2">
                        Inventory Management
                    </h1>
                    <p className="text-sm text-gray-500 font-lato">
                        Set stock counts and visibility for store products. Edit product details in Sanity Studio.
                    </p>
                </div>
                <Link
                    href="/dashboard/moderator/studio/structure/product"
                    className="bg-[#BB0000] text-white px-6 py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-[#8A0000] transition-colors font-dm-mono"
                >
                    Add / Edit Products
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white border border-gray-100 rounded">
                        <p className="text-gray-500 font-lato">No products found in inventory.</p>
                        <p className="text-sm text-gray-400 mt-2">Click &quot;Add / Edit Products&quot; to create some.</p>
                    </div>
                ) : (
                    products.map((product: any) => {
                        const dbRecord = stockMap[product._id];
                        const initialStock = dbRecord?.stockCount ?? 0;
                        const initialActive = dbRecord?.isActive ?? true;

                        return (
                            <Card key={product._id} className="overflow-hidden bg-white border border-gray-100 rounded shadow-sm flex flex-col">
                                <CardHeader className="p-0 h-48 relative overflow-hidden bg-gray-50">
                                    {product.mainImage?.asset?.url ? (
                                        <img
                                            src={product.mainImage.asset.url}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-mono">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded shadow font-dm-mono">
                                        {product.stockStatus === "inStock" ? "In Stock" : product.stockStatus === "lowStock" ? "Low Stock" : "Out of Stock"}
                                    </div>
                                    {!initialActive && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="font-mono text-white text-[10px] uppercase tracking-widest font-bold bg-black/60 px-3 py-1 rounded">Inactive</span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="p-4 flex-1">
                                    <p className="text-[10px] text-[#BB0000] uppercase tracking-widest font-bold mb-1 font-dm-mono">
                                        {product.category || "Uncategorized"}
                                    </p>
                                    <h3 className="font-bold text-lg leading-tight font-lato text-[#1A1A1A] mb-2 line-clamp-1">
                                        {product.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-[#1A1A1A]">KES {product.price?.toLocaleString() ?? 0}</span>
                                        {product.discountPrice && (
                                            <span className="text-sm text-gray-400 line-through">KES {product.discountPrice.toLocaleString()}</span>
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
