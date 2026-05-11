'use client';

import { motion } from "framer-motion";
import type { FeatureCardProps } from '@/types'

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <motion.div
            whileHover={{ y: -6 }}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6
                 flex flex-col items-center text-center gap-4
                 transition hover:bg-zinc-900"
        >
            <div className="w-14 h-14 flex items-center justify-center rounded-lg
                      bg-zinc-800 group-hover:bg-zinc-700 transition">
                <Icon className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-zinc-400">{description}</p>
        </motion.div>
    );
}
