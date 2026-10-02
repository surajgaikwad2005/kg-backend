import { redirect } from 'next/navigation';

// Demo build: no authentication. The app has a single feature — the Knowledge
// Graph viewer — so the root path goes straight there.
export default function Home() {
    redirect('/knowledge-graph');
}
