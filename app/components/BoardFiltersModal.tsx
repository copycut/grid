import { useState, useEffect } from 'react'
import { Filter, Priority } from '@/types/types'
import { Button, Form, Modal } from 'antd'

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
  priorities: { priority: { value: string; label: string }[] }
  onReset: () => void
  onClose: () => void
  onSubmit: (filters: Filter) => void
}) {
  const [filterForm] = Form.useForm()
  const [modalFilters, setModalFilters] = useState<Filter>(filters)

  useEffect(() => {
    if (isOpen) {
      setModalFilters(filters)
    }
  }, [isOpen, filters])

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

  return (
    <Modal
      title="Filter Board"
      open={isOpen}
      okText="Apply"
      onOk={handleSubmit}
      onCancel={onClose}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <Button htmlType="reset" onClick={handleResetForm}>
            Reset filters
          </Button>
          <OkBtn />
        </>
      )}
    >
      <Form form={filterForm} initialValues={{ priority: [] }}>
        <Form.Item label="Priority" name="priority">
          <div className="flex space-x-2">
            {priorities.priority.map((priorityItem) => (
              <Button
                key={priorityItem.value}
                type={isPrioritySelected(priorityItem.value) ? 'primary' : 'default'}
                onClick={() => togglePriority(priorityItem.value as Priority)}
              >
                {priorityItem.label}
              </Button>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}
