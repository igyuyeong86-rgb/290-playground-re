import type { Metadata } from 'next';
import './base.css';
export const metadata: Metadata = { title: '포트폴리오 블로그', description: '', icons:{icon:'/favicon.svg'} };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ko"><body>{children}</body></html>}
