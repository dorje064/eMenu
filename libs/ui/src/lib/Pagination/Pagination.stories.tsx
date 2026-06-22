import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './Pagination';
import type { PageSizeOption } from './Pagination';

const TOTAL_ITEMS = 312;

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Pagination>;

/** Numbered pagination over 312 orders at 25 per page (13 pages). */
export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize: PageSizeOption = 25;
    return (
      <Pagination
        page={page}
        pageCount={Math.ceil(TOTAL_ITEMS / pageSize)}
        onPageChange={setPage}
        pageSize={pageSize}
        totalItems={TOTAL_ITEMS}
      />
    );
  },
};

/** Middle page shows truncation on both sides: 1 … 4 5 6 … 13. */
export const MiddlePageTruncation: Story = {
  render: () => {
    const [page, setPage] = useState(6);
    return (
      <Pagination
        page={page}
        pageCount={13}
        onPageChange={setPage}
        pageSize={25}
        totalItems={TOTAL_ITEMS}
      />
    );
  },
};

/** With a page-size selector that resets to page 1 on change. */
export const WithPageSizeSelector: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<PageSizeOption>(25);
    return (
      <Pagination
        page={page}
        pageCount={Math.ceil(TOTAL_ITEMS / pageSize)}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        totalItems={TOTAL_ITEMS}
      />
    );
  },
};

/** Prev/First disabled on the first page. */
export const FirstPage: Story = {
  render: () => (
    <Pagination
      page={1}
      pageCount={13}
      onPageChange={() => undefined}
      pageSize={25}
      totalItems={TOTAL_ITEMS}
    />
  ),
};

/** Next/Last disabled on the final page. */
export const LastPage: Story = {
  render: () => (
    <Pagination
      page={13}
      pageCount={13}
      onPageChange={() => undefined}
      pageSize={25}
      totalItems={TOTAL_ITEMS}
    />
  ),
};

/** Few pages — no truncation, no edge dots. */
export const FewPages: Story = {
  render: () => {
    const [page, setPage] = useState(2);
    return (
      <Pagination
        page={page}
        pageCount={4}
        onPageChange={setPage}
        pageSize={25}
        totalItems={92}
      />
    );
  },
};
