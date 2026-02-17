import { Select } from 'antd'

function ColorLabel({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full ${color}`}></div>
      <span className="capitalize">{color.replace('bg-', '').replace('-500', ' ')}</span>
    </div>
  )
}

function SelectedColor({ value }: { label: React.ReactNode; value: string | number }) {
  return <ColorLabel color={String(value)} />
}

export default function BoardColorList({ value, onChange }: { value?: string; onChange: (color: string) => void }) {
  const colorList = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-slate-500',
    'bg-gray-500',
    'bg-neutral-500',
    'bg-stone-500'
  ]

  const options = colorList.map((color) => ({
    value: color,
    label: <ColorLabel color={color} />
  }))

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      defaultValue="bg-indigo-500"
      labelRender={SelectedColor}
      className="w-full"
      placeholder="Select a color"
    />
  )
}
