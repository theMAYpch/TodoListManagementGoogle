import { useState } from "react";
import { Upload as UploadIcon, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { Modal, Input, Button, Upload, Spin } from "antd";
import * as pdfjsLib from "pdfjs-dist";
import { parseImportText } from "../utils/parser";
import { useTaskStore } from "../store/useTaskStore";
import type { UploadFile } from "antd/es/upload/interface";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const { Dragger } = Upload;
const { TextArea } = Input;

type ImportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ImportDialog = ({ isOpen, onClose }: ImportDialogProps) => {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { importTasks, epics } = useTaskStore();

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setFileList([{ uid: '-1', name: file.name, status: 'uploading' }]);

    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join("\n");
          fullText += pageText + "\n";
        }
        
        setInputText(fullText);
      } else {
        // Plain text file
        const text = await file.text();
        setInputText(text);
      }
      setFileList([{ uid: '-1', name: file.name, status: 'done' }]);
      toast.success("File parsed successfully");
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Failed to parse file. Please try pasting text manually.");
      setFileList([{ uid: '-1', name: file.name, status: 'error' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    const result = parseImportText(inputText, epics);
    // Support both old return (array) and new return (object) just in case, though we changed parser.
    // In TS, parser returns object now.
    const tasks = Array.isArray(result) ? result : result.tasks;
    const newEpics = Array.isArray(result) ? [] : result.newEpics;

    if (tasks.length > 0) {
      importTasks(tasks, newEpics);
      toast.success(`Imported ${tasks.length} tasks and ${newEpics.length} new epics!`);
      // Reset state
      setInputText("");
      setFileList([]);
      onClose();
    } else {
      toast.error("No valid tasks found. Check format.");
    }
  };

  const draggerProps = {
    name: 'file',
    multiple: false,
    fileList: fileList,
    onRemove: () => {
        setFileList([]);
        setInputText("");
    },
    beforeUpload: (file: File) => {
        handleFileUpload(file);
        return false; // Prevent auto upload
    },
    showUploadList: true,
  };

  return (
    <Modal
        open={isOpen}
        onCancel={onClose}
        title="Import Tasks"
        width={700}
        footer={[
            <Button key="cancel" onClick={onClose}>
                Cancel
            </Button>,
            <Button 
                key="import" 
                type="primary" 
                onClick={handleImport}
                disabled={!inputText.trim() || isProcessing}
                loading={isProcessing}
            >
                Import Tasks
            </Button>
        ]}
    >
        <div className="space-y-6 pt-4">
            <Dragger {...draggerProps} disabled={isProcessing} style={{ padding: '20px' }}>
                <p className="ant-upload-drag-icon">
                    {isProcessing ? <Spin /> : <UploadIcon className="w-10 h-10 text-primary mx-auto" />}
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for .txt and .pdf files. Content will be parsed into tasks.
                </p>
            </Dragger>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    Review Content
                </div>
                <TextArea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Sprint 66&#10;- Implement Login&#10;- Fix header bug..."
                    rows={10}
                    disabled={isProcessing}
                    className="font-mono text-sm"
                />
            </div>
        </div>
    </Modal>
  );
};
