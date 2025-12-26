import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, ShieldCheck, LayoutDashboard, ArrowRight, Sparkles, Zap, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';

const Landing = () => {
    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Navbar */}
            <nav className="glass sticky top-0 z-50 border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <motion.div 
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="bg-gradient-accent p-2 rounded-xl shadow-glow">
                                <Bot className="h-6 w-6 text-white" />
                            </div>
                            <span className="ml-3 text-xl font-display font-bold gradient-text">Dabba AI</span>
                        </motion.div>
                        <motion.div 
                            className="flex items-center space-x-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link to="/login" className="text-secondary-600 hover:text-secondary-900 font-medium transition-colors">
                                Login
                            </Link>
                            <Button variant="primary" size="sm">
                                Get Started
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                {/* Floating Elements */}
                <motion.div 
                    className="absolute top-20 right-10 w-72 h-72 bg-accent-400/20 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div 
                    className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 8, repeat: Infinity, delay: 1 }}
                />

                <div className="relative text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-accent rounded-full text-white text-sm font-medium shadow-glow mb-8"
                    >
                        <Sparkles className="h-4 w-4" />
                        India's First Self-Learning AI Ecosystem
                    </motion.div>

                    <motion.h1 
                        className="text-5xl md:text-7xl font-display font-extrabold text-secondary-900 mb-6"
                        {...fadeInUp}
                    >
                        <span className="block">Transform Your Campus</span>
                        <span className="block gradient-text mt-2">With Intelligent AI</span>
                    </motion.h1>

                    <motion.p 
                        className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-secondary-600 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Automate student support, verify documents instantly, and let our AI learn your campus infrastructure overnight.
                    </motion.p>

                    <motion.div 
                        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Link to="/student">
                            <Button variant="primary" size="lg" className="w-full sm:w-auto">
                                <Zap className="h-5 w-5" />
                                Try Student Demo
                            </Button>
                        </Link>
                        <Link to="/admin">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                <LayoutDashboard className="h-5 w-5" />
                                Admin Console
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div 
                        className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        {[
                            { label: 'Students Helped', value: '10K+' },
                            { label: 'Documents Verified', value: '50K+' },
                            { label: 'Response Time', value: '<1s' },
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-display font-bold gradient-text">{stat.value}</div>
                                <div className="text-sm text-secondary-600 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary-900 mb-4">
                        Powerful Features
                    </h2>
                    <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                        Everything you need to revolutionize your educational institution
                    </p>
                </motion.div>

                <motion.div 
                    className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {[
                        {
                            icon: <Bot className="h-8 w-8 text-white" />,
                            title: 'AI Student Assistant',
                            description: '24/7 support for students. Ask about syllabus, exams, or campus events and get instant, accurate answers.',
                            gradient: 'bg-gradient-accent',
                            color: 'text-accent-500'
                        },
                        {
                            icon: <ShieldCheck className="h-8 w-8 text-white" />,
                            title: 'Document Verification',
                            description: 'Instant OCR & fraud detection for marksheets and certificates using advanced Vision Transformers.',
                            gradient: 'bg-gradient-success',
                            color: 'text-success-500'
                        },
                        {
                            icon: <LayoutDashboard className="h-8 w-8 text-white" />,
                            title: 'Auto-Learning Engine',
                            description: 'Connect your Google Drive or LMS, and the AI learns everything automatically overnight.',
                            gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
                            color: 'text-purple-500'
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                        >
                            <Card hover gradient className="h-full">
                                <CardBody className="p-8">
                                    <div className={`${feature.gradient} p-3 rounded-xl shadow-glow inline-block mb-6`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-secondary-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-secondary-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardBody>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Card variant="gradient" className="overflow-hidden">
                        <CardBody className="p-12 text-center">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-900 mb-4">
                                Ready to Transform Your Institution?
                            </h2>
                            <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
                                Join thousands of institutions already using Dabba AI to enhance their educational experience.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button variant="primary" size="lg">
                                    <Users className="h-5 w-5" />
                                    Get Started Free
                                </Button>
                                <Button variant="outline" size="lg">
                                    Schedule Demo
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="border-t border-secondary-200 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center text-secondary-600">
                        <p className="text-sm">© 2025 Dabba AI. Transforming Education with Intelligence.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
