import subprocess
import sys
import os

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend"))

subprocess.run("npm start", shell=True)
