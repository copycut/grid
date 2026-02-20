'use client'

import { Card, Skeleton } from 'antd'
import { ProjectFilled } from '@ant-design/icons'

function NavBarSkeleton() {
  return (
    <header className="bg-white/70 dark:bg-neutral-900/70 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:py-4">
        <div className="flex items-center text-primary">
          <ProjectFilled className="text-2xl" />
          <div className="text-2xl font-bold pl-2 text-gray-700 dark:text-white">Grid</div>
        </div>
        <Skeleton.Avatar active size="default" />
      </div>
    </header>
  )
}

function TopCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6 pb-6 sm:pb-8">
      {/* Mobile: compact rows */}
      {[0, 1, 2, 3].map((i) => (
        <div key={`mobile-${i}`} className="sm:hidden flex items-center gap-4">
          <Skeleton.Avatar active size="default" shape="square" />
          <Skeleton.Input active size="small" style={{ width: 140 }} />
        </div>
      ))}
      {/* Desktop: card layout */}
      {[0, 1, 2, 3].map((i) => (
        <Card key={`desktop-${i}`} className="hidden sm:block">
          <div className="pt-1">
            <Skeleton active title={{ width: 100 }} paragraph={false} />
            <div className="flex items-center justify-between pt-2">
              <Skeleton.Input active size="default" />
              <Skeleton.Avatar active size="large" shape="square" style={{ borderRadius: 10 }} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col space-y-2 pb-4">
        <Skeleton.Input active size="default" style={{ width: 140 }} />
        <Skeleton.Input active size="small" style={{ width: 260 }} />
      </div>
      <div className="flex items-center space-x-2 pb-4">
        <Skeleton.Input active size="default" style={{ width: 180 }} />
        <Skeleton.Button active size="default" style={{ width: 130 }} />
      </div>
    </div>
  )
}

function BoardGridItemSkeleton() {
  return (
    <Card
      className="flex flex-col"
      title={
        <div className="flex items-center gap-2">
          <Skeleton.Button active size="small" shape="circle" />
          <Skeleton.Input active size="small" />
        </div>
      }
      extra={
        <div className="flex items-center gap-2">
          <Skeleton.Avatar active size="small" shape="circle" />
          <Skeleton.Button active size="small" shape="circle" />
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton.Input active size="small" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton.Input active size="small" />
        </div>
      </div>
    </Card>
  )
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <NavBarSkeleton />

      <main className="px-4 py-6 sm:py-8">
        <div className="pb-6 sm:pb-8">
          <Skeleton.Input active size="large" style={{ width: 320, height: 32 }} />
          <div className="pt-2">
            <Skeleton.Input active size="small" style={{ width: 280 }} />
          </div>
        </div>

        <TopCardsSkeleton />

        <div className="pb-6 sm:pb-8">
          <FiltersSkeleton />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <BoardGridItemSkeleton key={i} />
            ))}
            {/* Create board placeholder */}
            <div className="flex flex-col items-center justify-center border-2 rounded-2xl border-dashed border-gray-200 dark:border-gray-700 p-6">
              <Skeleton.Avatar active size="large" shape="circle" />
              <div className="pt-2">
                <Skeleton.Input active size="small" style={{ width: 90 }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
