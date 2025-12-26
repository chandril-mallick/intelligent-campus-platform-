import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, FileText, Loader2, Sparkles, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatService } from '../../services/api';

const EnhancedChatInterface = () => {
    // ... (state)

    const handleFeedback = async (type) => {
        if (!sessionId) return;
        try {
            await fetch('http://localhost:8000/api/v1/chat/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    feedback_type: type,
                    comment: "User feedback from UI"
                })
            });
            // Optional: Show toast
        } catch (err) {
            console.error("Feedback failed", err);
        }
    };
    
    // ... rest of code
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi! I'm Dabba AI, your intelligent campus assistant. I can help you with:\n\n• Course information and syllabus\n• Exam schedules and deadlines\n• Campus resources and facilities\n• Academic queries\n\nYou can also teach me by uploading PDFs!",
            sender: 'bot',
            timestamp: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [suggestedQuestions, setSuggestedQuestions] = useState([
        "What courses are available?",
        "Tell me about exam schedules",
        "How do I access the library?"
    ]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (queryText = null) => {
        const query = queryText || input;
        if (!query.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: query,
            sender: 'user',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Use the new enhanced chat endpoint
            const response = await fetch('http://localhost:8000/api/v1/chat/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    session_id: sessionId,
                    conversation_history: messages.filter(m => m.sender !== 'system').map(m => ({
                        role: m.sender === 'user' ? 'user' : 'assistant',
                        content: m.text
                    }))
                })
            });

            const data = await response.json();

            // Update session ID
            if (data.session_id && !sessionId) {
                setSessionId(data.session_id);
            }

            // Update suggested questions
            if (data.suggested_questions && data.suggested_questions.length > 0) {
                setSuggestedQuestions(data.suggested_questions);
            }

            const botMessage = {
                id: Date.now() + 1,
                text: data.answer || "I couldn't find relevant information.",
                sender: 'bot',
                sources: data.sources || [],
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Sorry, I encountered an error. Please try again.",
                sender: 'bot',
                isError: true,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const tempMsgId = Date.now();
        setMessages(prev => [...prev, {
            id: tempMsgId,
            text: `Uploading ${file.name}...`,
            sender: 'system',
            timestamp: new Date().toISOString()
        }]);

        try {
            const response = await chatService.uploadDocument(file);
            setMessages(prev => prev.filter(msg => msg.id !== tempMsgId).concat([{
                id: Date.now(),
                text: `✅ **${file.name}** uploaded successfully!\n\nI've learned ${response.chunks_created} new concepts from this document. You can now ask me questions about it!`,
                sender: 'bot',
                timestamp: new Date().toISOString()
            }]));
        } catch (error) {
            console.error("Upload error:", error);
            setMessages(prev => prev.filter(msg => msg.id !== tempMsgId).concat([{
                id: Date.now(),
                text: `❌ Failed to upload **${file.name}**. Please try again.`,
                sender: 'bot',
                isError: true,
                timestamp: new Date().toISOString()
            }]));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSuggestedClick = (question) => {
        setInput(question);
        handleSend(question);
    };

    const handleClearConversation = () => {
        setMessages([{
            id: Date.now(),
            text: "Conversation cleared! How can I help you today?",
            sender: 'bot',
            timestamp: new Date().toISOString()
        }]);
        setSessionId(null);
        setSuggestedQuestions([
            "What courses are available?",
            "Tell me about exam schedules",
            "How do I access the library?"
        ]);
    };

    return (
        <div className="flex flex-col h-[700px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-accent p-2 rounded-full animate-pulse">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium flex items-center">
                            Dabba AI Assistant
                            <Sparkles className="h-4 w-4 ml-2 text-yellow-400" />
                        </h3>
                        <p className="text-slate-400 text-xs">
                            {isLoading ? 'Thinking...' : 'Online • Context-Aware'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleClearConversation}
                    className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700"
                    title="Clear conversation"
                >
                    <RotateCcw className="h-4 w-4" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                            {msg.sender !== 'system' && (
                                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-accent ml-2' : 'bg-slate-200 mr-2'
                                    }`}>
                                    {msg.sender === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-slate-600" />}
                                </div>
                            )}

                            <div className={`p-3 rounded-lg ${msg.sender === 'user'
                                    ? 'bg-accent text-white rounded-tr-none'
                                    : msg.sender === 'system'
                                        ? 'bg-blue-50 text-blue-800 rounded-lg border border-blue-200'
                                        : msg.isError
                                            ? 'bg-red-100 text-red-800 rounded-tl-none border border-red-200'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                                }`}>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>

                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center">
                                            <FileText className="h-3 w-3 mr-1" />
                                            Sources ({msg.sources.length})
                                        </p>
                                        <div className="space-y-1">
                                            {msg.sources.map((source, idx) => (
                                                <div key={idx} className="text-xs bg-slate-50 p-2 rounded border border-slate-100">
                                                    <p className="text-slate-600 line-clamp-2">{source.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {msg.sender === 'bot' && !msg.isError && (
                                    <div className="flex gap-2 mt-2 justify-end text-slate-400">
                                        <button 
                                            onClick={() => handleFeedback('thumbs_up')}
                                            className="hover:text-green-600 transition-colors p-1"
                                            title="Helpful"
                                        >
                                            <ThumbsUp className="h-3 w-3" />
                                        </button>
                                        <button 
                                            onClick={() => handleFeedback('thumbs_down')}
                                            className="hover:text-red-600 transition-colors p-1"
                                            title="Not Helpful"
                                        >
                                            <ThumbsDown className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}

                                <p className="text-xs text-slate-400 mt-2">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-lg rounded-tl-none border border-slate-200 shadow-sm ml-10 flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 text-accent animate-spin" />
                            <span className="text-slate-600 text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {!isLoading && suggestedQuestions.length > 0 && (
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((question, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestedClick(question)}
                                className="text-xs bg-white border border-slate-300 px-3 py-1 rounded-full hover:bg-accent hover:text-white hover:border-accent transition-colors"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                        title="Upload PDF to teach me"
                    >
                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Ask me anything..."
                        className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-slate-50"
                        disabled={isLoading}
                    />

                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className="p-2 bg-accent text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                    Press Enter to send • Shift + Enter for new line
                </p>
            </div>
        </div>
    );
};

export default EnhancedChatInterface;
