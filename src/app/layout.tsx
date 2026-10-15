import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Student OS · Không gian của bạn', template: '%s | Student OS' }, description: 'Sắp xếp việc học, dành thời gian tập trung và nhìn thấy từng bước tiến của bạn.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="vi"><body>{children}</body></html>; }
