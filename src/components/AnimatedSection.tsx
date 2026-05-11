'use client'

import { motion } from "motion/react"
import { ReactNode } from "react"

type AnimatedSectionProps = {
    children: ReactNode;
    delay?: number;
}

export function FadeIn({ children, delay = 0 }: AnimatedSectionProps) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                duration: 1,
                delay,
                ease: 'easeOut'
            }}
        >
            {children}
        </motion.div>
    )
}

export function ScrollFadeIn({ children, delay = 0 }: AnimatedSectionProps) {
    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
                duration: 1,
                delay,
                ease: "easeOut"
            }}
        >
            {children}
        </motion.div>
    )
}