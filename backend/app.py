from fastapi import FastAPI
from pydantic import BaseModel, Field
from lightgbm import LGBMClassifier
import pandas as pd
import numpy as np
import joblib
import os
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Pydantic Model
# -------------------------
class ExoplanetData(BaseModel):
    period_days: float = Field(..., description="Orbital period in days")
    duration_hours: float = Field(..., description="Transit duration in hours")
    depth_ppm: float = Field(..., description="Transit depth in parts per million")
    ror: float = Field(..., description="Radius ratio (planet/star)")
    radius_re: float = Field(..., description="Planet radius in Earth radii")
    insolation_se: float = Field(..., description="Insolation flux (Earth=1)")
    teq_k: float = Field(..., description="Equilibrium temperature in Kelvin")
    st_teff_k: float = Field(..., description="Stellar effective temperature in Kelvin")
    st_logg_cgs: float = Field(..., description="Stellar surface gravity (cgs)")
    st_rad_re: float = Field(..., description="Stellar radius in solar radii")

# -------------------------
# Class map + model
# -------------------------
class_map = {0: "FALSE POSITIVE", 1: "CONFIRMED"}
model = joblib.load("model/exo_lgbm_binary.joblib")

# -------------------------
# Feature Engineering
# -------------------------
def engineer_features(X):
    """Enhanced feature engineering with more sophisticated features"""

    # Original features
    if 'depth_ppm' in X.columns:
        X['depth_ratio'] = X['depth_ppm'] / 1e6
    if 'st_rad_re' in X.columns and 'radius_re' in X.columns:
        X['st_rad_rj'] = X['st_rad_re'] / 11.2
        X['ror_check'] = X['radius_re'] / (X['st_rad_re'] + 1e-9)
    if 'ror' in X.columns and 'ror_check' in X.columns:
        X['ror_diff'] = (X['ror'] - X['ror_check']).abs()
    if 'duration_hours' in X.columns and 'period_days' in X.columns:
        X['duration_fraction'] = X['duration_hours'] / (X['period_days'] * 24 + 1e-9)
    if 'depth_ppm' in X.columns and 'duration_hours' in X.columns:
        X['depth_per_hour'] = X['depth_ppm'] / (X['duration_hours'] + 1e-9)
    if 'teq_k' in X.columns and 'st_teff_k' in X.columns:
        X['teq_ratio'] = X['teq_k'] / (X['st_teff_k'] + 1e-9)
    if 'insolation_se' in X.columns and 'st_rad_re' in X.columns:
        X['insolation_scaled'] = X['insolation_se'] / (X['st_rad_re']**2 + 1e-6)
    if 'period_days' in X.columns:
        X['log_period'] = np.log1p(X['period_days'])

    # NEW: Advanced features
    # Transit depth consistency
    if 'radius_re' in X.columns and 'st_rad_re' in X.columns and 'depth_ppm' in X.columns:
        X['expected_depth'] = (X['radius_re'] / (X['st_rad_re'] + 1e-9))**2 * 1e6
        X['depth_anomaly'] = (X['depth_ppm'] - X['expected_depth']).abs() / (X['expected_depth'] + 1e-3)

    # Orbital characteristics
    if 'semi_major_axis_au' in X.columns:
        X['log_semi_major'] = np.log1p(X['semi_major_axis_au'])
    if 'semi_major_axis_au' in X.columns and 'period_days' in X.columns:
        X['orbital_velocity'] = 2 * np.pi * X['semi_major_axis_au'] / (X['period_days'] / 365.25 + 1e-9)

    # Stellar context
    if 'radius_re' in X.columns and 'st_rad_re' in X.columns:
        X['planet_star_radius_ratio'] = X['radius_re'] / (X['st_rad_re'] + 1e-9)
    if 'st_mass_ms' in X.columns and 'st_rad_re' in X.columns:
        X['stellar_density_proxy'] = X['st_mass_ms'] / (X['st_rad_re']**3 + 1e-9)

    # Temperature ratios
    if 'teq_k' in X.columns and 'st_teff_k' in X.columns:
        X['temp_contrast'] = X['teq_k'] / (X['st_teff_k'] + 1e-9)
    if 'teq_k' in X.columns:
        X['log_teq'] = np.log1p(X['teq_k'])

    # Transit geometry
    if 'inclination_deg' in X.columns:
        X['impact_param_proxy'] = X['inclination_deg'] / 90.0
    if 'st_rad_rj' in X.columns and 'semi_major_axis_au' in X.columns:
        X['transit_prob'] = (X['st_rad_rj'] + 1e-9) / (X['semi_major_axis_au'] * 215.032 + 1e-9)  # 215.032 = AU to R_sun

    # Signal strength indicators
    if 'depth_ppm' in X.columns and 'duration_hours' in X.columns:
        X['signal_strength'] = X['depth_ppm'] * np.sqrt(X['duration_hours'])
        X['snr_proxy'] = X['depth_ppm'] / (X['duration_hours'] + 1e-9)

    # Interaction features
    if 'log_period' in X.columns and 'depth_ratio' in X.columns:
        X['period_depth_interaction'] = X['log_period'] * X['depth_ratio']
    if 'radius_re' in X.columns and 'insolation_se' in X.columns:
        X['radius_insolation'] = X['radius_re'] * np.log1p(X['insolation_se'])

    return X

# -------------------------
# Prediction
# -------------------------
@app.post("/api/predict")
async def process_request(planet: ExoplanetData):
    prediction_result = predict_exoplanet(planet)
    return prediction_result

def predict_exoplanet(data: ExoplanetData) -> dict:
    # Convert Pydantic model to DataFrame
    df = pd.DataFrame([data.dict()])

    # Add engineered features
    df = engineer_features(df)

    # Predict class label and probabilities
    prediction_numeric = model.predict(df)[0]
    prediction_proba = model.predict_proba(df)[0]

    return {
        "prediction": class_map[prediction_numeric],
        "probabilities": {
            class_map[0]: float(prediction_proba[0]),
            class_map[1]: float(prediction_proba[1])
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
