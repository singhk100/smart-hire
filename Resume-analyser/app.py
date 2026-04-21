# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

# Use a zero-shot classification model for matching
nlp = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

class ScoreRequest(BaseModel):
    resume_text: str
    job_description: str

@app.post("/score_match")
async def score_match(req: ScoreRequest):
    # Compare resume against job description
    result = nlp(req.resume_text, candidate_labels=[req.job_description])
    score = int(result['scores'][0] * 100)
    return {"score": score}
