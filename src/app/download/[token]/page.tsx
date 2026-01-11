import { redirect } from 'next/navigation';

interface DownloadPageProps {
  params: Promise<{ token: string }>;
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { token } = await params;

  // Redirect to API endpoint that handles the download with proper Cloudflare bindings access
  // The API route has direct access to D1 and R2 bindings
  redirect(`/api/downloads/${token}`);
}
