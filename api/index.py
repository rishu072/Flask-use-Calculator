import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, render_template, send_from_directory

# Get the root directory (parent of api folder)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Configure Flask for Vercel deployment
app = Flask(__name__, 
            static_folder=os.path.join(ROOT_DIR, 'static'),
            template_folder=os.path.join(ROOT_DIR, 'templates'))

@app.route("/")
def home():
    """Render the calculator homepage."""
    return render_template("index.html")

@app.route("/static/<path:filename>")
def serve_static(filename):
    """Serve static files."""
    return send_from_directory(os.path.join(ROOT_DIR, 'static'), filename)

@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors with a custom page."""
    return render_template("404.html"), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors."""
    return "Internal Server Error", 500

# Vercel needs this
if __name__ == "__main__":
    app.run(debug=True)
