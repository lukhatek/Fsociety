from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import hashlib
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "fsociety_secret_key_2024"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    avatar: str = "https://images.unsplash.com/photo-1616582607004-eba71ce01e07?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtYXNrZWQlMjBwb3J0cmFpdHxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3NTIyNDQ2MDl8MA&ixlib=rb-4.1.0&q=85"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_admin: bool = False

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    avatar: str
    created_at: datetime
    is_admin: bool

class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author_id: str
    author_username: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PostCreate(BaseModel):
    title: str
    content: str

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    content: str
    author_id: str
    author_username: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CommentCreate(BaseModel):
    post_id: str
    content: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return UserResponse(**user)

# Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to fsociety underground"}

@api_router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Kullanıcı adı veya email zaten mevcut")
    
    # Create user
    user_dict = user_data.dict()
    user_dict["password_hash"] = get_password_hash(user_data.password)
    del user_dict["password"]
    
    # Check if this is admin
    if user_data.username == "Lukha":
        user_dict["is_admin"] = True
    
    user_obj = User(**user_dict)
    await db.users.insert_one(user_obj.dict())
    
    return UserResponse(**user_obj.dict())

@api_router.post("/login")
async def login(user_data: UserLogin):
    # Find user
    user = await db.users.find_one({"username": user_data.username})
    if not user:
        raise HTTPException(status_code=401, detail="Geçersiz kullanıcı bilgileri")
    
    # Verify password
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Geçersiz kullanıcı bilgileri")
    
    # Create token
    access_token = create_access_token({"sub": user["username"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user)
    }

@api_router.get("/posts", response_model=List[Post])
async def get_posts():
    posts = await db.posts.find().sort("created_at", -1).to_list(1000)
    return [Post(**post) for post in posts]

@api_router.post("/posts", response_model=Post)
async def create_post(post_data: PostCreate, current_user: UserResponse = Depends(get_current_user)):
    post_dict = post_data.dict()
    post_dict["author_id"] = current_user.id
    post_dict["author_username"] = current_user.username
    
    post_obj = Post(**post_dict)
    await db.posts.insert_one(post_obj.dict())
    
    return post_obj

@api_router.get("/posts/{post_id}", response_model=Post)
async def get_post(post_id: str):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return Post(**post)

@api_router.get("/posts/{post_id}/comments", response_model=List[Comment])
async def get_comments(post_id: str):
    comments = await db.comments.find({"post_id": post_id}).sort("created_at", 1).to_list(1000)
    return [Comment(**comment) for comment in comments]

@api_router.post("/comments", response_model=Comment)
async def create_comment(comment_data: CommentCreate, current_user: UserResponse = Depends(get_current_user)):
    comment_dict = comment_data.dict()
    comment_dict["author_id"] = current_user.id
    comment_dict["author_username"] = current_user.username
    
    comment_obj = Comment(**comment_dict)
    await db.comments.insert_one(comment_obj.dict())
    
    return comment_obj

@api_router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    return current_user

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()