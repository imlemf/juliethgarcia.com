import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, redirect }) => {
  return redirect(`/api/downloads/${params.token}`, 302);
};
