'use client'

import { Skeleton } from 'antd'
import { ArrowLeftOutlined, ProjectFilled } from '@ant-design/icons'

function NavBarSkeleton() {
  return (
    <header className="bg-white/70 dark:bg-neutral-900/70 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2">
          <ArrowLeftOutlined className="text-lg text-gray-300 dark:text-gray-600" />
          <span className="hidden sm:inline text-sm text-gray-300 dark:text-gray-600">Back to dashboard</span>
          <ProjectFilled className="text-2xl text-gray-300 dark:text-gray-600 ml-2" />
          <Skeleton.Input active size="small" style={{ width: 160 }} />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton.Button active size="small" shape="default" style={{ width: 70 }} />
          <Skeleton.Avatar active size="default" />
        </div>
      </div>
    </header>
  )
}

function BoardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2 pb-6 px-4">
      <div className="flex items-center gap-4">
        <Skeleton.Input active size="small" style={{ width: 120 }} />
      </div>
      <Skeleton.Button active size="default" style={{ width: 110 }} />
    </div>
  )
}

const cardWidths = [140, 160, 120, 155, 135, 150, 145, 130]

function ColumnSkeleton({ cardCount }: { cardCount: number }) {
  return (
    <div className="w-full lg:shrink-0 lg:w-80 pt-1">
      <div className="bg-white/90 dark:bg-black/60 rounded-2xl shadow-sm border border-gray-300 dark:border-gray-700">
        {/* Column header */}
        <div className="p-3 sm:p-4 border-b border-b-gray-300 dark:border-b-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton.Input active size="small" style={{ width: 100 }} />
              <Skeleton.Button active size="small" shape="round" style={{ width: 28, minWidth: 28 }} />
            </div>
            <Skeleton.Button active size="small" shape="circle" style={{ width: 32, minWidth: 32 }} />
          </div>
        </div>

        {/* Card skeletons */}
        <div className="p-2 space-y-3">
          {new Array(cardCount).fill(0).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-300 dark:border-neutral-700 py-2 px-3"
            >
              <div className="flex items-center justify-between gap-2">
                <Skeleton.Input active size="small" style={{ width: cardWidths[index % cardWidths.length] }} />
                <Skeleton.Button active size="small" shape="round" style={{ width: 56, minWidth: 56 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Column footer */}
        <div className="p-2">
          <Skeleton.Button active block style={{ height: 32 }} />
        </div>
      </div>
    </div>
  )
}

export default function BoardLoading() {
  return (
    <div className="bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900">
      <div className="min-h-screen bg-linear-to-br from-white/10 dark:from-black/50 to-transparent">
        <NavBarSkeleton />

        <main className="py-4 sm:py-6">
          <BoardHeaderSkeleton />

          <div className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 px-2 lg:px-4 space-y-4 lg:space-y-0 min-h-dvh">
            <ColumnSkeleton cardCount={3} />
            <ColumnSkeleton cardCount={2} />
            <ColumnSkeleton cardCount={4} />
            <ColumnSkeleton cardCount={1} />
          </div>
        </main>
      </div>
    </div>
  )
}
