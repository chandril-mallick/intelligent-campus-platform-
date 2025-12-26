import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, TrendingUp, MessageSquare } from 'lucide-react';
import EnhancedChatInterface from '../components/chat/EnhancedChatInterface';
import Card, { CardBody } from '../components/ui/Card';

const StudentPortal = () => {
    const quickLinks = [
        { icon: <Calendar className="h-6 w-6" />, title: 'Exam Schedule', color: 'bg-gradient-accent' },
        { icon: <BookOpen className="h-6 w-6" />, title: 'Course Material', color: 'bg-gradient-success' },
        { icon: <TrendingUp className="h-6 w-6" />, title: 'My Grades', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                        Student Portal
                    </h1>
                    <p className="text-lg text-secondary-600">
                        Access your personal AI assistant and learning resources
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chat Area */}
                    <motion.div 
                        className="lg:col-span-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <EnhancedChatInterface />
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        {/* Quick Links */}
                        <Card variant="glass">
                            <CardBody className="p-6">
                                <h2 className="text-xl font-display font-bold text-secondary-900 mb-4 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-accent-500" />
                                    Quick Access
                                </h2>
                                <div className="space-y-3">
                                    {quickLinks.map((link, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 border border-secondary-100">
                                                <div className={`${link.color} p-2 rounded-lg text-white shadow-glow`}>
                                                    {link.icon}
                                                </div>
                                                <span className="font-medium text-secondary-800">{link.title}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Stats Card */}
                        <Card variant="gradient">
                            <CardBody className="p-6">
                                <h3 className="text-lg font-display font-bold text-slate-900 mb-4">
                                    Your Progress
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Questions Asked', value: '24', change: '+12%' },
                                        { label: 'Documents Uploaded', value: '8', change: '+3' },
                                        { label: 'Study Streak', value: '5 days', change: '🔥' },
                                    ].map((stat, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm text-slate-700 font-medium">{stat.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-slate-900">{stat.value}</span>
                                                <span className="text-xs text-green-700 font-semibold">{stat.change}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Tips Card */}
                        <Card hover className="bg-gradient-accent text-white">
                            <CardBody className="p-6">
                                <h3 className="text-lg font-display font-bold mb-2">💡 Pro Tip</h3>
                                <p className="text-sm text-white/90">
                                    Upload your course PDFs to get personalized answers based on your syllabus!
                                </p>
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default StudentPortal;
