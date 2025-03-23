from flask import Flask, request, jsonify, send_file, render_template_string, send_from_directory
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, timezone
from flask_cors import CORS
import os
from dotenv import load_dotenv
from flask_mongoengine import MongoEngine
import logging
from bson import ObjectId
from datetime import datetime
import requests
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from flask_bcrypt import Bcrypt
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import json
import tempfile
import secrets
import threading
import time
from werkzeug.utils import secure_filename
import base64
import uuid
from functools import wraps
from cryptography.fernet import Fernet
import traceback
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS globally
# Enable CORS globally for specific origins
# CORS(app, origins=["http://localhost:3106", "https://activity.vnrzone.site"], supports_credentials=True)
CORS(app, supports_credentials=True)
CORS(app, resources={r"/api/*": {"origins": "https://stm24wnz-3106.inc1.devtunnels.ms"}})
bcrypt = Bcrypt(app)  # Initialize Flask-Bcrypt

# MongoDB Configuration
app.config['MONGODB_SETTINGS'] = {
    'host': os.getenv('MONGODB_URI'),
    'db': 'activity_logger'
}

# Initialize MongoDB
db = MongoEngine(app)

# Initialize Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))  # Configure with .env key initially
model = genai.GenerativeModel('gemini-1.5-pro')

# Add this after app initialization
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'your-secret-key-here')

# Initialize encryption
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', Fernet.generate_key().decode())
cipher_suite = Fernet(ENCRYPTION_KEY)

# Verify encryption key consistency
print(f"Current encryption key: {ENCRYPTION_KEY[:6]}...{ENCRYPTION_KEY[-6:]}")

class Activity(db.EmbeddedDocument):
    activity_id = db.StringField(required=True, default=lambda: str(uuid.uuid4()))
    title = db.StringField(required=True)
    activity_type = db.StringField(required=True)  # For compatibility with existing code
    
    description = db.StringField()
    date = db.DateTimeField(default=datetime.utcnow)
    status = db.StringField(default='ongoing')
    source = db.StringField(choices=['manual', 'github', 'leetcode'])
   
    skills = db.ListField(db.StringField())
class Education(db.EmbeddedDocument):
    school = db.StringField(required=True)
    degree = db.StringField(required=True)
    field = db.StringField(required=True)
    start_year = db.StringField(required=True)
    end_year = db.StringField()
    current = db.BooleanField(default=False)
    description = db.StringField()

class Experience(db.EmbeddedDocument):
    company = db.StringField(required=True)
    position = db.StringField(required=True)
    start_date = db.StringField(required=True)
    end_date = db.StringField()
    current = db.BooleanField(default=False)
    description = db.StringField()

class DailyActivity(db.EmbeddedDocument):
    daily_activity_id = db.StringField(required=True, default=lambda: str(uuid.uuid4()))
    title = db.StringField(required=True)
    description = db.StringField()
    date = db.DateTimeField(default=datetime.utcnow)
    skills = db.ListField(db.StringField())

class User(db.Document):
    meta = {
        'collection': 'activity_users',
        'indexes': [
            {'fields': ['email'], 'unique': True},
            {'fields': ['username'], 'unique': True}
        ]
    }
    
    # Basic Info
    email = db.EmailField(required=True, unique=True)
    username = db.StringField(required=True, unique=True)
    password = db.StringField(required=True)  # Store hashed password
    name = db.StringField(required=True)
    
    # Profile Info
    bio = db.StringField(default='')
    location = db.StringField(default='')
    github = db.StringField(default='')
    linkedin = db.StringField(default='')
    skills = db.ListField(db.StringField(), default=list)
    education = db.ListField(db.EmbeddedDocumentField(Education), default=list)
    experience = db.ListField(db.EmbeddedDocumentField(Experience), default=list)
    
    # Activities and Integrations
    activities = db.ListField(db.EmbeddedDocumentField(Activity), default=list)
    github_token = db.StringField()
    leetcode_username = db.StringField()

    # Add daily_activities field
    daily_activities = db.ListField(db.EmbeddedDocumentField(DailyActivity), default=list)

    # Add profile image field
    profile_image = db.StringField(default='')
    profile_image_name = db.StringField(default='')

    # Add Gemini API key field
    gemini_api_key = db.BinaryField()  # Changed from StringField to BinaryField

def encrypt_api_key(api_key: str) -> bytes:
    return cipher_suite.encrypt(api_key.encode())

def decrypt_api_key(encrypted_key: bytes) -> str:
    print(encrypted_key)
    h=cipher_suite.decrypt(encrypted_key).decode()
    print(h)
    return h   
