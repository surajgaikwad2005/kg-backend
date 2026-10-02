export const accordionVariants = {
    closed: { height: 0, opacity: 0 },
    open:   { height: 'auto', opacity: 1, transition: { height: { duration: 0.32, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2, delay: 0.08 } } },
    exit:   { height: 0, opacity: 0, transition: { height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.15 } } },
};

export const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const itemVariants = {
    hidden:  { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
};

export const logVariants = {
    hidden:  { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};
