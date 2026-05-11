import { LucideIcon } from "lucide-react";

export type FeatureCardProps = {
    icon: LucideIcon;
    title: string;
    description: string;
};

export type FaqItemProps = {
    id: number;
    question: string;
    answer: string;
}

export type HowItsWorkProps = {
    no: number;
    title: string;
    description: string;
}