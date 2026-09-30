import type { Metadata } from 'next';
import PosterTool from './PosterTool';
export const metadata: Metadata = { title: 'Poster tool | Future Storytelling Lab', description: 'Create particle posters and social artwork.' };
export default function ToolPage() { return <PosterTool />; }
