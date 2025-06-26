from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os
import google.generativeai as genai
from google.cloud import speech
from gtts import gTTS
import tempfile
import json
from dotenv import load_dotenv
import requests
from supabase import create_client, Client
import pyotp
import secrets
import time

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

# Initialize Supabase client (optional for now)
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize Supabase client: {e}")
        supabase = None
else:
    print("⚠️ Warning: SUPABASE_URL and SUPABASE_ANON_KEY not set. Using local database only.")

# Database Configuration - Support for both local and cloud databases
DATABASE_TYPE = os.getenv('DATABASE_TYPE', 'supabase')  # 'local', 'supabase', 'postgresql', 'mysql'

if DATABASE_TYPE == 'local':
    DB_PATH = 'chat_history.db'
    print("✅ Using local SQLite database")
elif DATABASE_TYPE == 'supabase':
    # Use full DATABASE_URL - this is the recommended approach
    DB_URL = os.getenv('DATABASE_URL')
    print("Loaded DB_URL:", DB_URL)
    if not DB_URL:
        raise ValueError("DATABASE_URL environment variable is required for Supabase. Please set it to your Supabase connection string.")
    print("✅ Using DATABASE_URL for Supabase connection")
elif DATABASE_TYPE == 'sqlite_cloud':
    # For services like Turso, Neon, or Supabase
    DB_URL = os.getenv('DATABASE_URL')
    if not DB_URL:
        raise ValueError("DATABASE_URL environment variable is required for cloud database")
    else:
        DB_PATH = DB_URL
else:
    # For PostgreSQL/MySQL
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'translation_app')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')

# OTP Configuration
OTP_SECRET = os.getenv('OTP_SECRET', secrets.token_hex(32))
OTP_EXPIRY = 300  # 5 minutes in seconds

# OTP Storage (in production, use Redis or database)
otp_storage = {}

def generate_otp():
    """Generate a 6-digit OTP"""
    return pyotp.TOTP(OTP_SECRET).now()

def verify_otp(email, otp):
    """Verify OTP for email"""
    if email not in otp_storage:
        return False
    
    stored_otp, timestamp = otp_storage[email]
    if time.time() - timestamp > OTP_EXPIRY:
        del otp_storage[email]
        return False
    
    if stored_otp == otp:
        del otp_storage[email]
        return True
    
    return False

def store_otp(email, otp):
    """Store OTP with timestamp"""
    otp_storage[email] = (otp, time.time())

# Use gemini-2.0-flash model
try:
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')
except Exception as e:
    print(f"Warning: Could not initialize Gemini model: {e}")
    model = None

# Supported languages mapping
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese (Simplified)',
    'zh-tw': 'Chinese (Traditional)',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'ur': 'Urdu',
    'bn': 'Bengali',
    'tr': 'Turkish',
    'nl': 'Dutch',
    'pl': 'Polish',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'cs': 'Czech',
    'hu': 'Hungarian',
    'ro': 'Romanian',
    'bg': 'Bulgarian',
    'hr': 'Croatian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'mt': 'Maltese',
    'el': 'Greek',
    'he': 'Hebrew',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'ms': 'Malay',
    'tl': 'Filipino',
    'fa': 'Persian',
    'uk': 'Ukrainian',
    'be': 'Belarusian',
    'ka': 'Georgian',
    'hy': 'Armenian',
    'az': 'Azerbaijani',
    'kk': 'Kazakh',
    'ky': 'Kyrgyz',
    'uz': 'Uzbek',
    'tg': 'Tajik',
    'mn': 'Mongolian',
    'ne': 'Nepali',
    'si': 'Sinhala',
    'my': 'Burmese',
    'km': 'Khmer',
    'lo': 'Lao',
    'am': 'Amharic',
    'sw': 'Swahili',
    'yo': 'Yoruba',
    'ig': 'Igbo',
    'ha': 'Hausa',
    'zu': 'Zulu',
    'af': 'Afrikaans',
    'is': 'Icelandic',
    'ga': 'Irish',
    'cy': 'Welsh',
    'eu': 'Basque',
    'ca': 'Catalan',
    'gl': 'Galician',
    'sq': 'Albanian',
    'mk': 'Macedonian',
    'sr': 'Serbian',
    'bs': 'Bosnian',
    'me': 'Montenegrin'
}

