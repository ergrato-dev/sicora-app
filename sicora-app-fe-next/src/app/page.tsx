import { redirect } from 'next/navigation';

/**
 * Root page - Redirige al dashboard
 */
export default function HomePage() {
  redirect('/dashboard');
}
