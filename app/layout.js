import './globals.css';
import PWARegister from '@/components/PWARegister';
export const metadata={title:'OrderHub',description:'Google Sheets connected order management dashboard',manifest:'/manifest.webmanifest',themeColor:'#101827',icons:{icon:'/icons/icon-192.png',apple:'/icons/icon-192.png'}};
export const viewport={width:'device-width',initialScale:1,maximumScale:1};
export default function RootLayout({children}){return <html lang="en"><body>{children}<PWARegister/></body></html>}
