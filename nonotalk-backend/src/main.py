import os
import sys
import re
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv
project_root = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(project_root, '.env'))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.chat import chat_bp
from src.routes.tts import tts_bp
from src.routes.static import static_bp
from src.routes.invite import invite_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'nonotalk-secret-key-2025')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Cookies de session cross-site (nécessaire si front et back sont sur des domaines différents)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True

# Force SSL pour Neon (sinon connexion refusée)
if app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgresql"):
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "connect_args": {"sslmode": "require"}
    }

# CORS précis pour origines autorisées (credentials cross-site)
# Exemple d'ENV: FRONTEND_ORIGINS="https://nonotalk-frontend.onrender.com,http://localhost:5173"
frontend_origins_env = os.getenv('FRONTEND_ORIGINS', '')
origins_list = [o.strip() for o in frontend_origins_env.split(',') if o.strip()] or ['http://localhost:5173', 'http://localhost:4173']
# Autoriser dynamiquement les front Render (*.onrender.com) tout en supportant les credentials
render_regex = re.compile(r"^https://.*\.onrender\.com$")
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": origins_list + [render_regex]}})

# Enregistrement des blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(tts_bp, url_prefix='/api')
app.register_blueprint(static_bp, url_prefix='/api')
app.register_blueprint(invite_bp, url_prefix='/api')

# Initialisation de la base de données
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """Point de santé de l'API"""
    return {'status': 'ok', 'message': 'NonoTalk API is running'}, 200

if __name__ == '__main__':
    # threaded=True pour éviter tout blocage et améliorer le flush SSE en dev
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
