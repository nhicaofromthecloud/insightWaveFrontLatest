import { Metadata } from 'next';
import SignInViewPage from '../_components/sigin-view';
import { connectToMongo } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  await connectToMongo();
  return <SignInViewPage />;
}