class Resume(db.Document):
    user = db.ReferenceField(User, required=True)
    template_id = db.IntField(required=True)
    type = db.StringField(required=True)  # 'general' or 'specific'
    job_title = db.StringField()
    created_at = db.DateTimeField(default=datetime.utcnow)
    pdf_url = db.StringField()
    generated_content = db.StringField()

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)

# Add cleanup mechanism for resume data store
class ResumeDataStore:
    def __init__(self):
        self.store = {}
        self.lock = threading.Lock()
        self.cleanup_interval = 3600  # 1 hour
        self.data_expiry = 3600  # 1 hour
        self.max_entries = 1000
        self._start_cleanup_thread()

    def _start_cleanup_thread(self):
        def cleanup():
            while True:
                self._cleanup_expired()
                time.sleep(self.cleanup_interval)
        
        thread = threading.Thread(target=cleanup, daemon=True)
        thread.start()

    def _cleanup_expired(self):
        with self.lock:
            now = datetime.utcnow()
            expired = [
                k for k, v in self.store.items()
                if (now - v['timestamp']).total_seconds() > self.data_expiry
            ]
            for key in expired:
                del self.store[key]

    def add(self, data):
        with self.lock:
            if len(self.store) >= self.max_entries:
                oldest = min(self.store.items(), key=lambda x: x[1]['timestamp'])
                del self.store[oldest[0]]
            
            resume_id = secrets.token_urlsafe(16)
            self.store[resume_id] = {
                'data': data,
                'timestamp': datetime.utcnow()
            }
            return resume_id

    def get(self, resume_id):
        with self.lock:
            if resume_id in self.store:
                return self.store[resume_id]['data']
            return None

# Replace global resume_data_store with instance
resume_data_store = ResumeDataStore()

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'username', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Check existing users
        if User.objects(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        if User.objects(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400

        # Hash password using flask-bcrypt
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        # Create user with hashed password
        user = User(
            email=data['email'],
            password=hashed_password,
            username=data['username'],
            name=data['name']
        )
        user.save()

        # Generate token
        token = create_access_token(identity=str(user.id))

        return jsonify({
            'token': token,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'name': user.name
            }
        }), 201

    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Missing email or password'}), 400

        user = User.objects(email=data['email']).first()
        
        if user and bcrypt.check_password_hash(user.password, data['password']):
            token = create_access_token(identity=str(user.id))
            return jsonify({
                'token': token,
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'username': user.username,
                    'name': user.name
                }
            }), 200
        
        return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/add_activity', methods=['POST'])
