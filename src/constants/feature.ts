import { Compass, ListChecks, Share2 } from "lucide-react";
import type { FeatureCardProps } from "@/types";

export const features: FeatureCardProps[] = [
    {
        icon: Compass,
        title: "Discover",
        description: "Browse hundreds of thousands of games, from this year's hits to every Game of the Year winner.",
    },
    {
        icon: ListChecks,
        title: "Track",
        description: "Mark games as planned, playing, completed or dropped, then log your hours, rating and notes.",
    },
    {
        icon: Share2,
        title: "Share",
        description: "Turn your shelf into stats and share your gaming dashboard with friends.",
    },
];
