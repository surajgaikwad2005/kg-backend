/**
 * custom/customService.js
 * AI code-suggestion streaming for Model Studio's Custom tab.
 * No React state — call this from hooks or components.
 *
 * All network goes through `apiClient` (no bare `fetch`). This endpoint
 * returns an SSE / event-stream, so it uses `apiClient.raw` (the documented
 * streaming escape hatch) instead of `apiClient.post`.
 */
import { apiClient } from '../../apiClient';

export async function streamCodeSuggestion({ code, suffix, language = 'python', instruction = '' }) {
    // /api/model-studio/ai-suggestion — POST, proxies to DOMAIN_CONFIGURATION "/suggest"
    // and streams the SSE body back. This previously pointed at
    // /api/model-studio/custom, which has no route handler: the 404 made
    // `response.ok` false and the function returned '' silently, so editor
    // autocomplete looked "working but never suggesting" with nothing in the UI.
    const response = await apiClient.raw('/api/model-studio/ai-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, suffix, language, instruction }),
    });
    if (!response.ok) return '';
    const reader = response.body?.getReader();
    if (!reader) return '';
    let fullCompletion = '';
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
                const jsonStr = line.replace('data: ', '').trim();
                if (jsonStr === '[DONE]') break;
                try {
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.text) fullCompletion += parsed.text;
                } catch (_) { /* ignore parse errors */ }
            }
        }
    }
    return fullCompletion;
}
