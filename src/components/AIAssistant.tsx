import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Settings, Sparkles } from 'lucide-react';
import { Button, Input, Tooltip } from 'antd';
import { useSettingsStore } from '../store/useSettingsStore';
import { chatWithAI } from '../services/aiService';
import { cn } from '../utils/cn';

type Message = {
    role: 'user' | 'model';
    text: string;
};

export const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { apiKey, setApiKey } = useSettingsStore();
    const envKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    const isConfigured = (envKey && envKey !== 'YOUR_API_KEY_HERE') || !!apiKey;

    const [inputKey, setInputKey] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSaveKey = () => {
        if (inputKey.trim()) {
            setApiKey(inputKey.trim());
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // Convert simple messages to Gemini history format
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const response = await chatWithAI(userMsg, history);
            
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: `Error: ${String(error)}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-96 h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-bottom-5 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-border flex justify-between items-center bg-primary/5 rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-foreground">AI Assistant</h3>
                        </div>
                        <Button type="text" size="small" icon={<X className="w-4 h-4" />} onClick={() => setIsOpen(false)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {!isConfigured ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-4">
                                <div className="p-3 bg-muted rounded-full">
                                    <Settings className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Configuration Required</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Please set VITE_GOOGLE_AI_API_KEY in .env or enter it here.
                                    </p>
                                    <Input.Password
                                        placeholder="Paste API Key here"
                                        value={inputKey}
                                        onChange={(e) => setInputKey(e.target.value)}
                                        className="mb-2"
                                    />
                                    <Button type="primary" onClick={handleSaveKey} disabled={!inputKey}>
                                        Save API Key
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-4">
                                        The key is stored locally in your browser.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">
                                        <p className="text-sm">👋 Hi! I can help you manage tasks, create dashboard widgets, or summarize your board.</p>
                                        {envKey && envKey !== 'YOUR_API_KEY_HERE' && (
                                            <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                                                <Sparkles className="w-3 h-3" /> Configured via .env
                                            </p>
                                        )}
                                    </div>
                                )}
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white",
                                            msg.role === 'user' ? "bg-primary" : "bg-purple-600"
                                        )}>
                                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm max-w-[80%]",
                                            msg.role === 'user' 
                                                ? "bg-primary text-primary-foreground rounded-tr-none" 
                                                : "bg-muted text-foreground rounded-tl-none"
                                        )}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                        <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Area */}
                    {isConfigured && (
                        <div className="p-4 border-t border-border bg-background rounded-b-2xl">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="flex gap-2"
                            >
                                <Input 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask me to create a task..." 
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                                <Button 
                                    type="primary" 
                                    icon={<Send className="w-4 h-4" />} 
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                />
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Float Button */}
            <Tooltip title={isOpen ? "Close AI Assistant" : "Open AI Assistant"} placement="left">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center pointer-events-auto"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                </button>
            </Tooltip>
        </div>
    );
};
