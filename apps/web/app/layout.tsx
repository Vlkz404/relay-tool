import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = { title: 'WhatsApp Control Center', description: 'Operação de Evolution, campanhas e aquecimento.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}

