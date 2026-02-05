import { Card, Skeleton } from 'antd'

export default function LoaderPlaceHolder({ height = 200 }: { height?: number }) {
  return new Array(3).fill(0).map((_, index) => (
    <Card key={`column-loader-${index}`} className="overflow-hidden" style={{ height }}>
      <div className="p-2">
        <Skeleton active title paragraph={{ rows: 2 }} />
      </div>
    </Card>
  ))
}
