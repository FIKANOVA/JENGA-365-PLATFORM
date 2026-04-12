export default function DashboardLoading() {
    return (
        <div className="flex-1 p-8 space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 bg-muted rounded-lg" />
                ))}
            </div>
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-40 bg-muted rounded-lg" />
        </div>
    );
}