@jwt_required() # Use jwt_required from flask_jwt_extended
def add_activity():
    try:
        data = request.get_json()
        user_id = get_jwt_identity() # Get user ID from JWT token

        # Validate required fields
        required_fields = ['title', 'activity_type', 'description'] # Updated field names
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Create new Activity document using MongoEngine model
        new_activity = Activity(
            title=data['title'],
            activity_type=data['activity_type'], # Updated field name
            description=data['description'],
            date=datetime.utcnow(), # Default to current time, or get from request if needed
            status=data.get('status', 'ongoing'),
         
            skills=data.get('skills', [])  # Add skills with empty list as default
        )

        # Find the user and append the new activity
        user = User.objects(id=user_id).first() # Find user by ID from JWT
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user.activities.append(new_activity) # Append the MongoEngine Activity object
        user.save() # Save the updated user document

        return jsonify({
            'message': 'Activity added successfully',
            'activity': {
                'title': new_activity.title,
                'activity_type': new_activity.activity_type,
                'description': new_activity.description,
                'status': new_activity.status,
                'skills': new_activity.skills,  # Include skills in response
                'date': new_activity.date
            }
        }), 201

    except Exception as e:
        logger.error(f"Error adding activity: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

# Get user's activities
@app.route('/api/activities', methods=['GET'])
@jwt_required()
def get_user_activities():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        activities = []
        for activity in user.activities:
            activity_data = {
                'activity_id': str(activity.activity_id),
                'title': activity.title,
                'description': activity.description,
                'date': activity.date.isoformat() if activity.date else None,
                'status': activity.status,
                
                'skills': activity.skills,
                'activity_type': activity.activity_type
            }
            activities.append(activity_data)

        return jsonify(activities[::-1]), 200

    except Exception as e:
        logger.error(f"Error fetching activities: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
# Get user's daily activities
@app.route('/api/daily_activities', methods=['GET'])
@jwt_required()
def get_user_daily_activities():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        daily_activities = []
        for daily_activity in user.daily_activities:
            daily_activity_data = {
                'daily_activity_id': str(daily_activity.daily_activity_id),
                'title': daily_activity.title,
                'description': daily_activity.description,
                'date': daily_activity.date.isoformat() if daily_activity.date else None,
                'skills': daily_activity.skills
            }
            daily_activities.append(daily_activity_data)

        return jsonify(daily_activities[::-1]), 200

    except Exception as e:
        logger.error(f"Error fetching in daily activities: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/update_leetcode_data', methods=['POST'])
@jwt_required()
def update_leetcode_data():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        leetcode_username = user.leetcode_username
        if not leetcode_username:
            return jsonify({'error': 'LeetCode username not set'}), 400

        # GraphQL Setup with fetch_schema_from_transport=False as suggested
        transport = RequestsHTTPTransport(
            url='https://leetcode.com/graphql',
            verify=True,
            retries=3,
        )
        client = Client(
            transport=transport,
            fetch_schema_from_transport=False
        )

        # Updated GraphQL Query that works with current LeetCode API
        query = gql("""
            query getUserProfile($username: String!) {
                allQuestionsCount {
                    difficulty
                    count
                }
                matchedUser(username: $username) {
                    username
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                    }
                    profile {
                        ranking
                        reputation
                        starRating
                    }
                }
            }
        """)

        # Execute GraphQL query
        variables = {"username": leetcode_username}
        result = client.execute(query, variable_values=variables)

        if not result or 'matchedUser' not in result:
            return jsonify({'error': 'User not found on LeetCode'}), 404

        # Extract data
        matched_user = result['matchedUser']
        if not matched_user:
            return jsonify({'error': 'Unable to fetch LeetCode data'}), 400

        # Get solved problems count
        solved_problems = 0
        if matched_user.get('submitStats', {}).get('acSubmissionNum'):
            for submission in matched_user['submitStats']['acSubmissionNum']:
                if submission.get('count'):
                    solved_problems += submission['count']

        # Create new activity for LeetCode update
        new_activity = Activity(
            title=f"LeetCode Update for {leetcode_username}",
            activity_type='LeetCode Update',
            description=f"Solved Problems: {solved_problems}",
            date=datetime.utcnow(),
            status='completed',
            leetcode_rating=matched_user.get('profile', {}).get('ranking', 0),
            skills=[]  # Clear skills for new update
        )

        user.activities.append(new_activity)
        user.save()

        return jsonify({
            'message': 'LeetCode data updated successfully',
            'leetcode_rating': matched_user.get('profile', {}).get('ranking', 0),
            'solved_problems': solved_problems,
            'profile': matched_user.get('profile', {})
        }), 200

    except Exception as e:
        logger.error(f"Error updating LeetCode data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/set_leetcode_username', methods=['POST'])
@jwt_required()
def set_leetcode_username():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if 'leetcode_username' not in data:
            return jsonify({'error': 'LeetCode username is required'}), 400
            
        leetcode_username = data['leetcode_username']
        
        # Update user's LeetCode username
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        user.leetcode_username = leetcode_username
        user.save()
        
        return jsonify({
            'message': 'LeetCode username set successfully',
            'leetcode_username': leetcode_username
        }), 200
        
    except Exception as e:
        logger.error(f"Error setting LeetCode username: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/user/leetcode_status/<username>', methods=['GET'])
@jwt_required()
def get_leetcode_status(username):
    try:
        # Find user by username
        user = User.objects(username=username).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if user has LeetCode username set
        if not user.leetcode_username:
            return jsonify({
                'has_leetcode': False,
                'message': 'LeetCode username not set'
            }), 200

        return jsonify({
            'has_leetcode': True,
            'leetcode_username': user.leetcode_username
        }), 200

    except Exception as e:
        logger.error(f"Error checking LeetCode status: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/user/<username>/leetcode_history', methods=['GET'])
@jwt_required()
def get_leetcode_history(username):
    try:
        # Find user by username
        user = User.objects(username=username).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if user has LeetCode username set
        if not user.leetcode_username:
            return jsonify({
                'error': 'LeetCode username not set',
                'needs_setup': True
            }), 400

        # GraphQL Setup
        transport = RequestsHTTPTransport(
            url='https://leetcode.com/graphql',
            verify=True,
            retries=3,
        )
        client = Client(
            transport=transport,
            fetch_schema_from_transport=False
        )

        # Get user profile and submission stats
        profile_query = gql("""
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                    }
                }
            }
        """)

        # Get contest history - simplified
        contest_query = gql("""
            query getUserContestInfo($username: String!) {
                userContestRankingHistory(username: $username) {
                    attended
                    rating
                    ranking
                    contest {
                        title
                        startTime
                    }
                }
            }
        """)

        # Execute both queries
        profile_result = client.execute(profile_query, variable_values={"username": user.leetcode_username})
        contest_result = client.execute(contest_query, variable_values={"username": user.leetcode_username})

        if not profile_result.get('matchedUser'):
            return jsonify({'error': 'LeetCode user not found'}), 404

        # Process submission statistics
        submission_stats = profile_result['matchedUser']['submitStats']['acSubmissionNum']
        difficulty_stats = {stat['difficulty']: stat['count'] for stat in submission_stats}
        
        # Process contest data
        contest_history = []
        if contest_result.get('userContestRankingHistory'):
            for contest in contest_result['userContestRankingHistory']:
                if contest['attended']:
                    contest_history.append({
                        'contest_name': contest['contest']['title'],
                        'date': contest['contest']['startTime'],
                        'rating': contest['rating'],
                        'ranking': contest['ranking']
                    })

        # Prepare response data
        response_data = {
            'leetcode_username': user.leetcode_username,
            'submission_stats': {
                'total': difficulty_stats.get('All', 0),
                'easy': difficulty_stats.get('Easy', 0),
                'medium': difficulty_stats.get('Medium', 0),
                'hard': difficulty_stats.get('Hard', 0)
            },
            'contest_history': contest_history
        }

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Error fetching LeetCode history: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<username>/set_leetcode_username', methods=['POST'])
@jwt_required()
def set_user_leetcode_username(username):
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(username=username).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Verify the requesting user is the same as the target user
        if str(user.id) != current_user_id:
            return jsonify({'error': 'Unauthorized to modify this user'}), 403

        data = request.get_json()
        if 'leetcode_username' not in data:
            return jsonify({'error': 'LeetCode username is required'}), 400
            
        leetcode_username = data['leetcode_username']

        # Verify the LeetCode username exists by making a test query
        transport = RequestsHTTPTransport(
            url='https://leetcode.com/graphql',
            verify=True,
            retries=3,
        )
        client = Client(
            transport=transport,
            fetch_schema_from_transport=False
        )

        test_query = gql("""
            query testUser($username: String!) {
                matchedUser(username: $username) {
                    username
                }
            }
        """)

        try:
            result = client.execute(test_query, variable_values={"username": leetcode_username})
            if not result or not result.get('matchedUser'):
                return jsonify({'error': 'Invalid LeetCode username'}), 400
        except Exception as e:
            return jsonify({'error': 'Could not verify LeetCode username'}), 400
            
        user.leetcode_username = leetcode_username
        user.save()
        
        return jsonify({
            'message': 'LeetCode username set successfully',
            'leetcode_username': leetcode_username
        }), 200
        
    except Exception as e:
        logger.error(f"Error setting LeetCode username: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        profile_data = {
            'name': user.name,
            'bio': user.bio,
            'location': user.location,
            'github': user.github,
            'linkedin': user.linkedin,
            'skills': user.skills,
            'profile_image': user.profile_image,
            'education': [{
                'school': edu.school,
                'degree': edu.degree,
                'field': edu.field,
                'start_year': edu.start_year,
                'end_year': edu.end_year,
                'current': edu.current,
                'description': edu.description
            } for edu in user.education],
            'experience': [{
                'company': exp.company,
                'position': exp.position,
                'start_date': exp.start_date,
                'end_date': exp.end_date,
                'current': exp.current,
                'description': exp.description
            } for exp in user.experience]
        }
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/user/profile', methods=['POST'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        
        # Update basic info
        user.name = data.get('name', user.name)
        user.bio = data.get('bio', user.bio)
        user.location = data.get('location', user.location)
        user.github = data.get('github', user.github)
        user.linkedin = data.get('linkedin', user.linkedin)
        user.skills = data.get('skills', user.skills)

        # Update education
        if 'education' in data:
            user.education = []
            for edu_data in data['education']:
                # Validate required fields
                required_fields = ['school', 'degree', 'field', 'start_year']
                if not all(field in edu_data for field in required_fields):
                    return jsonify({
                        'error': f'Missing required education fields. Required fields are: {", ".join(required_fields)}'
                    }), 400
                
                education = Education(
                    school=edu_data.get('school'),
                    degree=edu_data.get('degree'),
                    field=edu_data.get('field'),
                    start_year=edu_data.get('start_year'),
                    end_year=edu_data.get('end_year', ''),
                    current=edu_data.get('current', False),
                    description=edu_data.get('description', '')
                )
                user.education.append(education)

        # Update experience
        if 'experience' in data:
            user.experience = []
            for exp_data in data['experience']:
                # Validate required fields
                required_fields = ['company', 'position', 'start_date']
                if not all(field in exp_data for field in required_fields):
                    return jsonify({
                        'error': f'Missing required experience fields. Required fields are: {", ".join(required_fields)}'
                    }), 400
                
                experience = Experience(
                    company=exp_data.get('company'),
                    position=exp_data.get('position'),
                    start_date=exp_data.get('start_date'),
                    end_date=exp_data.get('end_date', ''),
                    current=exp_data.get('current', False),
                    description=exp_data.get('description', '')
                )
                user.experience.append(experience)

        # Check if a new profile image is provided
        if 'profile_image' in request.files:
            # Call the upload_profile_image function
            image_response = upload_profile_image()
            if image_response.status_code != 200:
                return image_response

        user.save()
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

def generate_resume_content(resume_data):
    try:
        # Format education entries with proper defaults
        education_entries = []
        for edu in resume_data.get('education', []):
            education_entries.append({
                "degree": edu.get('degree', ''),
                "field": edu.get('field', ''),
                "school": edu.get('school', ''),
                "start_year": edu.get('start_year', ''),
                "end_year": edu.get('end_year', 'Present'),
                "description": edu.get('description', '')
            })

        # Format experience entries with proper defaults
        experience_entries = []
        for exp in resume_data.get('experience', []):
            experience_entries.append({
                "position": exp.get('position', ''),
                "company": exp.get('company', ''),
                "start_date": exp.get('start_date', ''),
                "end_date": exp.get('end_date', 'Present'),
                "description": exp.get('description', '')
            })

        # Format activities with explicit defaults
        activity_entries = []
        for act in resume_data.get('activities', []):
            activity_entries.append({
                "title": act.get('title', ''),
                "description": act.get('description', ''),
                "skills": act.get('skills', []),
                "date": act.get('date', '')
            })
        print(resume_data)

        # Enhanced prompt with explicit structure example
        prompt = f"""Create a professional resume in JSON format with these sections:
        1. basics (must include name, email)
        2. education
        3. experience 
        4. skills
        5. projects
        
        Input Data:
        {{
            "basics": {{
                "name": "{resume_data['user_info']['name']}",
                "email": "{resume_data['user_info']['email']}",
                "location": "{resume_data['user_info'].get('location', '')}",
                "profiles": {{
                    "github": "{resume_data['user_info'].get('github', '')}",
                    "linkedin": "{resume_data['user_info'].get('linkedin', '')}"
                }},
                "summary": "{resume_data['user_info'].get('bio', '')}"
            }},
            "education": {education_entries},
            "experience": {experience_entries},
            "skills": {resume_data.get('skills', [])},
            "projects": {activity_entries}
        }}
        
        Requirements:
        1. Maintain this exact structure as shown in the input data  i repeat.
        2. Improve wording but keep all original data
        3. Output must be valid JSON without markdown
        4. Never omit the basics section
        5. For dates and periods:
   - Use consistent format: YYYY-MM for all dates
   - For ongoing items, use 'Present' consistently"""
        if resume_data.get('job_description'):
            prompt += f"""
            
            Job Requirements to Align With:
            {resume_data['job_description']}
            
            Customization Instructions:
            6. Highlight skills matching the job description
            7. Emphasize relevant experience
            8. Use keywords from the job requirements
            9. Maintain original data integrity
            10.for projects give a tleast 2 lines.
            """
        print(prompt)    
        
   

        # Generate content - fix indentation here
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "max_tokens": 2000
                }
            },
            timeout=60
        )
        
        response.raise_for_status()  # Check for HTTP errors
        response_data = response.json()
        
        # Clean response text
        content = response_data.get("response", "")
        
        # Extract only the JSON content between first { and last }
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1  # +1 to include the closing brace
        
        if start_idx == -1 or end_idx == -1:
            raise ValueError("No valid JSON found in response")
            
        clean_content = content[start_idx:end_idx]
        
        # Remove any remaining markdown formatting
        clean_content = re.sub(r'```json|```', '', clean_content)
        clean_content = clean_content.strip()
            
        parsed_resume=clean_content
        # print("thisss is the thinggg")
        # # parsed_resume="'''"+parsed_resume+"'''"
        # print(parsed_resume)    
        parsed_resume=json.loads(parsed_resume)
        parsed_resume=json.dumps(parsed_resume, indent=4)
        return parsed_resume
    except Exception as e:
        return Exception(" error in parsing resume")
    
def generate_cover_letter_content(job_description, user_data, tone='professional', user_api_key=None):
    """Generate cover letter using Gemini with job description context"""
    try:
        # API key handling same as resume generation
        
        
        prompt = f"""Generate a professional cover letter based on this job description and applicant profile.
        
        Job Description:
        {job_description}

        Applicant Profile:
        - Name: {user_data['name']}
        - Education: {[edu.degree + ' in ' + edu.field for edu in user_data['education']]}
        - Experience: {[exp.position + ' at ' + exp.company for exp in user_data['experience']]}
        - Skills: {user_data['skills']}
        -Projects: {[]}

        Requirements:
        1. Address key requirements from job description
        2. Highlight 3 most relevant qualifications
        3. Use {tone} tone
        4. Keep under 500 words
        5. Use proper business letter format
        
        """
        print(prompt)
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "max_tokens": 2000
                }
            },
            timeout=60
        )
        response_data = response.json()
        
        # Clean response text
        content = response_data.get("response", "")
        return content

    except Exception as e:
        logger.error(f"Cover letter generation error: {str(e)}")
        raise

