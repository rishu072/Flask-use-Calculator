import os
import sys
from pathlib import Path

# Get the root directory (parent of api folder)
ROOT_DIR = Path(__file__).resolve().parent.parent

# Add parent directory to path for imports
sys.path.insert(0, str(ROOT_DIR))

from flask import Flask, render_template, send_from_directory, Response

# Configure Flask for Vercel deployment
app = Flask(__name__, 
            static_folder=str(ROOT_DIR / 'static'),
            template_folder=str(ROOT_DIR / 'templates'))

@app.route("/")
def home():
    """Render the calculator homepage."""
    return render_template("index.html")

@app.route("/static/<path:filename>")
def serve_static(filename):
    """Serve static files."""
    static_dir = ROOT_DIR / 'static'
    return send_from_directory(str(static_dir), filename)

@app.route("/static/style/<path:filename>")
def serve_style(filename):
    """Serve CSS files."""
    style_dir = ROOT_DIR / 'static' / 'style'
    return send_from_directory(str(style_dir), filename)

@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors with a custom page."""
    try:
        return render_template("404.html"), 404
    except:
        return "Page Not Found", 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors."""
    return "Internal Server Error", 500

# Vercel needs the app variable exposed
# This is the WSGI entry point
