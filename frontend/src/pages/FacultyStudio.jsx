import React, { useState } from 'react';
import axios from 'axios';

const FacultyStudio = () => {
    const [directory, setDirectory] = useState("");
    const [status, setStatus] = useState(null);

    const handleTrigger = async () => {
        if (!directory) return;
        try {
            setStatus("initializing");
            const res = await axios.post('http://localhost:8000/api/v1/admin/auto-learn/trigger', {
                directory_path: directory
            });
            setStatus("success");
            alert(`Auto-learning started for ${directory}`);
        } catch (err) {
            console.error(err);
            setStatus("error");
            alert("Failed to trigger auto-learning");
        }
    };

    return (
        <div className="min-h-screen bg-indigo-50 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold text-indigo-900 mb-2">👩‍🏫 Faculty Content Studio</h1>
                    <p className="text-indigo-600 text-lg">Upload notes, train the AI, and manage course knowledge.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Auto-Learning Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-100 p-3 rounded-lg">
                                <span className="text-2xl">🤖</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Auto-Learning Engine</h2>
                        </div>
                        
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Point Dabba AI to a server directory containing your PDF notes/slides. 
                            The system will automatically ingest, chunk, and learn everything inside.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Server Directory Path</label>
                                <input 
                                    type="text" 
                                    placeholder="/path/to/course/materials"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    value={directory}
                                    onChange={(e) => setDirectory(e.target.value)}
                                />
                            </div>
                            
                            <button 
                                onClick={handleTrigger}
                                disabled={status === 'initializing'}
                                className={`w-full py-3 px-6 rounded-lg font-bold text-white shadow-md transition transform hover:-translate-y-0.5 ${
                                    status === 'initializing' ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {status === 'initializing' ? 'Starting Engine...' : '🚀 Start Auto-Learning'}
                            </button>
                            
                            {status === 'success' && (
                                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 mt-4">
                                    ✅ Engine started successfully! Check Admin Console for progress.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manual Upload Card (Mock) */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 opacity-75 relative overflow-hidden">
                         <div className="absolute top-4 right-4 bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded">COMING SOON</div>
                        <div className="flex items-center gap-3 mb-6">
                             <div className="bg-green-100 p-3 rounded-lg">
                                <span className="text-2xl">📄</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Direct Upload</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Drag and drop individual files here to add them to a specific course topic instantly.
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center text-gray-400">
                            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <span>Drag files to upload</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyStudio;
