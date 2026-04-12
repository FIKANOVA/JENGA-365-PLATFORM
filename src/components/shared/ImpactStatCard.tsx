import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImpactStatCard({ label, value, trend }: { label: string, value: string, trend?: string }) {
    return (
        <Card className="bg-muted/20 border-none">
            <CardHeader className="p-4 pb-1">
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-3xl font-bold font-outfit">{value}</div>
                {trend && <p className="text-[10px] text-primary mt-1 font-medium">{trend}</p>}
            </CardContent>
        </Card>
    );
}
