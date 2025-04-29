// import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';

export async function fetchGitHubUser() {
  // Add noStore() here to prevent the response from being cached.
  // noStore();
  // This is equivalent to in fetch(..., {cache: 'no-store'}).

  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching github from /api/hello data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const headersList = await headers();

    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http'; // usually 'https' on Vercel
    const path = '/api/hello'; // You don't automatically get the path — you'd have to pass it manually if needed.

    const fullUrl = `${protocol}://${host}${path}`;

    console.log('Full URL:', fullUrl);
    const res = await fetch(fullUrl);
    const data = await res.json();

    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    throw new Error('Failed to fetch github from /api/hello data.');
  }
}
