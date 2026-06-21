import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserAvatar({ name, image, light = false }: { name: string, image?: string, light?: boolean }) {
    return (
        <Avatar className={`w-8 h-8 border ${light ? "border-white/20" : "border-border"}`}>
            {image && <AvatarImage src={image} />}
            <AvatarFallback className={light ? "bg-white/90 text-black font-bold text-label" : "bg-primary/10 text-primary font-bold text-label"}>
                {name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
        </Avatar>
    );
}
