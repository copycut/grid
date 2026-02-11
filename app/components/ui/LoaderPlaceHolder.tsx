import { Card, Skeleton } from 'antd'

export default function LoaderPlaceHolder({ height = 200 }: { height?: number }) {
  return (
    <div className="flex gap-6 shrink-0">
      {new Array(3).fill(0).map((_, index) => (
        <Card key={`column-loader-${index}`} className="overflow-hidden min-w-80" style={{ height }}>
          <div className="p-2">
            <Skeleton active title={false} paragraph={{ rows: 3 }} />
          </div>
        </Card>
      ))}
    </div>
  )
}
