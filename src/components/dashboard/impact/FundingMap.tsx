"use client"

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getFundingMapData } from "@/lib/actions/fundingMap";

// Fix Leaflet marker icon issue in Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
    filters: any;
    role: string;
}

export default function FundingMap({ filters, role }: Props) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const geojson = await getFundingMapData({
                    timeFilter: filters.timeFilter || "all",
                    layers: filters.layers || ["funding", "trees"]
                });
                setData(geojson);
            } catch (err) {
                console.error("Failed to fetch map data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [filters]);

    const center: [number, number] = [0.0236, 37.9062]; // Kenya center

    return (
        <div className="w-full h-full">
            <MapContainer
                center={center}
                zoom={7}
                className="w-full h-full"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ZoomControl position="topright" />

                {data?.features.map((f: any) => (
                    <Marker
                        key={f.properties.id}
                        position={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
                    >
                        <Popup>
                            <div className="p-2 space-y-2">
                                <span
                                    className="text-eyebrow"
                                    style={{ color: "var(--brand-green)" }}
                                >
                                    {f.properties.projectType.replace("_", " ")}
                                </span>
                                <h4 className="text-label text-foreground leading-tight">
                                    {f.properties.name}
                                </h4>
                                <p className="text-body-sm text-foreground-muted">
                                    {f.properties.description}
                                </p>
                                <div className="pt-2 border-t border-border flex justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-eyebrow text-foreground-muted">Funded</p>
                                        <p className="text-label text-foreground">KES {f.properties.amount}</p>
                                    </div>
                                    <div className="space-y-0.5 text-right">
                                        <p className="text-eyebrow text-foreground-muted">Reached</p>
                                        <p className="text-label text-foreground">{f.properties.youthReached} Youth</p>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