def get_db_connection():
    """Get database connection based on configuration"""
    try:
        if DATABASE_TYPE == 'local':
            return sqlite3.connect(DB_PATH)
        elif DATABASE_TYPE == 'supabase':
            import psycopg2
            db_url = os.getenv('DATABASE_URL')
            print(f"🔗 Connecting to database using DATABASE_URL: {db_url}")
            if db_url:
                return psycopg2.connect(db_url)
            else:
                raise ValueError("DATABASE_URL environment variable is required for Supabase connection")
        elif DATABASE_TYPE == 'sqlite_cloud':
            # For cloud SQLite services
            return sqlite3.connect(DB_PATH)
        elif DATABASE_TYPE == 'postgresql':
            import psycopg2
            return psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME', 'translation_app'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', '')
            )
        elif DATABASE_TYPE == 'mysql':
            import mysql.connector
            return mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '3306'),
                database=os.getenv('DB_NAME', 'translation_app'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', '')
            )
        else:
            raise ValueError(f"Unsupported database type: {DATABASE_TYPE}")
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        print(f"📊 Database type: {DATABASE_TYPE}")
        raise e

def init_db():
    """Initialize database with proper schema"""
    if DATABASE_TYPE == 'supabase':
        # Supabase handles schema creation through migrations
        # You can create tables through Supabase dashboard or SQL editor
        pass
    else:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if DATABASE_TYPE in ['local', 'sqlite_cloud']:
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS chat_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    original_text TEXT NOT NULL,
                    translated_text TEXT NOT NULL,
                    input_language TEXT NOT NULL,
                    output_language TEXT NOT NULL,
                    audio_path TEXT
                )
            ''')
        elif DATABASE_TYPE == 'postgresql':
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS chat_history (
                    id SERIAL PRIMARY KEY,
                    date TEXT NOT NULL,
                    original_text TEXT NOT NULL,
                    translated_text TEXT NOT NULL,
                    input_language TEXT NOT NULL,
                    output_language TEXT NOT NULL,
                    audio_path TEXT
                )
            ''')
        elif DATABASE_TYPE == 'mysql':
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS chat_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    date TEXT NOT NULL,
                    original_text TEXT NOT NULL,
                    translated_text TEXT NOT NULL,
                    input_language TEXT NOT NULL,
                    output_language TEXT NOT NULL,
                    audio_path TEXT
                )
            ''')
        
        conn.commit()
        conn.close()

# Initialize database if it doesn't exist (for local SQLite)
if DATABASE_TYPE == 'local' and not os.path.exists(DB_PATH):
    init_db()
elif DATABASE_TYPE != 'local':
    # For cloud databases, always try to initialize
    init_db()

def translate_text(text, input_language, output_language):
    try:
        # Use Gemini 2.0 Flash API directly
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GOOGLE_API_KEY}"
        headers = {
            "Content-Type": "application/json"
        }
        
        # Create a prompt for medical translation
        prompt = f"""Translate the following medical text from {SUPPORTED_LANGUAGES[input_language]} to {SUPPORTED_LANGUAGES[output_language]}. 
        Maintain medical terminology accuracy and consider healthcare context and medicines or different conditions. Wear your doctor listening hat but do not change the terms or anything:
        
        Text: {text}
        
        Provide only the translation without any additional explanation."""
        
        data = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            # Extract the translated text from the response
            if 'candidates' in result and len(result['candidates']) > 0:
                translated_text = result['candidates'][0]['content']['parts'][0]['text']
                return translated_text.strip()
            else:
                raise Exception("No translation result received")
        else:
            raise Exception(f"API Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        raise Exception(f"Translation error: {str(e)}")

def speech_to_text(audio_file):
    try:
        # Initialize the Google Cloud Speech client
        client = speech.SpeechClient()

        # Read the audio file
        with open(audio_file, "rb") as audio_file:
            content = audio_file.read()

        # Configure the audio and recognition settings
        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="en-US",  # This will be overridden by the input_language parameter
        )

        # Perform the transcription
        response = client.recognize(config=config, audio=audio)
        
        # Get the transcribed text
        text = ""
        for result in response.results:
            text += result.alternatives[0].transcript

        return text
    except Exception as e:
        raise Exception(f"Speech recognition error: {str(e)}")

def text_to_speech(text, language):
    try:
        tts = gTTS(text=text, lang=language, slow=False)
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        tts.save(temp_file.name)
        return temp_file.name
    except Exception as e:
        raise Exception(f"Text-to-speech error: {str(e)}")

def call_gemini(prompt, api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        print("Error:", response.status_code, response.text)
        return None

@app.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        text = data.get('text')
        input_language = data.get('inputLanguage')
        output_language = data.get('outputLanguage')

        if not text or not input_language or not output_language:
            return jsonify({'error': 'Missing required fields'}), 400

        if input_language not in SUPPORTED_LANGUAGES or output_language not in SUPPORTED_LANGUAGES:
            return jsonify({'error': 'Unsupported language'}), 400

        translated_text = translate_text(text, input_language, output_language)
        
        # Generate audio for translated text
        audio_path = text_to_speech(translated_text, output_language)

        # Store in database
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if DATABASE_TYPE == 'supabase':
                cursor.execute('''
                    INSERT INTO chat_history (date, original_text, translated_text, input_language, output_language, audio_path)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (datetime.now().isoformat(), text, translated_text, input_language, output_language, audio_path))
            else:
                cursor.execute('''
                    INSERT INTO chat_history (date, original_text, translated_text, input_language, output_language, audio_path)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (datetime.now().isoformat(), text, translated_text, input_language, output_language, audio_path))
            conn.commit()

        return jsonify({
            'translated_text': translated_text,
            'audio_path': audio_path
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/speech-to-text', methods=['POST'])
def handle_speech_to_text():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']
        input_language = request.form.get('inputLanguage', 'en')

        if input_language not in SUPPORTED_LANGUAGES:
            return jsonify({'error': 'Unsupported language'}), 400

        # Save the audio file temporarily
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        audio_file.save(temp_audio.name)
        
        # Convert speech to text using Google Cloud Speech-to-Text
        client = speech.SpeechClient()
        
        # Read the audio file
        with open(temp_audio.name, "rb") as audio_file:
            content = audio_file.read()

        # Configure the audio and recognition settings
        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code=input_language,  # Use the input language from the request
        )

        # Perform the transcription
        response = client.recognize(config=config, audio=audio)
        
        # Get the transcribed text
        text = ""
        for result in response.results:
            text += result.alternatives[0].transcript
        
        # Clean up temporary file
        os.unlink(temp_audio.name)
        
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/audio/<path:filename>')
def get_audio(filename):
    try:
        return send_file(filename, mimetype='audio/mpeg')
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/languages', methods=['GET'])
def get_languages():
    return jsonify(SUPPORTED_LANGUAGES)

@app.route('/history', methods=['GET'])
def get_history():
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM chat_history ORDER BY date DESC')
            rows = cursor.fetchall()
            history = [
                {
                    'id': row[0],
                    'date': row[1],
                    'original_text': row[2],
                    'translated_text': row[3],
                    'input_language': row[4],
                    'output_language': row[5],
                    'audio_path': row[6]
                } for row in rows
            ]
        return jsonify(history)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Authentication Routes
@app.route('/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not password or not name:
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if Supabase is available
        if not supabase:
            return jsonify({'error': 'Authentication service not available. Please check Supabase configuration.'}), 503

        # Check if user already exists
        try:
            existing_user = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return jsonify({'error': 'User already exists'}), 400
        except:
            pass

        # Create user in Supabase
        try:
            user_response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "name": name
                    }
                }
            })

            if user_response.user:
                # Generate and store OTP
                otp = generate_otp()
                store_otp(email, otp)
                
                # In production, send OTP via email/SMS
                # For now, we'll return it in response (for testing)
                return jsonify({
                    'message': 'User created successfully. Please verify your email with OTP.',
                    'otp': otp,  # Remove this in production
                    'user_id': user_response.user.id
                })
            else:
                return jsonify({'error': 'Failed to create user'}), 500
        except Exception as e:
            return jsonify({'error': f'Failed to create user: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Missing required fields'}), 400

        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if auth_response.user:
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': auth_response.user.id,
                    'email': auth_response.user.email,
                    'name': auth_response.user.user_metadata.get('name', '')
                },
                'access_token': auth_response.session.access_token
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/verify-otp', methods=['POST'])
def verify_otp_route():
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')

        if not email or not otp:
            return jsonify({'error': 'Missing required fields'}), 400

        if verify_otp(email, otp):
            return jsonify({'message': 'OTP verified successfully'})
        else:
            return jsonify({'error': 'Invalid or expired OTP'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/resend-otp', methods=['POST'])
def resend_otp():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        # Generate new OTP
        otp = generate_otp()
        store_otp(email, otp)
        
        # In production, send OTP via email/SMS
        return jsonify({
            'message': 'OTP sent successfully',
            'otp': otp  # Remove this in production
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/logout', methods=['POST'])
def logout():
    try:
        # Get the access token from headers
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            # Sign out from Supabase
            supabase.auth.sign_out()
            return jsonify({'message': 'Logged out successfully'})
        else:
            return jsonify({'error': 'No valid token provided'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/update', methods=['POST'])
def update_user():
    try:
        data = request.get_json()
        email = data.get('email')
        name = data.get('name')
        password = data.get('password')
        if not email:
            return jsonify({'error': 'Email is required to update user.'}), 400
        if not supabase:
            return jsonify({'error': 'Supabase client not configured.'}), 500

        # Find user by email
        try:
            # First try to get the user from the token in the Authorization header
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                # Get user from token
                user_response = supabase.auth.get_user(token)
                if user_response and hasattr(user_response, 'user'):
                    user = user_response.user
                    user_id = user.id
                else:
                    return jsonify({'error': 'Invalid token or user not found.'}), 401
            else:
                # If no token, try to find user by email using sign_in method
                # This is a fallback and less secure approach
                return jsonify({'error': 'Authorization token required.'}), 401
        except Exception as auth_error:
            return jsonify({'error': f'Authentication error: {str(auth_error)}'}), 401

        # Prepare update payload
        update_payload = {}
        if name:
            update_payload['user_metadata'] = {'name': name}
        if email:
            update_payload['email'] = email
        if password:
            update_payload['password'] = password

        # Update user
        result = supabase.auth.admin.update_user_by_id(user_id, update_payload)
        if hasattr(result, 'user') or (isinstance(result, dict) and result.get('user')):
            return jsonify({'success': True, 'user': result.user if hasattr(result, 'user') else result.get('user')})
        else:
            return jsonify({'error': 'Failed to update user.'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/test-db', methods=['GET'])
def test_database():
    """Test database connection"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT version()')
            version = cursor.fetchone()
            return jsonify({
                'status': 'success',
                'message': 'Database connection successful',
                'database_type': DATABASE_TYPE,
                'version': version[0] if version else 'Unknown'
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Database connection failed: {str(e)}',
            'database_type': DATABASE_TYPE,
            'config': {
                'host': DB_HOST if 'DB_HOST' in globals() else 'N/A',
                'port': DB_PORT if 'DB_PORT' in globals() else 'N/A',
                'database': DB_NAME if 'DB_NAME' in globals() else 'N/A',
                'user': DB_USER if 'DB_USER' in globals() else 'N/A',
                'password_set': bool(DB_PASSWORD) if 'DB_PASSWORD' in globals() else False
            }
        }), 500

@app.route('/test-config', methods=['GET'])
def test_config():
    """Test route to check configuration"""
    config = {
        'database_type': DATABASE_TYPE,
        'supabase_configured': supabase is not None,
        'supabase_url_set': bool(SUPABASE_URL),
        'supabase_key_set': bool(SUPABASE_KEY),
        'gemini_key_set': bool(GOOGLE_API_KEY),
        'db_password_set': bool(os.getenv('DB_PASSWORD')),
        'environment_variables': {
            'DATABASE_TYPE': DATABASE_TYPE,
            'DB_HOST': os.getenv('DB_HOST'),
            'DB_PORT': os.getenv('DB_PORT'),
            'DB_NAME': os.getenv('DB_NAME'),
            'DB_USER': os.getenv('DB_USER'),
            'DB_PASSWORD': '***SET***' if os.getenv('DB_PASSWORD') else '***NOT SET***'
        }
    }
    return jsonify(config)

if __name__ == '__main__':
    app.run(debug=True)