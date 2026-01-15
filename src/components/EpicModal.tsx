import { Modal, Form, Input, ColorPicker } from "antd";
import { useEffect } from "react";
import type { Epic } from "../types";
import { v4 as uuidv4 } from "uuid";

type EpicModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (epic: Epic) => void;
};

export const EpicModal = ({ isOpen, onClose, onSave }: EpicModalProps) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (isOpen) {
            form.resetFields();
            form.setFieldsValue({ color: '#3b82f6' }); // Default blue
        }
    }, [isOpen, form]);

    const handleOk = async () => {
        try {
            console.log("Validating fields...");
            const values = await form.validateFields();
            console.log("Form values:", values);
            
            let colorHex = '#3b82f6'; // Fallback
            if (values.color) {
                colorHex = typeof values.color === 'string' ? values.color : values.color.toHexString();
            }

            const epic: Epic = {
                id: uuidv4(),
                title: values.title,
                color: colorHex,
                status: 'active',
            };
            
            console.log("Saving epic:", epic);
            onSave(epic);
            onClose();
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <Modal
            title="Create New Epic"
            open={isOpen}
            onCancel={onClose}
            onOk={handleOk}
            okText="Create Epic"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="title"
                    label="Epic Title"
                    rules={[{ required: true, message: 'Please enter a title' }]}
                >
                    <Input placeholder="e.g. Q1 Marketing Campaign" />
                </Form.Item>

                <Form.Item
                    name="color"
                    label="Color Code"
                    trigger="onChange"
                    getValueFromEvent={(color) => color}
                >
                    <ColorPicker showText />
                </Form.Item>
            </Form>
        </Modal>
    );
};
