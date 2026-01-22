import { useState } from 'react'
import { Filter } from '@/types/types'
import { Button, Form, Modal, Select } from 'antd'

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

  const handleResetForm = () => {
    filterForm.resetFields()
    setModalFilters({ ...filters, priority: 'default' })
    onReset()
  }

  return (
    <Modal
      title="Filter Board"
      open={isOpen}
      okText="Apply"
      onOk={() => onSubmit(modalFilters)}
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
      <Form form={filterForm} initialValues={{ priority: 'default' }}>
        <Form.Item label="Priority" name="priority">
          <Select
            options={priorities.priority}
            value={modalFilters.priority}
            onChange={(value) => setModalFilters({ ...modalFilters, priority: value })}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
