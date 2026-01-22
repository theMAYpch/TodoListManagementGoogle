import { useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, Space, Divider, Checkbox } from "antd";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { useTaskStore } from "../store/useTaskStore";
import type { Task, TaskCategory, TaskStatus } from "../types";

const { TextArea } = Input;
const { Option } = Select;

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  initialStatus?: TaskStatus;
};

const CATEGORIES: TaskCategory[] = ["Planning", "Documentation", "Support", "Meetings", "Management", "Others"];

export const TaskModal = ({ isOpen, onClose, taskToEdit, initialStatus }: TaskModalProps) => {
  const { addTask, updateTask, deleteTask, epics, addEpic } = useTaskStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        form.setFieldsValue({
          title: taskToEdit.title,
          description: taskToEdit.description,
          status: taskToEdit.status,
          category: taskToEdit.category,
          sprint: taskToEdit.sprint,
          // Handle dates: parse ISO string to dayjs
          startDate: taskToEdit.startDate ? dayjs(taskToEdit.startDate) : null,
          dueDate: taskToEdit.dueDate ? dayjs(taskToEdit.dueDate) : null,
          assignees: taskToEdit.assignees, // We will use Select mode="tags"
          url: taskToEdit.url,
          epicId: taskToEdit.epicId,
          subtasks: taskToEdit.subtasks,
        });
      } else {
        const now = dayjs();
        form.resetFields();
        form.setFieldsValue({
          status: initialStatus || "todo",
          category: "Planning",
          sprint: `Sprint ${now.year()}-${now.month() + 1}`,
          subtasks: [],
          assignees: [], // Initialize as empty array for Select mode="tags"
        });
      }
    }
  }, [isOpen, taskToEdit, initialStatus, form]);

  const handleFinish = (values: any) => {
    const taskData = {
      title: values.title,
      description: values.description || "",
      status: values.status,
      category: values.category,
      sprint: values.sprint,
      startDate: values.startDate ? values.startDate.toISOString() : "",
      dueDate: values.dueDate ? values.dueDate.toISOString() : "",
      assignees: values.assignees || [],
      url: values.url || "",
      epicId: values.epicId || "",
      subtasks: values.subtasks || [],
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
      toast.success("Task updated");
    } else {
      addTask({
        id: uuidv4(),
        createdAt: Date.now(),
        ...taskData,
      });
      toast.success("Task created");
    }
    onClose();
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Task',
      content: 'Are you sure you want to delete this task?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        if (taskToEdit) {
          deleteTask(taskToEdit.id);
          onClose();
          toast.success("Task deleted");
        }
      },
    });
  };

  const handleCreateEpic = () => {
      const title = prompt("Enter new Epic title:");
      if (title) {
          const newEpicId = uuidv4();
          addEpic({
              id: newEpicId,
              title,
              color: '#3b82f6',
              status: 'active'
          });
          form.setFieldValue('epicId', newEpicId);
          toast.success("Epic created and selected");
      }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={taskToEdit ? "Edit Task" : "New Task"}
      width={700}
      footer={[
        taskToEdit && (
          <Button key="delete" danger onClick={handleDelete} icon={<Trash2 className="w-4 h-4" />}>
            Delete
          </Button>
        ),
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={form.submit}>
          {taskToEdit ? "Save Changes" : "Create Task"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select>
                    {CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
             </Form.Item>
             <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select>
                    <Option value="todo">To Do</Option>
                    <Option value="doing">In Progress</Option>
                    <Option value="review">Review</Option>
                    <Option value="done">Done</Option>
                </Select>
             </Form.Item>
        </div>

        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input placeholder="Task Title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Add details..." />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Form.Item name="sprint" label="Sprint">
                <Input placeholder="e.g. Sprint 2026-01" />
             </Form.Item>
             <Form.Item name="assignees" label="Assignees">
                <Select mode="tags" placeholder="John, Jane" />
             </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Form.Item label={
                 <div className="flex items-center justify-between w-full gap-2">
                     <span>Epic</span>
                     <Button type="link" size="small" onClick={handleCreateEpic} className="p-0 h-auto">
                        + New Epic
                     </Button>
                 </div>
             } name="epicId">
                <Select placeholder="Select Epic" allowClear>
                    {epics.map(epic => (
                        <Option key={epic.id} value={epic.id}>
                           <Space>
                               <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: epic.color }} />
                               {epic.title}
                           </Space>
                        </Option>
                    ))}
                </Select>
             </Form.Item>
             
             <Form.Item name="url" label="External Link">
                <Input addonBefore="URL" placeholder="https://..." />
             </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Form.Item name="startDate" label="Start Date">
                <DatePicker className="w-full" />
             </Form.Item>
             <Form.Item name="dueDate" label="Due Date">
                <DatePicker className="w-full" />
             </Form.Item>
        </div>

        <Divider>Subtasks</Divider>

        <Form.List name="subtasks">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="flex items-center gap-2 mb-2">
                    <Form.Item
                        {...restField}
                        name={[name, 'completed']}
                        valuePropName="checked"
                        noStyle
                    >
                        <Checkbox />
                    </Form.Item>
                    <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        rules={[{ required: true, message: 'Missing subtask title' }]}
                        className="mb-0 flex-1"
                    >
                        <Input placeholder="Subtask title" />
                    </Form.Item>
                    <Button type="text" danger icon={<Trash2 className="w-4 h-4" />} onClick={() => remove(name)} />
                </div>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add({ id: uuidv4(), title: '', completed: false })} block icon={<Plus className="w-4 h-4" />}>
                  Add Subtask
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

      </Form>
    </Modal>
  );
};
