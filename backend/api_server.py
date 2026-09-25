from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import subprocess
import os
import sys
import base64
import json
try:
    from dotenv import load_dotenv
    # Load .env from backend directory or project root
    load_dotenv()
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
except ImportError:
    pass

try:
    from google import genai
except ImportError:
    genai = None

app = FastAPI(title="AlgoGuard AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local Next.js dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static folder exists
if not os.path.exists("static"):
    os.makedirs("static")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "AlgoGuard AI API"}

@app.post("/api/analyze")
async def analyze(
    target_col: str = Form(None),
    Target: str = Form(None),
    sensitive_col: str = Form(None),
    Gender: str = Form(None),
    gemini_api_key: str = Form(None),
    language: str = Form("English"),
    file: UploadFile = File(None)
):
    try:
        try:
            load_dotenv(override=True)
            load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"), override=True)
        except Exception:
            pass

        resolved_target = target_col or Target or "Loan_Status"
        resolved_sensitive = sensitive_col or Gender or "Gender"
        effective_gemini_key = (gemini_api_key.strip() if gemini_api_key and gemini_api_key.strip() else None) or os.getenv("GEMINI_API_KEY")
        if effective_gemini_key:
            effective_gemini_key = effective_gemini_key.strip()

        csv_path = "data.csv"
        # Handle uploaded file
        if file and file.filename:
            temp_csv = "uploaded_data.csv"
            with open(temp_csv, "wb") as f:
                content = await file.read()
                f.write(content)
            csv_path = temp_csv

        # Remove old output images so we don't serve stale data on error
        for img in ["metrics_tradeoff.png", "structural_bias.png"]:
            if os.path.exists(img):
                os.remove(img)

        # Run pipeline via safely resolving python executable
        python_cmd = sys.executable
        cmd = [python_cmd, "ml_pipeline.py", "--csv", csv_path, "--target_col", resolved_target, "--sensitive_col", resolved_sensitive]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)

        # Read generated images
        metrics_b64 = ""
        struct_b64 = ""

        if os.path.exists("metrics_tradeoff.png"):
            with open("metrics_tradeoff.png", "rb") as img_f:
                metrics_b64 = base64.b64encode(img_f.read()).decode('utf-8')
        
        if os.path.exists("structural_bias.png"):
            with open("structural_bias.png", "rb") as img_f:
                struct_b64 = base64.b64encode(img_f.read()).decode('utf-8')

        # Generate Gemini AI Ethics Report
        ai_report = ""
        if effective_gemini_key and genai and os.path.exists("metrics.json"):
            try:
                with open("metrics.json", "r") as f:
                    metrics_data = json.load(f)
                
                # We extract the last mitigation results (e.g. Reweighting or Re-sampling)
                final_technique = list(metrics_data.keys())[-1]
                final_stats = metrics_data[final_technique]
                
                prompt = (
                    f"Act as an AI Ethics Officer. You are reviewing the results of a bias mitigation pipeline on a dataset. "
                    f"The final model achieved an Accuracy of {final_stats['accuracy']:.4f}, a Statistical Parity Difference (SPD) of {final_stats['spd']:.4f}, "
                    f"and an Equal Opportunity Difference (EOD) of {final_stats['eod']:.4f}. "
                    f"(Ideal SPD/EOD is 0, acceptable is between -0.1 and 0.1). "
                    f"Provide a concise, 3-4 sentence professional summary of whether this model is fair to deploy. "
                    f"IMPORTANT: You MUST write your final response exclusively in {language}."
                )
                
                client = genai.Client(api_key=effective_gemini_key)
                candidate_models = ['gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite']
                ai_response = None
                last_err = None
                for m in candidate_models:
                    try:
                        ai_response = client.models.generate_content(
                            model=m,
                            contents=prompt
                        )
                        if ai_response and ai_response.text:
                            ai_report = ai_response.text
                            break
                    except Exception as model_err:
                        last_err = model_err
                        continue

                if not ai_report and last_err:
                    raise last_err
            except Exception as e:
                ai_report = f"⚠ Could not generate AI report: {str(e)}"

        return JSONResponse(content={
            "status": "success",
            "stdout": result.stdout,
            "metrics_image": metrics_b64,
            "structural_image": struct_b64,
            "ai_report": ai_report
        })

    except subprocess.CalledProcessError as e:
        return JSONResponse(status_code=500, content={
            "status": "error",
            "stderr": e.stderr,
            "stdout": e.stdout
        })
    except Exception as e:
         return JSONResponse(status_code=500, content={"status": "error", "stderr": str(e)})

# Mount the static directory to serve CSS/JS from it
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_index():
    if os.path.exists("index.html"):
        with open("index.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>index.html not found!</h1>")
