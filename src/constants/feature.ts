import { Search, FileCheck, Share2 } from "lucide-react";
import type { FeatureCardProps } from "@/types";

export const features: FeatureCardProps[] = [
    {
        icon: Search,
        title: "Discover",
        description: "Find new games tailored to your taste",
    },
    {
        icon: FileCheck,
        title: "Track",
        description: "Keep tabs on your gaming progress",
    },
    {
        icon: Share2,
        title: "Share",
        description: "Share your Shelf to your friend",
    },
];