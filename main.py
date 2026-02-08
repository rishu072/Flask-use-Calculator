import os
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    """Render the calculator homepage."""
    return render_template("index.html")

@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors with a custom page."""
    return render_template("404.html"), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors."""
    return "Internal Server Error", 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() == "true"
    app.run(host='0.0.0.0', port=port, debug=debug_mode)