import { notFound } from 'next/navigation';
import { WorkspacePage } from '@/components/student/workspace-page';
export default async function Page({params}:{params:Promise<{view:string}>}) {
  const {view}=await params;
  if(!['overview','today','calendar','projects','study','focus','progress','settings'].includes(view)) notFound();
  return <WorkspacePage view={view}/>;
}
