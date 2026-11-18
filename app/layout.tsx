import type { Metadata } from 'next';
import './base.css';
import './quietfolio.css';
export const metadata: Metadata = { title: 'Portfolio', description: '개인 포트폴리오와 기록', icons:{icon:'/favicon.svg'} };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ko" data-theme="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:'try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}'}}/></head><body>{children}</body></html>}
