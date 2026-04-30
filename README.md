# Blog REST API

A production-ready Blog REST API built with **Django**, **Django REST Framework**, **PostgreSQL**, and **JWT Authentication**.

## Features

- JWT Authentication (register, login, logout, token refresh, password change)
- Custom User model with email-based login
- Posts with slugs (auto-generated), categories, tags, draft/published status
- Nested comments (replies to comments, max 2 levels)
- Like & Bookmark toggle endpoints
- Filtering by category, tag, author + full-text search
- Pagination on all list endpoints
- Role-based permissions (owner can edit, others read-only)
- Swagger / OpenAPI docs at `/api/docs/`
- Docker + PostgreSQL setup

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Django 4.x + Django REST Framework |
| Auth | SimpleJWT (access + refresh tokens) |
| Database | PostgreSQL |
| Filtering | django-filter |
| Docs | drf-spectacular (Swagger UI) |
| Config | python-decouple (.env) |
| Containerization | Docker + Docker Compose |

## Project Structure

```
blog_api/
  apps/
    users/          # Auth + user profiles
    posts/          # Posts, categories, tags
    comments/       # Nested comments
    interactions/   # Likes + bookmarks
  config/
    settings/
      base.py       # Shared settings
      development.py
      production.py
    urls.py
  core/             # Shared utilities
    pagination.py
    permissions.py
    exceptions.py
    utils.py
  Dockerfile
  docker-compose.yml
  requirements.txt
```

## Setup (Local)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/blog-api.git
cd blog-api
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` with your database credentials:
```
SECRET_KEY=your-secret-key
DB_NAME=blog_db
DB_USER=blog_user
DB_PASSWORD=blog_password
DB_HOST=localhost
DB_PORT=5432
```

### 4. Set up PostgreSQL
```sql
CREATE DATABASE blog_db;
CREATE USER blog_user WITH PASSWORD 'blog_password';
GRANT ALL PRIVILEGES ON DATABASE blog_db TO blog_user;
GRANT ALL ON SCHEMA public TO blog_user;
```

### 5. Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Setup (Docker)

```bash
cp .env.example .env
# Set DB_HOST=db in .env
docker-compose up --build
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
```

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register/` | Register + get tokens | Public |
| POST | `/api/auth/login/` | Login + get tokens | Public |
| POST | `/api/auth/token/refresh/` | Refresh access token | Public |
| POST | `/api/auth/logout/` | Blacklist refresh token | JWT |
| POST | `/api/auth/password/change/` | Change password | JWT |

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/me/` | Get my profile | JWT |
| PATCH | `/api/users/me/` | Update my profile | JWT |
| GET | `/api/users/{username}/` | Public profile | Public |
| GET | `/api/users/me/bookmarks/` | My bookmarks | JWT |

### Posts
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/posts/` | List published posts | Public |
| POST | `/api/posts/` | Create post | JWT |
| GET | `/api/posts/{slug}/` | Get single post | Public |
| PATCH | `/api/posts/{slug}/` | Update post | Owner |
| DELETE | `/api/posts/{slug}/` | Delete post | Owner |
| GET | `/api/posts/my-drafts/` | My draft posts | JWT |

### Filtering & Search
```
GET /api/posts/?search=django
GET /api/posts/?category=technology
GET /api/posts/?tag=python
GET /api/posts/?author=john
GET /api/posts/?status=published
GET /api/posts/?page=2&page_size=5
```

### Comments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/posts/{slug}/comments/` | List comments | Public |
| POST | `/api/posts/{slug}/comments/` | Add comment/reply | JWT |
| PATCH | `/api/posts/{slug}/comments/{id}/` | Edit comment | Owner |
| DELETE | `/api/posts/{slug}/comments/{id}/` | Delete comment | Owner |

### Interactions
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/posts/{slug}/like/` | Toggle like | JWT |
| POST | `/api/posts/{slug}/bookmark/` | Toggle bookmark | JWT |

## Usage Examples

### Register
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"john","password":"pass1234","password2":"pass1234"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass1234"}'
```

### Create a Post
```bash
curl -X POST http://localhost:8000/api/posts/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Post","content":"Hello world!","status":"published"}'
```

### Like a Post
```bash
curl -X POST http://localhost:8000/api/posts/my-first-post/like/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Interactive Docs

Visit `http://localhost:8000/api/docs/` for the full Swagger UI where you can test every endpoint in the browser.

## License

MIT
