/** Manage Files / pipeline constants. */

/** UI model label → provider value expected by POST /extract. */
export const PROVIDER_MAP = {
    vllm : "vllm",
    gemini: 'google-gemini',
    gpt: 'openai',
    claude: 'claude',
    qwen: 'google-gemini',
    mistral: 'google-gemini',
};

/** Selectable LLM labels for the extraction step. */
export const LLM_OPTIONS = ['vllm', 'gemini', 'gpt', 'claude', 'qwen', 'mistral'];

/** Poll cadence (ms) for OCR + extract job status. */
export const POLL_INTERVAL = 2500;
