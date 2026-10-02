export const INITIAL_GREETING = (name) => ({
    id: '1',
    sender: 'bot',
    text: `Hello! I'm PlantGPT, your AI assistant for the Baronia Field BNCPP-B offshore platform. I can help answer questions about the platform's systems, equipment, operating procedures, and technical analyses. How can I assist you today?`,
    timestamp: new Date().toISOString(),
});
export const RECOMMENDED_QUESTIONS = [
    "Analyze WHY Jan and Feb 2025 trips had different failure signatures?",
    "Why does reinjection compressor deteriorate after export compressor trip?",
    "What does vibration data from reinjection compressor NDE tell us about failures?",
    "How do the top 3 failure families (AGC, ADB, ADE) interact?",
    "Why is fuel manifold pressure behavior significant during compressor trips?"
];
export const DRAFT_SESSION_ID = 'new_draft';
