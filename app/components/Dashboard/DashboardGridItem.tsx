import { useState } from 'react'
import Link from 'next/link'
import { Button, Card, Tag, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { Board } from '@/lib/supabase/models'
import {
  EllipsisOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  FolderOutlined,
  FolderOpenOutlined
} from '@ant-design/icons'
import { formatDate } from '@/lib/utils/date'

export default function DashboardGridItem({
  board,
  onEditBoard,
  onToggleFavorite,
  onArchiveBoard,
  onDeleteBoard
}: {
  board: Board
  onEditBoard: (boardId: number) => void
  onToggleFavorite: (boardId: number) => void
  onArchiveBoard: (boardId: number) => void
  onDeleteBoard: (boardId: number) => void
}) {
  const [now] = useState(() => Date.now())
  const oneDayAgo = now - 1 * 24 * 60 * 60 * 1000
  const isNewBoard = new Date(board.created_at).getTime() > oneDayAgo

  const handleMenuClick = (e: React.MouseEvent, key: string) => {
    e.preventDefault()
    if (key === 'edit') {
      onEditBoard(board.id)
    } else if (key === 'delete') {
      onDeleteBoard(board.id)
    } else if (key === 'archive') {
      onArchiveBoard(board.id)
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onToggleFavorite(board.id)
  }

  const menuItems: MenuProps['items'] = board.is_archived
    ? [
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
          key: 'archive',
          label: 'Unarchive',
          icon: <FolderOpenOutlined />,
          onClick: (e) => handleMenuClick(e.domEvent as React.MouseEvent, 'archive')
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
    : [
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
          key: 'archive',
          label: 'Archive',
          icon: <FolderOutlined />,
          onClick: (e) => handleMenuClick(e.domEvent as React.MouseEvent, 'archive')
        }
      ]

  return (
    <Link key={board.id} href={board.is_archived ? '#' : `/boards/${board.id}`} className="flex flex-col group">
      <Card
        className="group-hover:border-primary-500!"
        title={
          <div className="flex items-center gap-2 group-hover:text-primary-500 group-hover:dark:text-primary-400 transition-colors truncate">
            <Button type="text" shape="circle" onClick={handleToggleFavorite} title="Toggle favorite">
              {board.is_favorite ? (
                <StarFilled className="text-primary-500! text-xl" />
              ) : (
                <StarOutlined className="text-gray-500! text-xl" />
              )}
            </Button>
            <span>{board.title}</span>
            {isNewBoard && <Tag className="text-primary-400!">New</Tag>}
            {board.is_archived && <Tag color="orange">Archived</Tag>}
          </div>
        }
        extra={
          <div className="flex items-center gap-2">
            {board.background_color && (
              <div className={`w-4 h-4 rounded-full capitalize ${board.background_color}`}></div>
            )}
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button type="text" shape="circle" onClick={(e) => e.preventDefault()}>
                <EllipsisOutlined />
              </Button>
            </Dropdown>
          </div>
        }
        hoverable
      >
        <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
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
