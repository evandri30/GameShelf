import type { FaqItemProps } from '@/types';

export const faqData: FaqItemProps[] = [
    {
        id: 1,
        question: "What is GameShelf?",
        answer:
            "A personal game tracker. Find games, put them on your shelf as planned, playing, completed or dropped, and log your hours, rating and notes as you go."
    },
    {
        id: 2,
        question: "Is it free?",
        answer:
            "Yes. You only need a free account so your shelf is saved. It works in any browser, on desktop and on your phone."
    },
    {
        id: 3,
        question: "Can friends see my shelf?",
        answer:
            "Only if you want them to. Turn on your public profile in Stats and you get your own link with your shelf, stats and lists. Your notes always stay private."
    },
    {
        id: 4,
        question: "Where do the games come from?",
        answer:
            "Game info and cover art come from RAWG, a database of over 900,000 games across every platform."
    },
    {
        id: 5,
        question: "Can I take my data with me?",
        answer:
            "Yes. On the Stats page you can download your whole shelf as a CSV or JSON file at any time."
    }
];
