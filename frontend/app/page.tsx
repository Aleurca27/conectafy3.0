import { redirect } from 'next/navigation';

export default function Home() {
  // Redireccionar a dashboard
  redirect('/dashboard');
}

