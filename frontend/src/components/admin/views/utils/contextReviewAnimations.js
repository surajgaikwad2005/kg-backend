export const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const fadeUp = {
    hidden:  { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.4, 0, 0.2, 1] } },
};
