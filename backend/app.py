from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# -------------------------
# Pydantic Models
# -------------------------

class TESSRecord(BaseModel):
    id: int
    planet_name: str
    period_days: float
    radius_re: float
    st_teff_k: Optional[float] = None
    st_mass_ms: Optional[float] = None

class KeplerRecord(BaseModel):
    kepid: int
    kepoi_name: str
    disposition: str
    koi_period: float
    koi_score: Optional[float] = None

class K2Record(BaseModel):
    id: int
    host_name: str
    period_days: float
    radius_re: float
    teq_k: Optional[float] = None

# -------------------------
# Endpoints
# -------------------------

@app.post("/tess")
async def post_tess(records: List[TESSRecord]):
    # Example: return count + data
    return {"dataset": "TESS", "count": len(records), "records": records}

@app.post("/kepler")
async def post_kepler(records: List[KeplerRecord]):
    return {"dataset": "Kepler", "count": len(records), "records": records}

@app.post("/k2")
async def post_k2(records: List[K2Record]):
    return {"dataset": "K2", "count": len(records), "records": records}
