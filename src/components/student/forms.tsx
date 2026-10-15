'use client';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { categories, dayKey, eventKinds, statuses, type Task, type Project, type CalendarEvent, type Snapshot } from '@/lib/types';
import { Glyph } from './icons';
export type EditorState = {kind:'task';item?:Task;projectId?:string}|{kind:'project';item?:Project}|{kind:'event';item?:CalendarEvent;day?:string}|{kind:'habit'};
export type Mutate = (path:string, method:string, body?:Record<string,unknown>) => Promise<void>;
export function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{ref.current?.showModal();},[]);
  return <dialog ref={ref} className="modal" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal-inner"><header><div><span className="eyebrow">KHÔNG GIAN CỦA BẠN</span><h2>{title}</h2></div><button className="icon-btn" aria-label="Đóng" onClick={onClose}><Glyph name="close"/></button></header>{children}</div></dialog>;
}
const localInput=(value:string)=>{const d=new Date(value);return `${dayKey(d)}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
export function Editor({state,data,mutate,onClose,busy}:{state:EditorState;data:Snapshot;mutate:Mutate;onClose:()=>void;busy:boolean}) {
  const [error,setError]=useState('');
  const item='item'in state?state.item:undefined;
  const name={task:'công việc',project:'dự án',event:'lịch',habit:'thói quen'}[state.kind];
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();setError('');const f=new FormData(e.currentTarget);const raw=Object.fromEntries(f.entries());let b:Record<string,unknown>={...raw};
    try {
      if(state.kind==='task')b={...b,priority:Number(raw.priority),estimate:Number(raw.estimate),project_id:raw.project_id||null,due_date:raw.due_date||null};
      if(state.kind==='project')b={...b,due_date:raw.due_date||null};
      if(state.kind==='event')b={...b,start_at:new Date(String(raw.start_at)).toISOString(),end_at:new Date(String(raw.end_at)).toISOString()};
      const resource={task:'tasks',project:'projects',event:'events',habit:'habits'}[state.kind];
      await mutate(`${resource}${item?'/'+item.id:''}`,item?'PATCH':'POST',b);onClose();
    }catch(e){setError(e instanceof Error?e.message:'Vui lòng kiểm tra thông tin.');}
  }
  return <Modal title={`${item?'Chỉnh sửa':'Thêm'} ${name}`} onClose={onClose}><form onSubmit={submit} className="editor-form">
    {state.kind==='task'&&<><label>Tên công việc <span className="required">*</span><input name="title" required maxLength={120} defaultValue={state.item?.title} placeholder="Bạn muốn hoàn thành điều gì?" autoFocus/></label><div className="form-grid"><label>Trạng thái<select name="status" defaultValue={state.item?.status||'todo'}>{Object.entries(statuses).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>Độ ưu tiên<select name="priority" defaultValue={state.item?.priority||3}>{['Khẩn cấp','Cao','Trung bình','Thấp'].map((v,i)=><option key={v} value={i+1}>P{i+1} · {v}</option>)}</select></label><label>Ngày đến hạn<input type="date" name="due_date" defaultValue={state.item?.due_date||''}/></label><label>Ước lượng (phút)<input name="estimate" type="number" min={5} max={1440} required defaultValue={state.item?.estimate||30}/></label><label>Lĩnh vực<select name="category" defaultValue={state.item?.category||'Học tập'}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Dự án<select name="project_id" defaultValue={state.item?.project_id||state.projectId||''}><option value="">Không thuộc dự án</option>{data.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div><label>Ghi chú<textarea name="notes" rows={3} maxLength={4000} defaultValue={state.item?.notes} placeholder="Ý tưởng, đường dẫn hoặc những bước cần làm…"/></label></>}
    {state.kind==='project'&&<><label>Tên dự án <span className="required">*</span><input name="name" required maxLength={120} autoFocus defaultValue={state.item?.name} placeholder="Đặt tên cho ý tưởng của bạn"/></label><label>Mô tả<textarea name="description" rows={3} maxLength={2000} defaultValue={state.item?.description} placeholder="Bạn muốn đạt được điều gì?"/></label><div className="form-grid"><label>Ngày mục tiêu<input type="date" name="due_date" defaultValue={state.item?.due_date||''}/></label><label>Màu nhận diện<select name="color" defaultValue={state.item?.color||'violet'}><option value="violet">Tím lavender</option><option value="blue">Xanh da trời</option><option value="green">Xanh bạc hà</option><option value="amber">Vàng nắng</option></select></label></div></>}
    {state.kind==='event'&&<><label>Tên lịch <span className="required">*</span><input name="title" autoFocus required maxLength={120} defaultValue={state.item?.title} placeholder="Một khoảng thời gian dành cho…"/></label><div className="form-grid"><label>Bắt đầu<input type="datetime-local" name="start_at" required defaultValue={state.item?localInput(state.item.start_at):`${state.day||dayKey()}T09:00`}/></label><label>Kết thúc<input type="datetime-local" name="end_at" required defaultValue={state.item?localInput(state.item.end_at):`${state.day||dayKey()}T10:00`}/></label><label>Loại lịch<select name="kind" defaultValue={state.item?.kind||'study'}>{Object.entries(eventKinds).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>Địa điểm<input name="location" maxLength={160} defaultValue={state.item?.location} placeholder="Phòng học, đường dẫn họp…"/></label></div><label>Ghi chú<textarea name="notes" maxLength={2000} rows={3} defaultValue={state.item?.notes}/></label><p className="field-hint">Lịch dùng múi giờ của thiết bị. Bạn có thể xem và chỉnh sửa trong Lịch biểu.</p></>}
    {state.kind==='habit'&&<label>Một thói quen nhỏ<input name="title" required autoFocus maxLength={120} placeholder="Ví dụ: Đọc sách 15 phút mỗi ngày"/></label>}
    {error&&<p role="alert" className="form-error">{error}</p>}<footer className="modal-actions"><button type="button" className="secondary" onClick={onClose} disabled={busy}>Hủy</button><button className="primary" disabled={busy}>{busy?'Đang lưu…':`Lưu ${name}`}<Glyph name="check" size={17}/></button></footer>
  </form></Modal>;
}
export function DeleteDialog({title,description,onDelete,onClose,busy}:{title:string;description:string;onDelete:()=>Promise<void>;onClose:()=>void;busy:boolean}) {
  const [error,setError]=useState('');return <Modal title="Xóa mục này?" onClose={onClose}><p className="delete-title">{title}</p><p className="muted">{description}</p>{error&&<p role="alert" className="form-error">{error}</p>}<footer className="modal-actions"><button className="secondary" disabled={busy} onClick={onClose}>Giữ lại</button><button className="danger-button" disabled={busy} onClick={async()=>{try{await onDelete();onClose();}catch(e){setError(e instanceof Error?e.message:'Chưa thể xóa.');}}}>{busy?'Đang xóa…':'Xóa'}<Glyph name="trash" size={16}/></button></footer></Modal>;
}
