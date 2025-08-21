from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Athena API", version="1.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# from .api.misinformation import router as misinformation_router
# from .api.education import router as education_router
# app.include_router(misinformation_router, prefix="/api/misinformation", tags=["misinformation"])
# app.include_router(education_router, prefix="/api/education", tags=["education"])

@app.get("/")
async def root():
    return {"message": "Welcome to Athena API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
