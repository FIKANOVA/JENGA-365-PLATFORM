"use client";

import { Resource } from "@/data/mockData";
import ResourceCard from "./ResourceCard";

interface ResourcesGridProps {
    readonly resources: Resource[];
}

export default function ResourcesGrid({ resources }: ResourcesGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
                <ResourceCard
                    key={resource.id}
                    {...resource}
                />
            ))}
        </div>
    );
}
