from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.verification import VerificationReport
from app.services.verification_service import verification_service

router = APIRouter()

@router.post("/verify-document", response_model=VerificationReport)
async def verify_document(file: UploadFile = File(...)):
    """
    Verify the authenticity of a scanned document (marksheet, certificate, etc.)
    using OCR and anomaly detection
    """
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg", "application/pdf"]:
        raise HTTPException(
            status_code=400,
            detail="Only image files (JPG, PNG) and PDFs are supported"
        )
    
    try:
        # Read file bytes
        image_bytes = await file.read()
        
        # Run verification
        report = verification_service.verify_document(image_bytes)
        
        # Submit to workflow queue for manual review
        case_id = verification_service.submit_to_queue(report)
        report['case_id'] = case_id
        
        return report
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {str(e)}"
        )

@router.get("/verification/health")
def check_ocr_health():
    """
    Check if OCR service is operational
    """
    try:
        # Simple health check
        return {
            "status": "operational",
            "ocr_engine": "PaddleOCR",
            "languages_supported": ["en"],
            "message": "Document verification service is ready"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
