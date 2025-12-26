import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, FileText } from 'lucide-react';
import { chatService } from '../../services/api';

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm Dabba AI. Ask me anything about your course or upload a document to analyze.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const results = await chatService.query(input);

            let botResponseText = "I couldn't find anything relevant.";
            if (results && results.length > 0) {
                botResponseText = results.map(r => r.content).join('\n\n---\n\n');
            }

            const botMessage = {
                id: Date.now() + 1,
                text: botResponseText,
                sender: 'bot',
                sources: results.map(r => r.metadata?.source).filter(Boolean)
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I encountered an error connecting to the brain.", sender: 'bot', isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const tempMsgId = Date.now();
        setMessages(prev => [...prev, { id: tempMsgId, text: `Uploading ${file.name}...`, sender: 'user', isSystem: true }]);

        try {
            const response = await chatService.uploadDocument(file);
            setMessages(prev => prev.map(msg =>
                msg.id === tempMsgId
                    ? { ...msg, text: `Uploaded ${file.name} successfully! I have now learned its contents.`, sender: 'bot', isSystem: false }
                    : msg
            ));
        } catch (error) {
            console.error("Upload error:", error);
            setMessages(prev => prev.map(msg =>
                msg.id === tempMsgId
                    ? { ...msg, text: `Failed to upload ${file.name}.`, isError: true }
                    : msg
            ));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-slate-900 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-accent p-2 rounded-full">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Dabba Student Assistant</h3>
                        <p className="text-slate-400 text-xs">Online • Self-Learning Active</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-accent ml-2' : 'bg-slate-200 mr-2'}`}>
                                {msg.sender === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-slate-600" />}
                            </div>

                            <div className={`p-3 rounded-lg text-sm ${msg.sender === 'user'
                                    ? 'bg-accent text-white rounded-tr-none'
                                    : msg.isError
                                        ? 'bg-red-100 text-red-800 rounded-tl-none'
                                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                                }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center">
                                        <FileText className="h-3 w-3 mr-1" />
                                        Sources: {msg.sources.join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg rounded-tl-none border border-slate-200 shadow-sm ml-10">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isLoading}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        title="Upload PDF to Knowledge Base"
                    >
                        <Paperclip className="h-5 w-5" />
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question..."
                        className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        disabled={isLoading}
                    />

                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="p-2 bg-accent text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
