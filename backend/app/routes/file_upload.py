from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
import os

from app.utils.file_parser import parse_file

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
    responses={404: {"description": "Not found"}},
)

class UploadResponse(BaseModel):
    filename: str
    text_content: str
    status: str

@router.post("/", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        
        # Save the uploaded file
        file_location = f"uploads/{file.filename}"
        with open(file_location, "wb") as f:
            f.write(await file.read())
        
        # Parse the file to extract text
        text_content = await parse_file(file_location, file.filename)
        
        return UploadResponse(
            filename=file.filename,
            text_content=text_content,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}") 