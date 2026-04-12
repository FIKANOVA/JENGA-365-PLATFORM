import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MenteeRequestPanel() {
    const requests = [
        { id: "1", name: "Sarah Johnson", goal: "Full-stack development architecture", match: "94%" },
        { id: "2", name: "Liam Smith", goal: "Career transition to AI engineering", match: "88%" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-outfit">Pending Mentee Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {requests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
                        <div className="flex items-center space-x-4">
                            <Avatar>
                                <AvatarFallback>{req.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-sm">{req.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{req.goal}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-primary mr-2">{req.match} Match</span>
                            <Button size="sm" variant="outline">Decline</Button>
                            <Button size="sm">Accept</Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
