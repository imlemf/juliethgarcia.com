import type { LayoutProps } from '../../types';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout({ children, config, siteName, socialLinks, user }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header config={config} siteName={siteName} user={user} />
      <main className="flex-1">{children}</main>
      <Footer config={config} siteName={siteName} socialLinks={socialLinks} />
    </div>
  );
}
