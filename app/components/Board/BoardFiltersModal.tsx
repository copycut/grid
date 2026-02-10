import { useState } from 'react'
import { Filter, Priority } from '@/types/types'
import { Button, Form, Modal } from 'antd'
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut'
import ShortcutIndicator from '@/app/components/ui/ShortcutIndicator'
import { twMerge } from 'tailwind-merge'

export default function BoardFiltersModal({
  isOpen,
  filters,
  priorities,
  onReset,
  onClose,
  onSubmit
}: {
  isOpen: boolean
  filters: Filter
  priorities: { priority: { value: string; label: string; color: string }[] }
  onReset: () => void
  onClose: () => void
  onSubmit: (filters: Filter) => void
}) {
  const [filterForm] = Form.useForm()
  const [modalFilters, setModalFilters] = useState<Filter>(filters)

  const handleResetForm = () => {
    filterForm.resetFields()
    setModalFilters({ ...filters, priority: [] })
    onReset()
  }

  const togglePriority = (value: Priority) => {
    const currentPriorities = modalFilters.priority || []

    if (currentPriorities.includes(value)) {
      setModalFilters({
        ...modalFilters,
        priority: currentPriorities.filter((p) => p !== value)
      })
    } else {
      setModalFilters({
        ...modalFilters,
        priority: [...currentPriorities, value]
      })
    }
  }

  const isPrioritySelected = (value: string) => {
    return modalFilters.priority?.includes(value as Priority) || false
  }

  const handleSubmit = () => {
    // if all buttons selected reset the filter
    const updatedFilters =
      modalFilters.priority?.length === priorities.priority.length ? { ...modalFilters, priority: [] } : modalFilters

    setModalFilters(updatedFilters)
    onSubmit(updatedFilters)
  }

  useKeyboardShortcut(handleSubmit, {
    key: 'Enter',
    modifiers: { cmdOrCtrl: true },
    enabled: isOpen,
    preventDefault: true
  })

  useKeyboardShortcut(handleResetForm, {
    key: 'Backspace',
    modifiers: { cmdOrCtrl: true },
    enabled: isOpen,
    preventDefault: true
  })

  return (
    <Modal
      title="Filter Board"
      open={isOpen}
      okText="Apply"
      onOk={handleSubmit}
      onCancel={onClose}
      centered
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="reset" htmlType="reset" onClick={handleResetForm}>
          <ShortcutIndicator>⌫</ShortcutIndicator>
          Reset filters
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          <ShortcutIndicator>⏎</ShortcutIndicator>
          <span>Apply</span>
        </Button>
      ]}
    >
      <Form form={filterForm} initialValues={{ priority: [] }}>
        <Form.Item label="Priority" name="priority">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {priorities.priority.map((priorityItem) => (
              <Button
                key={priorityItem.value}
                type={isPrioritySelected(priorityItem.value) ? 'primary' : 'default'}
                onClick={() => togglePriority(priorityItem.value as Priority)}
              >
                <span className={twMerge(`h-3 w-3 rounded-full bg-${priorityItem.color || 'gray'}-500`)} />
                {priorityItem.label}
              </Button>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}
