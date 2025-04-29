import { unstable_noStore as noStore } from 'next/cache';

export async function fetchGitHubUser() {
  // Add noStore() here to prevent the response from being cached.
  // noStore();
  // This is equivalent to in fetch(..., {cache: 'no-store'}).

  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching github from /api/hello data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const res = await fetch('/api/hello');
    const data = await res.json();

    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch github from /api/hello data.');
  }
}
