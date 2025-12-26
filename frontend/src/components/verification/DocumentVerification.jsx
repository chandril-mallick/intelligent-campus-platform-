import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, Loader2, Shield, Eye } from 'lucide-react';

const DocumentVerification = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setVerificationResult(null);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVerify = async () => {
        if (!selectedFile) return;

        setIsVerifying(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:8000/api/v1/verification/verify-document', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            setVerificationResult(result);
        } catch (error) {
            console.error('Verification error:', error);
            setVerificationResult({
                status: 'error',
                confidence_score: 0,
                issues: ['Failed to connect to verification service'],
                extracted_text: ''
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'verified':
                return <CheckCircle className="h-8 w-8 text-green-500" />;
            case 'suspicious':
                return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
            case 'error':
                return <XCircle className="h-8 w-8 text-red-500" />;
            default:
                return <FileText className="h-8 w-8 text-slate-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'suspicious':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-slate-50 border-slate-200 text-slate-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-accent mr-2" />
                <h2 className="text-2xl font-bold text-slate-900">Document Verification</h2>
            </div>
            <p className="text-slate-600 mb-6">
                Upload scanned documents (marksheets, certificates) to verify their authenticity using AI-powered OCR and fraud detection.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Area */}
                <div>
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${selectedFile ? 'border-accent bg-blue-50' : 'border-slate-300 hover:border-accent'
                            }`}
                    >
                        <input
                            type="file"
                            id="doc-upload"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <label htmlFor="doc-upload" className="cursor-pointer block">
                            {previewUrl ? (
                                <div>
                                    <img
                                        src={previewUrl}
                                        alt="Document preview"
                                        className="max-w-full h-48 mx-auto object-contain rounded mb-4"
                                    />
                                    <p className="text-sm text-slate-600">{selectedFile.name}</p>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                    <p className="text-slate-600 font-medium">Click to upload document</p>
                                    <p className="text-sm text-slate-400 mt-1">JPG, PNG (Max 10MB)</p>
                                </div>
                            )}
                        </label>
                    </div>

                    {selectedFile && (
                        <button
                            onClick={handleVerify}
                            disabled={isVerifying}
                            className="w-full mt-4 bg-accent text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <Shield className="h-5 w-5" />
                                    <span>Verify Document</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Verification Result */}
                <div>
                    {verificationResult ? (
                        <div className="space-y-4">
                            {/* Status Card */}
                            <div className={`p-6 rounded-lg border-2 ${getStatusColor(verificationResult.status)}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(verificationResult.status)}
                                        <div>
                                            <h3 className="font-bold text-lg capitalize">{verificationResult.status}</h3>
                                            <p className="text-sm opacity-75">Confidence: {verificationResult.confidence_score}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mb-4">
                                    <div
                                        className={`h-2 rounded-full transition-all ${verificationResult.status === 'verified' ? 'bg-green-600' :
                                                verificationResult.status === 'suspicious' ? 'bg-yellow-600' : 'bg-red-600'
                                            }`}
                                        style={{ width: `${verificationResult.confidence_score}%` }}
                                    />
                                </div>

                                {/* Issues/Findings */}
                                <div>
                                    <p className="font-semibold mb-2 flex items-center">
                                        <Eye className="h-4 w-4 mr-2" />
                                        Findings:
                                    </p>
                                    <ul className="space-y-1 text-sm">
                                        {verificationResult.issues.map((issue, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>{issue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Extracted Text */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Extracted Text
                                </h4>
                                <p className="text-sm text-slate-600 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                                    {verificationResult.extracted_text || 'No text extracted'}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                                    <p className="text-2xl font-bold text-slate-900">{verificationResult.total_text_blocks}</p>
                                    <p className="text-xs text-slate-500">Text Blocks</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                                    <p className="text-2xl font-bold text-slate-900">{verificationResult.low_confidence_blocks || 0}</p>
                                    <p className="text-xs text-slate-500">Low Confidence</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-center p-8 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">Upload a document to verify</p>
                                <p className="text-sm text-slate-400 mt-1">OCR results will appear here</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentVerification;
