import { lusitana } from '@/app/ui/fonts';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import Pagination from '@/app/ui/invoices/pagination';
import Table from '@/app/ui/customers/table';
import Search from '@/app/ui/search';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Metadata } from 'next';
import { Suspense } from 'react';
import CustomersTable from '@/app/ui/customers/table';
import { fetchFilteredCustomers } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Customers',
};

async function Page({
  searchParams,
}: {
  searchParams: {
    query?: string;
  };
}) {
  const query = searchParams.query || '';
  // const currentPage = Number(searchParams.page) || 1;

  // const totalPages = 10;

  const customers = await fetchFilteredCustomers(query);

  return (
    <div className="w-full">
      <CustomersTable customers={customers} />
    </div>
  );
}

export default Page;
