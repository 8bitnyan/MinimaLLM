from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from typing import Optional
import os
import json

from app.routes import chat, file_upload

app = FastAPI(title="minimaLLM API", description="Backend for minimaLLM chat application")

# Enable CORS for Flutter app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)
app.include_router(file_upload.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to minimaLLM API", "status": "online"}

# For direct execution during development
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 