import Link from 'next/link'
import { Button, Card, Tag, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { Board } from '@/lib/supabase/models'
import { EllipsisOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

export default function DashboardGridItem({
  board,
  onEditBoard,
  onDeleteBoard
}: {
  board: Board
  onEditBoard: (boardId: number) => void
  onDeleteBoard: (boardId: number) => void
}) {
  const isNewBoard = new Date(board.created_at) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)

  const handleMenuClick = (e: React.MouseEvent, key: string) => {
    e.preventDefault()
    if (key === 'edit') {
      onEditBoard(board.id)
    } else if (key === 'delete') {
      onDeleteBoard(board.id)
    }
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
        title={
          <div className="flex items-center space-x-2 group-hover:text-primary-500 transition-colors truncate">
            <span>{board.title}</span>
            <Tag className={`text-primary ${!isNewBoard && 'hidden'}`}>New</Tag>
          </div>
        }
        extra={
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" size="small" onClick={(e) => e.preventDefault()}>
              <EllipsisOutlined />
            </Button>
          </Dropdown>
        }
        hoverable
      >
        <div className="flex flex-col space-x-2 text-sm text-gray-500">
          <div className="flex flex-nowrap items-center">
            Created at {new Date(board.created_at).toLocaleDateString()}
          </div>
          <div className="flex flex-nowrap items-center">
            Updated at {new Date(board.updated_at).toLocaleDateString()}
          </div>
        </div>
      </Card>
    </Link>
  )
}
