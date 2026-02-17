import { Select } from 'antd'
import type { ReactNode } from 'react'

function ColorLabel({ color, label }: { color?: string; label: string }) {
  const defaultColor =
    'border border-gray-300 dark:border-gray-700 bg-linear-to-br from-blue-90 to-purple-50 dark:from-blue-900 dark:to-purple-500'

  return (
    <div className="flex items-center gap-2" key={color || 'no-color'}>
      <div className={`w-4 h-4 rounded-full ${color || defaultColor}`} />
      <span className="capitalize">{label}</span>
    </div>
  )
}

function SelectedColor(props: { value: string | number; label: ReactNode }) {
  const colorValue = String(props.value || '')
  const labelText = colorValue.replace('bg-', '').replace('-500', ' ')

  return <ColorLabel color={colorValue === 'default' ? undefined : colorValue} label={labelText} />
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

  const options = [
    {
      value: 'default',
      label: <ColorLabel label="Default" />,
      key: 'no-color'
    },
    ...colorList.map((color) => ({
      value: color,
      label: <ColorLabel color={color} label={color.replace('bg-', '').replace('-500', ' ')} />
    }))
  ]

  function handleChange(color: string) {
    onChange(color === 'default' ? '' : color)
  }

  return (
    <Select
      value={value || 'default'}
      onChange={handleChange}
      options={options}
      labelRender={SelectedColor}
      className="w-full"
      placeholder="Select a color"
    />
  )
}
