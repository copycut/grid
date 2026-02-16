import { useState } from 'react'
import Link from 'next/link'
import { Button, Card, Tag, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { Board } from '@/lib/supabase/models'
import { EllipsisOutlined, EditOutlined, DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons'
import { formatDate } from '@/lib/utils/date'

export default function DashboardGridItem({
  board,
  onEditBoard,
  onToggleFavorite,
  onDeleteBoard
}: {
  board: Board
  onEditBoard: (boardId: number) => void
  onToggleFavorite: (boardId: number) => void
  onDeleteBoard: (boardId: number) => void
}) {
  const [now] = useState(() => Date.now())
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
  const isNewBoard = new Date(board.updated_at).getTime() > sevenDaysAgo

  const handleMenuClick = (e: React.MouseEvent, key: string) => {
    e.preventDefault()
    if (key === 'edit') {
      onEditBoard(board.id)
    } else if (key === 'delete') {
      onDeleteBoard(board.id)
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onToggleFavorite(board.id)
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: (e) => handleMenuClick(e.domEvent as React.MouseEvent, 'edit')
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: (e) => handleMenuClick(e.domEvent as React.MouseEvent, 'delete')
    }
  ]

  return (
    <Link key={board.id} href={`/boards/${board.id}`} className="flex flex-col group">
      <Card
        className="group-hover:border-primary-500!"
        title={
          <div className="flex items-center space-x-2 group-hover:text-primary-500 transition-colors truncate">
            <span>{board.title}</span>
            <Tag className={`text-primary-400! ${!isNewBoard && 'hidden'}`}>New</Tag>
          </div>
        }
        extra={
          <>
            <Button type="text" shape="circle" onClick={handleToggleFavorite} title="Toggle favorite">
              {board.is_favorite ? (
                <StarFilled className="text-primary!" />
              ) : (
                <StarOutlined className="text-primary!" />
              )}
            </Button>
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button type="text" shape="circle" onClick={(e) => e.preventDefault()}>
                <EllipsisOutlined />
              </Button>
            </Dropdown>
          </>
        }
        hoverable
      >
        <div className="flex flex-col space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex flex-nowrap items-center gap-2">
            <span className="font-semibold">Created:</span>
            <span>{formatDate(board.created_at)}</span>
          </div>
          <div className="flex flex-nowrap items-center gap-2">
            <span className="font-semibold">Updated:</span>
            <span>{formatDate(board.updated_at)}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
