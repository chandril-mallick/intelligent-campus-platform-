import React, { useEffect, useState } from 'react';
import {
    Activity,
    Database,
    FileText,
    TrendingUp,
    RefreshCw,
    Clock,
    CheckCircle,
    AlertCircle,
    Folder
} from 'lucide-react';
import { adminService } from '../services/api';
import DocumentVerification from '../components/verification/DocumentVerification';

const AdminConsole = () => {
    const [analytics, setAnalytics] = useState(null);
    const [knowledgeBase, setKnowledgeBase] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [autoLearnPath, setAutoLearnPath] = useState('/Users/chandrilmallick/Downloads/DABBA_Aiv5/knowledge_base');
    const [autoLearnStatus, setAutoLearnStatus] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [analyticsData, kbData] = await Promise.all([
                adminService.getAnalytics(),
                adminService.getKnowledgeBase()
            ]);
            setAnalytics(analyticsData);
            setKnowledgeBase(kbData);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleAutoLearn = async () => {
        try {
            setAutoLearnStatus('running');
            const result = await adminService.triggerAutoLearning(autoLearnPath);
            setAutoLearnStatus('success');
            setTimeout(() => {
                fetchData();
                setAutoLearnStatus(null);
            }, 2000);
        } catch (error) {
            console.error('Auto-learning failed:', error);
            setAutoLearnStatus('error');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-accent animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold">Dabba AI - Admin Console</h1>
                    <p className="text-slate-400 mt-1">Monitor and manage your institutional AI brain</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Queries */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Total Queries</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{analytics?.total_queries || 0}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Activity className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {analytics?.queries_today || 0} today
                        </p>
                    </div>

                    {/* Total Documents */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Documents</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{analytics?.total_documents || 0}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {knowledgeBase?.total_chunks || 0} chunks indexed
                        </p>
                    </div>

                    {/* Knowledge Health */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Knowledge Health</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{analytics?.knowledge_health?.toFixed(0) || 0}%</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {knowledgeBase?.vector_store_size_mb || 0} MB indexed
                        </p>
                    </div>

                    {/* Last Updated */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Last Updated</p>
                                <p className="text-sm font-semibold text-slate-900 mt-1">
                                    {knowledgeBase?.last_updated !== 'Never'
                                        ? new Date(knowledgeBase?.last_updated).toLocaleDateString()
                                        : 'Never'}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <button
                            onClick={fetchData}
                            className="text-xs text-accent hover:underline mt-2 flex items-center"
                        >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Auto-Learning Engine */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <Database className="h-5 w-5 mr-2 text-accent" />
                        Auto-Learning Engine
                    </h2>
                    <p className="text-slate-600 mb-4">
                        Trigger the AI to learn from documents in a directory automatically.
                    </p>

                    <div className="flex items-center space-x-3">
                        <Folder className="h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            value={autoLearnPath}
                            onChange={(e) => setAutoLearnPath(e.target.value)}
                            placeholder="/path/to/knowledge/directory"
                            className="flex-1 border border-slate-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <button
                            onClick={handleAutoLearn}
                            disabled={autoLearnStatus === 'running'}
                            className="bg-accent text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {autoLearnStatus === 'running' ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    <span>Learning...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Trigger Learning</span>
                                </>
                            )}
                        </button>
                    </div>

                    {autoLearnStatus === 'success' && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center text-green-800">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Auto-learning triggered successfully!
                        </div>
                    )}

                    {autoLearnStatus === 'error' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-800">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Failed to trigger auto-learning. Check the path and try again.
                        </div>
                    )}
                </div>

                {/* Recent Queries */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Queries</h2>
                    {analytics?.recent_queries && analytics.recent_queries.length > 0 ? (
                        <ul className="space-y-2">
                            {analytics.recent_queries.map((query, index) => (
                                <li key={index} className="flex items-start p-3 bg-slate-50 rounded-md">
                                    <Activity className="h-4 w-4 text-slate-400 mr-3 mt-0.5" />
                                    <span className="text-slate-700">{query}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No queries yet</p>
                    )}
                </div>

                {/* Knowledge Base Documents */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Knowledge Base Documents</h2>
                    {knowledgeBase?.documents && knowledgeBase.documents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 text-slate-600 font-medium">Filename</th>
                                        <th className="text-left py-3 px-4 text-slate-600 font-medium">Chunks</th>
                                        <th className="text-left py-3 px-4 text-slate-600 font-medium">Size</th>
                                        <th className="text-left py-3 px-4 text-slate-600 font-medium">Indexed At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {knowledgeBase.documents.map((doc, index) => (
                                        <tr key={index} className="border-b hover:bg-slate-50">
                                            <td className="py-3 px-4 text-slate-900">{doc.filename}</td>
                                            <td className="py-3 px-4 text-slate-600">{doc.chunks}</td>
                                            <td className="py-3 px-4 text-slate-600">{doc.size_kb} KB</td>
                                            <td className="py-3 px-4 text-slate-600 text-sm">
                                                {new Date(doc.indexed_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No documents indexed yet</p>
                    )}
                </div>

                {/* Document Verification */}
                <DocumentVerification />
            </div>
        </div>
    );
};

export default AdminConsole;
