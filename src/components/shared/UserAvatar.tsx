import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserAvatar({ name, image }: { name: string, image?: string }) {
    return (
        <Avatar className="w-8 h-8 border border-border">
            {image && <AvatarImage src={image} />}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                {name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
        </Avatar>
    );
}
