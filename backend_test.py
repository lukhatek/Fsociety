#!/usr/bin/env python3
"""
Backend API Testing for Mr. Robot Forum
Tests all backend functionality including authentication, posts, and comments
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration
BASE_URL = "https://dcdda250-0902-4be3-a176-daaff45753af.preview.emergentagent.com/api"
ADMIN_USERNAME = "Lukha"
ADMIN_PASSWORD = "ahmet3q"

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []
    
    def add_result(self, test_name, passed, message=""):
        self.results.append({
            "test": test_name,
            "passed": passed,
            "message": message
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
    
    def print_summary(self):
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {self.passed + self.failed}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/(self.passed + self.failed)*100):.1f}%")
        
        if self.failed > 0:
            print(f"\nFAILED TESTS:")
            for result in self.results:
                if not result["passed"]:
                    print(f"- {result['test']}: {result['message']}")

def test_api_connection():
    """Test basic API connectivity"""
    results = TestResults()
    
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "fsociety" in data.get("message", "").lower():
                results.add_result("API Connection", True, f"Connected successfully: {data['message']}")
            else:
                results.add_result("API Connection", False, f"Unexpected response: {data}")
        else:
            results.add_result("API Connection", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        results.add_result("API Connection", False, f"Connection failed: {str(e)}")
    
    return results

def test_user_authentication():
    """Test user registration and login functionality"""
    results = TestResults()
    
    # Generate unique test data
    test_user = f"hackerman_{uuid.uuid4().hex[:8]}"
    test_email = f"{test_user}@fsociety.com"
    test_password = "elliot123"
    
    # Test 1: User Registration
    try:
        register_data = {
            "username": test_user,
            "email": test_email,
            "password": test_password
        }
        response = requests.post(f"{BASE_URL}/register", json=register_data, timeout=10)
        
        if response.status_code == 200:
            user_data = response.json()
            # Validate response structure
            required_fields = ["id", "username", "email", "avatar", "created_at", "is_admin"]
            missing_fields = [field for field in required_fields if field not in user_data]
            
            if not missing_fields:
                # Check UUID format
                try:
                    uuid.UUID(user_data["id"])
                    results.add_result("User Registration - Structure", True, f"User created with ID: {user_data['id']}")
                except ValueError:
                    results.add_result("User Registration - Structure", False, f"Invalid UUID format: {user_data['id']}")
                
                # Check default avatar assignment
                if user_data.get("avatar") and "unsplash.com" in user_data["avatar"]:
                    results.add_result("Default Avatar Assignment", True, "Default avatar properly assigned")
                else:
                    results.add_result("Default Avatar Assignment", False, f"Avatar issue: {user_data.get('avatar')}")
                
                # Check admin flag (should be False for regular user)
                if user_data.get("is_admin") == False:
                    results.add_result("Regular User Admin Flag", True, "Non-admin user correctly flagged")
                else:
                    results.add_result("Regular User Admin Flag", False, f"Admin flag incorrect: {user_data.get('is_admin')}")
            else:
                results.add_result("User Registration - Structure", False, f"Missing fields: {missing_fields}")
        else:
            results.add_result("User Registration", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        results.add_result("User Registration", False, f"Registration failed: {str(e)}")
    
    # Test 2: Admin User Registration
    try:
        admin_data = {
            "username": ADMIN_USERNAME,
            "email": f"{ADMIN_USERNAME.lower()}@fsociety.com",
            "password": ADMIN_PASSWORD
        }
        response = requests.post(f"{BASE_URL}/register", json=admin_data, timeout=10)
        
        if response.status_code == 200:
            admin_user = response.json()
            if admin_user.get("is_admin") == True:
                results.add_result("Admin User Creation", True, f"Admin user {ADMIN_USERNAME} created successfully")
            else:
                results.add_result("Admin User Creation", False, f"Admin flag not set for {ADMIN_USERNAME}")
        elif response.status_code == 400 and "already exists" in response.text:
            results.add_result("Admin User Creation", True, f"Admin user {ADMIN_USERNAME} already exists")
        else:
            results.add_result("Admin User Creation", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        results.add_result("Admin User Creation", False, f"Admin registration failed: {str(e)}")
    
    # Test 3: Valid Login
    try:
        login_data = {
            "username": test_user,
            "password": test_password
        }
        response = requests.post(f"{BASE_URL}/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            login_response = response.json()
            required_fields = ["access_token", "token_type", "user"]
            missing_fields = [field for field in required_fields if field not in login_response]
            
            if not missing_fields:
                token = login_response["access_token"]
                if token and len(token) > 20:  # JWT tokens are typically long
                    results.add_result("Valid Login", True, "Login successful with JWT token")
                    
                    # Test JWT token validation
                    headers = {"Authorization": f"Bearer {token}"}
                    me_response = requests.get(f"{BASE_URL}/me", headers=headers, timeout=10)
                    
                    if me_response.status_code == 200:
                        user_info = me_response.json()
                        if user_info.get("username") == test_user:
                            results.add_result("JWT Token Validation", True, "Token validation successful")
                        else:
                            results.add_result("JWT Token Validation", False, f"Token returned wrong user: {user_info.get('username')}")
                    else:
                        results.add_result("JWT Token Validation", False, f"Token validation failed: HTTP {me_response.status_code}")
                else:
                    results.add_result("Valid Login", False, f"Invalid token format: {token}")
            else:
                results.add_result("Valid Login", False, f"Missing fields in login response: {missing_fields}")
        else:
            results.add_result("Valid Login", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        results.add_result("Valid Login", False, f"Login failed: {str(e)}")
    
    # Test 4: Invalid Login
    try:
        invalid_login = {
            "username": test_user,
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/login", json=invalid_login, timeout=10)
        
        if response.status_code == 401:
            results.add_result("Invalid Login Rejection", True, "Invalid credentials properly rejected")
        else:
            results.add_result("Invalid Login Rejection", False, f"Expected 401, got HTTP {response.status_code}")
    except Exception as e:
        results.add_result("Invalid Login Rejection", False, f"Invalid login test failed: {str(e)}")
    
    # Test 5: Admin Login
    try:
        admin_login = {
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        }
        response = requests.post(f"{BASE_URL}/login", json=admin_login, timeout=10)
        
        if response.status_code == 200:
            admin_login_response = response.json()
            admin_user_data = admin_login_response.get("user", {})
            if admin_user_data.get("is_admin") == True:
                results.add_result("Admin Login", True, f"Admin {ADMIN_USERNAME} login successful")
                # Store admin token for later tests
                global admin_token
                admin_token = admin_login_response["access_token"]
            else:
                results.add_result("Admin Login", False, f"Admin flag not present in login response")
        else:
            results.add_result("Admin Login", False, f"Admin login failed: HTTP {response.status_code}")
    except Exception as e:
        results.add_result("Admin Login", False, f"Admin login failed: {str(e)}")
    
    return results, test_user, test_password

def test_forum_posts(test_user, test_password):
    """Test forum post management functionality"""
    results = TestResults()
    
    # Get authentication token
    try:
        login_data = {"username": test_user, "password": test_password}
        login_response = requests.post(f"{BASE_URL}/login", json=login_data, timeout=10)
        
        if login_response.status_code != 200:
            results.add_result("Post Testing Setup", False, "Could not authenticate for post tests")
            return results
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
    except Exception as e:
        results.add_result("Post Testing Setup", False, f"Authentication setup failed: {str(e)}")
        return results
    
    # Test 1: Create Post (Authenticated)
    post_data = {
        "title": "fsociety Recruitment Drive",
        "content": "We are looking for skilled hackers to join our cause. The revolution starts now. #fsociety #mrrobot"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/posts", json=post_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            post_response = response.json()
            required_fields = ["id", "title", "content", "author_id", "author_username", "created_at", "updated_at"]
            missing_fields = [field for field in required_fields if field not in post_response]
            
            if not missing_fields:
                # Validate UUID
                try:
                    uuid.UUID(post_response["id"])
                    results.add_result("Authenticated Post Creation", True, f"Post created with ID: {post_response['id']}")
                    global test_post_id
                    test_post_id = post_response["id"]
                    
                    # Validate author information
                    if post_response["author_username"] == test_user:
                        results.add_result("Post Author Tracking", True, "Author information correctly stored")
                    else:
                        results.add_result("Post Author Tracking", False, f"Wrong author: {post_response['author_username']}")
                    
                    # Validate timestamps
                    try:
                        datetime.fromisoformat(post_response["created_at"].replace('Z', '+00:00'))
                        results.add_result("Post Timestamp Handling", True, "Timestamps properly formatted")
                    except ValueError:
                        results.add_result("Post Timestamp Handling", False, f"Invalid timestamp: {post_response['created_at']}")
                        
                except ValueError:
                    results.add_result("Authenticated Post Creation", False, f"Invalid UUID: {post_response['id']}")
            else:
                results.add_result("Authenticated Post Creation", False, f"Missing fields: {missing_fields}")
        else:
            results.add_result("Authenticated Post Creation", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        results.add_result("Authenticated Post Creation", False, f"Post creation failed: {str(e)}")
    
    # Test 2: Unauthorized Post Creation
    try:
        response = requests.post(f"{BASE_URL}/posts", json=post_data, timeout=10)
        
        if response.status_code == 403 or response.status_code == 401:
            results.add_result("Unauthorized Post Rejection", True, "Unauthorized post creation properly rejected")
        else:
            results.add_result("Unauthorized Post Rejection", False, f"Expected 401/403, got HTTP {response.status_code}")
    except Exception as e:
        results.add_result("Unauthorized Post Rejection", False, f"Unauthorized test failed: {str(e)}")
    
    # Test 3: Retrieve All Posts
    try:
        response = requests.get(f"{BASE_URL}/posts", timeout=10)
        
        if response.status_code == 200:
            posts = response.json()
            if isinstance(posts, list):
                if len(posts) > 0:
                    # Validate post structure
                    first_post = posts[0]
                    required_fields = ["id", "title", "content", "author_username", "created_at"]
                    missing_fields = [field for field in required_fields if field not in first_post]
                    
                    if not missing_fields:
                        results.add_result("Post Retrieval (List)", True, f"Retrieved {len(posts)} posts successfully")
                    else:
                        results.add_result("Post Retrieval (List)", False, f"Post missing fields: {missing_fields}")
                else:
                    results.add_result("Post Retrieval (List)", True, "Post list endpoint working (empty list)")
            else:
                results.add_result("Post Retrieval (List)", False, f"Expected list, got: {type(posts)}")
        else:
            results.add_result("Post Retrieval (List)", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        results.add_result("Post Retrieval (List)", False, f"Post retrieval failed: {str(e)}")
    
    # Test 4: Retrieve Single Post
    if 'test_post_id' in globals():
        try:
            response = requests.get(f"{BASE_URL}/posts/{test_post_id}", timeout=10)
            
            if response.status_code == 200:
                post = response.json()
                if post.get("id") == test_post_id and post.get("title") == post_data["title"]:
                    results.add_result("Single Post Retrieval", True, f"Single post retrieved successfully")
                else:
                    results.add_result("Single Post Retrieval", False, f"Post data mismatch")
            else:
                results.add_result("Single Post Retrieval", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            results.add_result("Single Post Retrieval", False, f"Single post retrieval failed: {str(e)}")
    
    return results

def test_comment_system(test_user, test_password):
    """Test comment system functionality"""
    results = TestResults()
    
    # Get authentication token
    try:
        login_data = {"username": test_user, "password": test_password}
        login_response = requests.post(f"{BASE_URL}/login", json=login_data, timeout=10)
        
        if login_response.status_code != 200:
            results.add_result("Comment Testing Setup", False, "Could not authenticate for comment tests")
            return results
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
    except Exception as e:
        results.add_result("Comment Testing Setup", False, f"Authentication setup failed: {str(e)}")
        return results
    
    # Ensure we have a post to comment on
    if 'test_post_id' not in globals():
        # Create a test post first
        post_data = {
            "title": "Test Post for Comments",
            "content": "This post is for testing comments functionality."
        }
        try:
            post_response = requests.post(f"{BASE_URL}/posts", json=post_data, headers=headers, timeout=10)
            if post_response.status_code == 200:
                global test_post_id
                test_post_id = post_response.json()["id"]
            else:
                results.add_result("Comment Testing Setup", False, "Could not create test post for comments")
                return results
        except Exception as e:
            results.add_result("Comment Testing Setup", False, f"Test post creation failed: {str(e)}")
            return results
    
    # Test 1: Create Comment (Authenticated)
    comment_data = {
        "post_id": test_post_id,
        "content": "Hello friend. The revolution will not be televised, but it will be digitized. #fsociety"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/comments", json=comment_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            comment_response = response.json()
            required_fields = ["id", "post_id", "content", "author_id", "author_username", "created_at"]
            missing_fields = [field for field in required_fields if field not in comment_response]
            
            if not missing_fields:
                # Validate UUID
                try:
                    uuid.UUID(comment_response["id"])
                    results.add_result("Authenticated Comment Creation", True, f"Comment created with ID: {comment_response['id']}")
                    
                    # Validate post linkage
                    if comment_response["post_id"] == test_post_id:
                        results.add_result("Comment Post Linkage", True, "Comment properly linked to post")
                    else:
                        results.add_result("Comment Post Linkage", False, f"Wrong post ID: {comment_response['post_id']}")
                    
                    # Validate author information
                    if comment_response["author_username"] == test_user:
                        results.add_result("Comment Author Tracking", True, "Comment author information correct")
                    else:
                        results.add_result("Comment Author Tracking", False, f"Wrong author: {comment_response['author_username']}")
                        
                except ValueError:
                    results.add_result("Authenticated Comment Creation", False, f"Invalid UUID: {comment_response['id']}")
            else:
                results.add_result("Authenticated Comment Creation", False, f"Missing fields: {missing_fields}")
        else:
            results.add_result("Authenticated Comment Creation", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        results.add_result("Authenticated Comment Creation", False, f"Comment creation failed: {str(e)}")
    
    # Test 2: Unauthorized Comment Creation
    try:
        response = requests.post(f"{BASE_URL}/comments", json=comment_data, timeout=10)
        
        if response.status_code == 403 or response.status_code == 401:
            results.add_result("Unauthorized Comment Rejection", True, "Unauthorized comment creation properly rejected")
        else:
            results.add_result("Unauthorized Comment Rejection", False, f"Expected 401/403, got HTTP {response.status_code}")
    except Exception as e:
        results.add_result("Unauthorized Comment Rejection", False, f"Unauthorized comment test failed: {str(e)}")
    
    # Test 3: Retrieve Comments for Post
    try:
        response = requests.get(f"{BASE_URL}/posts/{test_post_id}/comments", timeout=10)
        
        if response.status_code == 200:
            comments = response.json()
            if isinstance(comments, list):
                if len(comments) > 0:
                    # Validate comment structure
                    first_comment = comments[0]
                    required_fields = ["id", "post_id", "content", "author_username", "created_at"]
                    missing_fields = [field for field in required_fields if field not in first_comment]
                    
                    if not missing_fields:
                        results.add_result("Comment Retrieval", True, f"Retrieved {len(comments)} comments successfully")
                    else:
                        results.add_result("Comment Retrieval", False, f"Comment missing fields: {missing_fields}")
                else:
                    results.add_result("Comment Retrieval", True, "Comment retrieval endpoint working (empty list)")
            else:
                results.add_result("Comment Retrieval", False, f"Expected list, got: {type(comments)}")
        else:
            results.add_result("Comment Retrieval", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        results.add_result("Comment Retrieval", False, f"Comment retrieval failed: {str(e)}")
    
    return results

def main():
    """Run all backend tests"""
    print("🤖 Mr. Robot Forum Backend Testing")
    print("=" * 60)
    print(f"Testing API at: {BASE_URL}")
    print("=" * 60)
    
    all_results = TestResults()
    
    # Test 1: API Connection
    print("\n🔌 Testing API Connection...")
    connection_results = test_api_connection()
    all_results.passed += connection_results.passed
    all_results.failed += connection_results.failed
    all_results.results.extend(connection_results.results)
    
    # Test 2: User Authentication
    print("\n🔐 Testing User Authentication System...")
    auth_results, test_user, test_password = test_user_authentication()
    all_results.passed += auth_results.passed
    all_results.failed += auth_results.failed
    all_results.results.extend(auth_results.results)
    
    # Test 3: Forum Posts
    print("\n📝 Testing Forum Post Management...")
    post_results = test_forum_posts(test_user, test_password)
    all_results.passed += post_results.passed
    all_results.failed += post_results.failed
    all_results.results.extend(post_results.results)
    
    # Test 4: Comment System
    print("\n💬 Testing Comment System...")
    comment_results = test_comment_system(test_user, test_password)
    all_results.passed += comment_results.passed
    all_results.failed += comment_results.failed
    all_results.results.extend(comment_results.results)
    
    # Print final summary
    all_results.print_summary()
    
    # Return success/failure for automation
    return all_results.failed == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)