import { useState, useRef } from "react";
import { X, Upload, FileText, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { parseImportText } from "../utils/parser";
import { useTaskStore } from "../store/useTaskStore";
import { cn } from "../utils/cn";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ImportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ImportDialog = ({ isOpen, onClose }: ImportDialogProps) => {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importTasks } = useTaskStore();

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

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
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Failed to parse file. Please try pasting the text manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    const tasks = parseImportText(inputText);
    if (tasks.length > 0) {
      importTasks(tasks);
      onClose();
      setInputText("");
      setFileName(null);
    } else {
      alert("No tasks found. Ensure format matches:\n- Sprint XX\n- Task item...");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Import Tasks</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
             <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/50",
                    isProcessing && "opacity-50 pointer-events-none"
                )}
             >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                />
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                    {isProcessing ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <Upload className="w-8 h-8 text-primary" />}
                </div>
                {fileName ? (
                    <p className="font-medium text-foreground">{fileName}</p>
                ) : (
                    <div className="text-center space-y-1">
                        <p className="font-medium text-foreground">Click to upload PDF or Text file</p>
                        <p className="text-sm text-muted-foreground">or manually paste content below</p>
                    </div>
                )}
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flwx items-center gap-2">
                    <FileText className="w-4 h-4 inline" />
                    Review Content
                </label>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Sprint 66&#10;- Implement Login&#10;- Fix header bug..."
                    className="w-full h-64 bg-secondary/30 border border-input rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                    disabled={isProcessing}
                />
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20 rounded-b-xl">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleImport}
                disabled={!inputText.trim() || isProcessing}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Import Tasks
            </button>
        </div>
      </div>
    </div>
  );
};
