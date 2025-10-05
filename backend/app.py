from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional
from lightgbm import LGBMClassifier
import pandas as pd
import joblib
import os
import uvicorn

app = FastAPI()

# -------------------------
# Pydantic Models
# -------------------------

class ExoplanetData(BaseModel):
    mission: str = Field(..., description="Mission name")
    period_days: float = Field(..., description="Orbital period in days")
    t0_bjd: float = Field(..., description="Time of transit center (BJD)")
    duration_hours: float = Field(..., description="Transit duration in hours")
    depth_ppm: float = Field(..., description="Transit depth in parts per million")
    ror: float = Field(..., description="Radius ratio (planet/star)")
    radius_re: float = Field(..., description="Planet radius in Earth radii")
    insolation_se: float = Field(..., description="Insolation flux (Earth=1)")
    teq_k: float = Field(..., description="Equilibrium temperature in Kelvin")
    st_teff_k: float = Field(..., description="Stellar effective temperature in Kelvin")
    st_logg_cgs: float = Field(..., description="Stellar surface gravity (cgs)")
    st_rad_re: float = Field(..., description="Stellar radius in solar radii")

# Map numeric labels to class names
class_map = {0: "FALSE POSITIVE", 1: "CONFIRMED"}

model = joblib.load("lgbm_model.joblib")
# -------------------------
# Endpoints
# -------------------------

@app.post("/predict")
async def process_request(planet: ExoplanetData):
    prediction_result = predict_exoplanet(planet)
    return prediction_result

def predict_exoplanet(data: ExoplanetData) -> dict:
    # Convert Pydantic model to DataFrame
    df = pd.DataFrame([data.dict()])

    # Make prediction
    prediction_proba = model.predict_proba(df)  # probabilities
    # Predict class label and probabilities
    prediction_numeric = model.predict(df)[0]
    prediction_proba = model.predict_proba(df)[0]

    # Map numeric prediction to class name
    prediction_label = class_map[prediction_numeric]

    return {
        "prediction": prediction_label,
        "probabilities": {
            class_map[0]: prediction_proba[0],
            class_map[1]: prediction_proba[1]
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
        log_level="info"
    )