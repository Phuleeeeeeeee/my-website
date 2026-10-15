import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { AuthForm } from '@/components/student/auth-form';
export default async function LoginPage() { if(await currentUser()) redirect('/overview'); return <AuthForm/>; }
