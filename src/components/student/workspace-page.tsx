import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { Workspace } from './workspace';
export async function WorkspacePage({view}:{view:string}) { const user=await currentUser(); if(!user) redirect('/login'); return <Workspace user={user} view={view}/>; }
