import { redirect } from 'next/navigation';

import OverViewPage from './(main)/_components/overview-page';

export const metadata = {
  title: 'Dashboard : Overview'
};

export default function page() {
  return <OverViewPage />;
}
