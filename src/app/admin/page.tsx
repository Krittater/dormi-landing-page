import { redirect } from 'next/navigation';

/** /admin → เข้า dashboard (ฝั่ง client จะเด้งไป login เองถ้ายังไม่มี token) */
export default function AdminIndexPage() {
  redirect('/admin/dashboard');
}
