import warnings
from typing import Dict, List

# Lazy loading to handle potential dependency issues
_verification_service_instance = None

def get_verification_service():
    """
    Lazy-load the verification service to handle dependency issues gracefully
    """
    global _verification_service_instance
    if _verification_service_instance is None:
        try:
            from paddleocr import PaddleOCR
            import cv2
            import numpy as np
            from PIL import Image
            import io
            
            class DocumentVerificationService:
                def __init__(self):
                    # Initialize PaddleOCR (will download models on first run)
                    self.ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
                    
                def extract_text(self, image_bytes: bytes) -> List[Dict]:
                    """
                    Extract text from image using PaddleOCR
                    Returns list of detected text blocks with coordinates
                    """
                    # Convert bytes to numpy array
                    nparr = np.frombuffer(image_bytes, np.uint8)
                    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    # Run OCR
                    result = self.ocr.ocr(img, cls=True)
                    
                    extracted_data = []
                    if result and result[0]:
                        for line in result[0]:
                            box = line[0]  # Coordinates
                            text_info = line[1]  # (text, confidence)
                            extracted_data.append({
                                'text': text_info[0],
                                'confidence': float(text_info[1]),
                                'bbox': [[int(point[0]), int(point[1])] for point in box]
                            })
                    
                    return extracted_data
                
                def analyze_document_structure(self, extracted_data: List[Dict]) -> Dict:
                    """
                    Analyze document structure and detect anomalies
                    """
                    if not extracted_data:
                        return {
                            'is_valid': False,
                            'confidence': 0.0,
                            'issues': ['No text detected in document']
                        }
                    
                    total_confidence = sum(item['confidence'] for item in extracted_data)
                    avg_confidence = total_confidence / len(extracted_data)
                    
                    issues = []
                    
                    # Check 1: Low confidence text (potential manipulation)
                    low_conf_items = [item for item in extracted_data if item['confidence'] < 0.7]
                    if len(low_conf_items) > len(extracted_data) * 0.3:
                        issues.append(f"High number of low-confidence text blocks ({len(low_conf_items)})")
                    
                    # Check 2: Suspicious keywords
                    all_text = ' '.join([item['text'].lower() for item in extracted_data])
                    suspicious_patterns = ['photoshop', 'edited', 'sample', 'watermark']
                    found_suspicious = [word for word in suspicious_patterns if word in all_text]
                    if found_suspicious:
                        issues.append(f"Suspicious keywords found: {', '.join(found_suspicious)}")
                    
                    # Check 3: Text alignment (basic heuristic)
                    y_coords = [item['bbox'][0][1] for item in extracted_data]
                    if len(set(y_coords)) < len(y_coords) * 0.3:
                        issues.append("Unusual text alignment detected")
                    
                    # Overall assessment
                    is_valid = avg_confidence > 0.75 and len(issues) == 0
                    
                    return {
                        'is_valid': is_valid,
                        'confidence': round(avg_confidence * 100, 2),
                        'total_text_blocks': len(extracted_data),
                        'low_confidence_blocks': len(low_conf_items),
                        'issues': issues if issues else ['Document appears authentic'],
                        'extracted_text': ' '.join([item['text'] for item in extracted_data])
                    }
                
                def verify_document(self, image_bytes: bytes) -> Dict:
                    """
                    Complete verification pipeline
                    """
                    try:
                        # Step 1: Extract text
                        extracted_data = self.extract_text(image_bytes)
                        
                        # Step 2: Analyze structure
                        analysis = self.analyze_document_structure(extracted_data)
                        
                        # Step 3: Generate report
                        report = {
                            'status': 'verified' if analysis['is_valid'] else 'suspicious',
                            'confidence_score': analysis['confidence'],
                            'total_text_blocks': analysis['total_text_blocks'],
                            'low_confidence_blocks': analysis['low_confidence_blocks'],
                            'issues': analysis['issues'],
                            'extracted_text': analysis['extracted_text'][:500],  # First 500 chars
                            'details': extracted_data
                        }
                        
                        return report
                        
                    except Exception as e:
                        return {
                            'status': 'error',
                            'confidence_score': 0.0,
                            'issues': [f'Verification failed: {str(e)}'],
                            'extracted_text': '',
                            'details': []
                        }
            
            _verification_service_instance = DocumentVerificationService()
            
        except Exception as e:
            warnings.warn(f"Failed to initialize DocumentVerificationService: {e}")
            # Return a mock service that always returns an error
            class MockVerificationService:
                def verify_document(self, image_bytes: bytes) -> Dict:
                    return {
                        'status': 'error',
                        'confidence_score': 0.0,
                        'total_text_blocks': 0,
                        'low_confidence_blocks': 0,
                        'issues': ['OCR service not available. Please install required dependencies.'],
                        'extracted_text': '',
                        'details': []
                    }
            _verification_service_instance = MockVerificationService()
    
    return _verification_service_instance

# Create a proxy that lazy-loads the service and handles workflow state
class VerificationQueueItem:
    def __init__(self, case_id: str, report: Dict, status: str = "pending"):
        self.case_id = case_id
        self.report = report
        self.status = status # pending, approved, rejected
        self.timestamp = "now" # In real app use datetime

class VerificationServiceProxy:
    def __init__(self):
        self._queue: List[Dict] = []

    def __getattr__(self, name):
        service = get_verification_service()
        return getattr(service, name)
    
    def submit_to_queue(self, report: Dict) -> str:
        """Add a verification report to the review queue"""
        import uuid
        case_id = str(uuid.uuid4())[:8]
        self._queue.append({
            "case_id": case_id,
            "report": report,
            "status": "pending",
            "timestamp": "Just now"
        })
        return case_id

    def get_pending_cases(self) -> List[Dict]:
        return [item for item in self._queue if item["status"] == "pending"]

    def update_case_status(self, case_id: str, status: str, remarks: str = None) -> bool:
        for item in self._queue:
            if item["case_id"] == case_id:
                item["status"] = status
                item["remarks"] = remarks
                return True
        return False

verification_service = VerificationServiceProxy()
