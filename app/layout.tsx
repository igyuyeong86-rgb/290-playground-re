import type { Metadata } from 'next';
import './astral.css';
export const metadata: Metadata = { title: '자기소개', description: '' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ko"><body>{children}</body></html>}
