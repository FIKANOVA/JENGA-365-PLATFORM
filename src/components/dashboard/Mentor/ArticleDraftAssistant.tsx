import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ArticleDraftAssistant() {
    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="font-outfit flex items-center justify-between">
                    <span>AI Draft Assistant</span>
                    <Button size="sm" variant="ghost" className="text-xs uppercase tracking-widest opacity-70">New Draft</Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    I've prepared a draft outline based on your expertise in <strong>Full-Stack Architecture</strong>.
                    Would you like me to expand on the "Serverless Performance" section?
                </p>
                <div className="p-4 bg-background border rounded-lg h-32 overflow-y-auto text-sm font-mono opacity-80">
                    1. Introduction to Serverless Scaling\n2. Memory vs Cold-start Optimization\n3. Edge Compute Strategies for SaaS\n...
                </div>
                <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">Expand Detail</Button>
                    <Button size="sm" variant="outline" className="flex-1">Finalize to Sanity</Button>
                </div>
            </CardContent>
        </Card>
    );
}