@app.route('/api/cover_letter/generate', methods=['POST'])
@jwt_required()
def generate_cover_letter():
    try:
        data = request.get_json(force=True)
        required_fields = ['job_description', 'tone']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Prepare user data (removed activities filtering)
        user_data = {
            'name': user.name,
            'education': user.education,
            'experience': user.experience,
            'skills': user.skills,
            'activities':user.activities
        }

        # Generate cover letter
        cover_letter = generate_cover_letter_content(
            job_description=data['job_description'],
            user_data=user_data,
            tone=data['tone'],
            user_api_key=user.gemini_api_key
        )
        

        return jsonify({
            'cover_letter': cover_letter,
            'generated_at': datetime.now().isoformat()
        }), 200

    except Exception as e:
        logger.error(f"Cover letter error: {str(e)}")
        error_msg = 'Cover letter generation failed'
        if "API_KEY_INVALID" in str(e):
            error_msg += ' - Invalid API key'
        return jsonify({'error': error_msg}), 500

@app.route('/api/resume/generate', methods=['POST'])
@jwt_required()
def generate_resume():
    try:
        # Convert datetime objects before serialization
        def convert_dates(activity):
            activity_dict = activity.to_mongo().to_dict()
            for key in ['date']:
                if key in activity_dict and isinstance(activity_dict[key], datetime):
                    activity_dict[key] = activity_dict[key].isoformat()
            return activity_dict

        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check for any available API key (user or .env)
        

        data = request.get_json()
        required_fields = ['template', 'type']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Create new resume document
        resume = Resume(
            user=user,
            template_id=data['template'],
            type=data['type'],
            job_title=data.get('job_title', ''),
            created_at=datetime.utcnow()
        )
        resume.save()

        # Prepare resume data with activities
        resume_data = {
            'user_info': {
                'name': user.name,
                'email': user.email,
                'location': user.location,
                'bio': user.bio,
                'github': user.github,
                'linkedin': user.linkedin,
                'profile_image': user.profile_image
            },
            'education': [convert_dates(edu) for edu in user.education],
            'experience': [convert_dates(exp) for exp in user.experience],
            'skills': user.skills,
            'activities': [convert_dates(act) for act in user.activities]
        }

        # Pass user's API key if available
        generated_resume = generate_resume_content(
            resume_data
        )

        # Parse the generated content
        try:
            resume_json = json.loads(generated_resume)
            
            # Add profile image to resume data if it exists
            # We add this after Gemini generation to avoid sending the image data to the model
            if user.profile_image:
                resume_json['profile_image'] = user.profile_image

            # Update resume with generated content
            resume.generated_content = json.dumps(resume_json)
            resume.save()
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON generated: {str(e)}")
            return jsonify({'error': 'Failed to generate valid resume content'}), 500

        return jsonify({
            'message': 'Resume generated successfully',
            'resume_id': str(resume.id),
            'resume_data': resume_data,
            'generated_content': resume.generated_content,
        }), 201

    except Exception as e:
        logger.error(f"Error generating resume: {str(e)}")
        error_msg = 'Resume generation failed'
        if "API_KEY_INVALID" in str(e):
            error_msg += ' - Invalid API key'
        elif "quota" in str(e).lower():
            error_msg += ' - API quota exceeded'
        return jsonify({'error': error_msg, 'details': str(e)}), 500

