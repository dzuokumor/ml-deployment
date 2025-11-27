import subprocess
import sys
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

venv_python = os.path.join("venv", "Scripts", "python.exe")

if os.path.exists(venv_python):
    python_executable = venv_python
else:
    python_executable = sys.executable

subprocess.run([
    python_executable, "-m", "uvicorn",
    "api.main:app",
    "--reload",
    "--host", "0.0.0.0",
    "--port", "8000"
])
