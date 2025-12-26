import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VerifierDashboard = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState(null);

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/admin/verification/queue');
            setQueue(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch queue", err);
            setLoading(false);
        }
    };

    const handleDecision = async (caseId, decision) => {
        try {
            const endpoint = `http://localhost:8000/api/v1/admin/verification/${caseId}/${decision}`;
            await axios.post(endpoint, { remarks: "Manual decision by verifier" });
            fetchQueue(); // Refresh
            setSelectedCase(null);
            alert(`Case ${decision} successfully`);
        } catch (err) {
            alert("Action failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">🕵️ Verifier Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* List Column */}
                <div className="bg-white p-4 rounded-lg shadow h-[80vh] overflow-y-auto col-span-1">
                    <h2 className="text-xl font-semibold mb-4">Pending Cases ({queue.length})</h2>
                    {loading ? <p>Loading...</p> : queue.length === 0 ? <p className="text-gray-500">No pending cases.</p> : (
                        <ul className="space-y-3">
                            {queue.map((item) => (
                                <li 
                                    key={item.case_id} 
                                    onClick={() => setSelectedCase(item)}
                                    className={`p-3 border rounded cursor-pointer hover:bg-blue-50 ${selectedCase?.case_id === item.case_id ? 'border-blue-500 bg-blue-50' : ''}`}
                                >
                                    <div className="font-medium">Case #{item.case_id}</div>
                                    <div className="text-sm text-gray-500">{item.timestamp}</div>
                                    <div className={`text-xs mt-1 ${item.report.status === 'suspicious' ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                                        AI Status: {item.report.status.toUpperCase()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Detail Column */}
                <div className="bg-white p-6 rounded-lg shadow col-span-2 h-[80vh] overflow-y-auto">
                    {selectedCase ? (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Case #{selectedCase.case_id}</h2>
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Pending Review</span>
                            </div>

                            <div className="bg-gray-100 p-4 rounded mb-6">
                                <h3 className="font-semibold mb-2">AI Report</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-600 block text-sm">Confidence Score</span>
                                        <span className="text-lg font-bold">{selectedCase.report.confidence_score}%</span>
                                    </div>
                                    <div>
                                         <span className="text-gray-600 block text-sm">Issues Found</span>
                                         <span className="text-red-600 font-medium">{selectedCase.report.issues.length}</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold">Detected Issues:</h4>
                                    <ul className="list-disc pl-5 mt-1 text-red-600 text-sm">
                                        {selectedCase.report.issues.map((issue, i) => (
                                            <li key={i}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold mb-2">Extracted Text Preview</h3>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                                    {selectedCase.report.extracted_text || "No text extracted"}...
                                </p>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button 
                                    onClick={() => handleDecision(selectedCase.case_id, 'approve')}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold"
                                >
                                    ✅ Approve Document
                                </button>
                                <button 
                                    onClick={() => handleDecision(selectedCase.case_id, 'reject')}
                                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold"
                                >
                                    ❌ Reject Document
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select a case to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifierDashboard;