@app.route('/api/resumes', methods=['GET'])
@jwt_required()
def get_user_resumes():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        resumes = Resume.objects(user=user).order_by('-created_at')
        resume_list = [{
            'id': str(resume.id),
            'template_id': resume.template_id,
            'type': resume.type,
            'job_title': resume.job_title,
            'created_at': resume.created_at.isoformat(),
            'pdf_url': resume.pdf_url
        } for resume in resumes]

        return jsonify(resume_list), 200

    except Exception as e:
        logger.error(f"Error fetching resumes: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/add_daily_activity', methods=['POST'])
@jwt_required()
def add_daily_activity():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()

        # Validate required fields
        required_fields = ['title', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Create new DailyActivity document
        new_activity = DailyActivity(
            title=data['title'],
            description=data['description'],
            skills=data.get('skills', [])
        )

        # Find the user and append the new daily activity
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user.daily_activities.append(new_activity)
        user.save()

        return jsonify({
            'message': 'Daily activity added successfully',
            'activity': {
                'title': new_activity.title,
                'description': new_activity.description,
                'skills': new_activity.skills,
                'date': new_activity.date
            }
        }), 201

    except Exception as e:
        logger.error(f"Error adding daily activity: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/user/profile_image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    try:
        print("shakalakaboomboom")
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            
            # Read the file and convert it to base64
            file_data = file.read()
            encoded_image = base64.b64encode(file_data).decode('utf-8')
            
            # Get the user ID from the JWT token
            user_id = get_jwt_identity()
            
            # Retrieve the user from the database
            user = User.objects.get(id=user_id)
            
            # Update user's profile image in the database
            user.profile_image = encoded_image
            user.profile_image_name = filename
            user.save()
            
            logger.info(f"User profile image updated successfully")
            
            return jsonify({'message': 'Profile image uploaded successfully', 'filename': filename, 'base64_image': encoded_image}), 200
        else:
            return jsonify({'error': 'File type not allowed'}), 400
    except Exception as e:
        logger.error(f"Error uploading profile image: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/profile_image', methods=['DELETE'])
@jwt_required()
def delete_profile_image():
    try:
        user = User.objects.get(id=current_user.id)
        if user.profile_image:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], user.profile_image)
            if os.path.exists(file_path):
                os.remove(file_path)
            
            user.profile_image = ''
            user.save()
            
        return jsonify({'message': 'Profile image deleted successfully'}), 200
    except Exception as e:
        logger.error(f"Error deleting profile image: {str(e)}")
        return jsonify({'error': 'Failed to delete profile image'}), 500
    finally:
        # This block is optional but recommended for cleanup
        pass

# Configuration should be AFTER the route definitions
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.after_request
def add_cors_headers(response):
    allowed_origins = {"http://localhost:3106", "https://activity.vnrzone.site","https://stm24wnz-3106.inc1.devtunnels.ms"}
    origin = request.headers.get("Origin")

    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, PUT, POST, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'

    return response
@app.route('/api/activities/<activity_id>', methods=['PUT'])
@jwt_required()
def update_activity(activity_id):
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        
        # Find the activity index using activity_id
        activity_index = next(
            (i for i, a in enumerate(user.activities) if a.activity_id == activity_id),
            None
        )
        
        if activity_index is None:
            return jsonify({'error': 'Activity not found'}), 404

        # Handle empty skills array
        if 'skills' in data and not data['skills']:
            data['skills'] = []

        # Update allowed fields
        allowed_fields = ['title', 'description', 'status', 'leetcode_rating', 'skills']
        for field in allowed_fields:
            if field in data:
                setattr(user.activities[activity_index], field, data[field])

        user.save()
        
        return jsonify({
            'message': 'Activity updated successfully',
            'activity': user.activities[activity_index].to_json()
        }), 200

    except Exception as e:
        logger.error(f"Error updating activity: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

# ... existing code ...

@app.route('/api/user/profile/image', methods=['GET'])
@jwt_required()
def get_user_profile_image():
    try:
        user_id = get_jwt_identity()
        
        # Get user from database
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Get profile image from user
        if not user.profile_image:
            return jsonify({'error': 'No profile image found'}), 404
            
        # Return the profile image
        return user.profile_image, 200, {'Content-Type': 'image/jpeg'}
        
    except Exception as e:
        print(f"Error fetching profile image: {str(e)}")
        return jsonify({'error': 'Failed to fetch profile image'}), 500

# ... existing code ...
@app.route('/api/activities/<activity_id>', methods=['DELETE'])
@jwt_required()
def delete_activity(activity_id):
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Find the activity index using activity_id
        activity_index = next(
            (i for i, a in enumerate(user.activities) if a.activity_id == activity_id),
            None
        )
        
        if activity_index is None:
            return jsonify({'error': 'Activity not found'}), 404

        # Remove the activity from the list
        user.activities.pop(activity_index)
        user.save()
        
        return jsonify({
            'message': 'Activity deleted successfully'
        }), 200

    except Exception as e:
        logger.error(f"Error deleting activity: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
# ... existing code for deleting daily_activities ...
@app.route('/api/daily_activities/<daily_activity_id>', methods=['DELETE'])
@jwt_required()
def delete_daily_activity(daily_activity_id):
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Find the activity index using activity_id
        daily_activity_index = next(
            (i for i, a in enumerate(user.daily_activities) if a.daily_activity_id == daily_activity_id),
            None
        )
        
        if daily_activity_index is None:
            return jsonify({'error': 'Daily Activity not found'}), 404

        # Remove the activity from the list
        user.daily_activities.pop(daily_activity_index)
        user.save()
        
        return jsonify({
            'message': 'Daily activity deleted successfully'
        }), 200

    except Exception as e:
        logger.error(f"Error deleting daily activity: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/activities/recommend', methods=['POST'])
@jwt_required()
def recommend_activities():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        job_title = data.get('job_title')
        response_text = ""  # Initialize with empty string
        
        if not job_title:
            return jsonify({'error': 'Job title is required'}), 400

        activities = user.activities
        if not activities:
            return jsonify({'error': 'No activities found for user'}), 404

        activities_data = []
        for activity in activities:
            activity_data = {
                'activity_id': activity.activity_id,
                'title': activity.title,
                'activity_type': getattr(activity, 'activity_type', 'general'),
                'description': getattr(activity, 'description', ''),
                'skills': getattr(activity, 'skills', [])
            }
            activities_data.append(activity_data)

        prompt = f"""Analyze these activities for a {job_title} position:
        {json.dumps(activities_data, indent=2)}
        
        Return ONLY a JSON array of 3-5 most relevant activity TITLES (not IDs) using this exact format:
        ["Title 1", "Title 2", "Title 3"]
        
        Rules:
        1. Titles must match exactly from the list
        2. No empty strings
        3. Only include titles that exist in the activities list
        4. Return valid JSON only, no extra text"""

        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "mistral",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "max_tokens": 500
                    }
                },
                timeout=60
            )
            response.raise_for_status()
            response_data = response.json()
            response_text = response_data.get("response", "")
            
        except requests.exceptions.RequestException as e:
            response_text = f"API request failed: {str(e)}"
            raise

        # Parse the response
        try:
            # Clean response text
            clean_response = response_text.strip().replace('```json', '').replace('```', '')
            
            # First try to parse directly
            recommended_activities = json.loads(clean_response)
        except json.JSONDecodeError:
            # Fallback: Extract JSON array using regex
            json_match = re.search(r'\[.*?\]', clean_response, re.DOTALL)
            if json_match:
                recommended_activities = json.loads(json_match.group())
            else:
                recommended_activities = []
                logger.warning(f"Failed to parse JSON from response: {clean_response}")

        # Validation and processing
        valid_titles = {activity.title.lower(): activity.title for activity in activities}
        validated_activities = []
        
        for title in recommended_activities:
            if isinstance(title, str):  # Ensure we only process strings
                clean_title = title.strip().lower()
                if clean_title and clean_title in valid_titles:
                    validated_activities.append(valid_titles[clean_title])

        # Remove duplicates and limit results
        final_recommendations = list(dict.fromkeys(validated_activities))[:5]
        
        return jsonify({'recommended_activities': final_recommendations}), 200

    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}\nRaw response: {response_text}")
        return jsonify({
            'error': 'Failed to generate recommendations',
            'details': str(e),
            'raw_response': response_text[:500]  # Limit to first 500 chars
        }), 500

@app.route('/api/user/gemini_api_key', methods=['PUT'])
@jwt_required()
def set_gemini_api_key():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        if 'api_key' not in data:
            return jsonify({'error': 'API key is required'}), 400
        
        # Encrypt and update whether key exists or not
        encrypted_key = encrypt_api_key(data['api_key'])
        user.gemini_api_key = encrypted_key
        user.save()

        return jsonify({
            'message': 'API key updated successfully' if user.gemini_api_key else 'API key set successfully',
            'encrypted_at': datetime.now(timezone.utc).isoformat()
        }), 200

    except Exception as e:
        logger.error(f"API key update error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6106, debug=True) 