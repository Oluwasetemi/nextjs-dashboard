import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { fetchGitHubUser } from '@/app/lib/api'
import { Suspense } from 'react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Github',
}

export default async function GitHubPage() {
  const userData = await fetchGitHubUser()

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>GitHub</h1>
      </div>

      <Suspense key={'github'} fallback={<h1>Loading</h1>}>
        <GitHubUserCard user={userData} />
      </Suspense>
      {/* <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div> */}
    </div>
  );
}

function GitHubUserCard({ user }: { user: any }) {
  return (
    <div className="flex flex-col items-center">
      <Image
        src={user.avatar_url}
        alt="Picture of the author"
        width={100}
        height={100}
        priority={true}
        // loading='lazy'
        className="rounded-full"
      />
      <h2 className="text-lg font-bold">{user.login}</h2>
      <p className="text-sm">{user.bio}</p>
    </div>
  );
}
