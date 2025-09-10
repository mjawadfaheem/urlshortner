# 🔗 URL Shortener (Node.js + Express)

A lightweight **URL Shortener** built with **Node.js** and **Express**.  
It allows you to turn long URLs into short, shareable links like:


The app includes:
- A REST API
- A minimal web interface
- Local JSON storage (`urls.json`)

---

## 🚀 Features

- Shorten any valid URL
- Optional **custom alias** support (`http://localhost:3000/myalias`)
- Redirect short URL → original long URL
- Track **visit counts** and **last visited time**
- Simple front-end form for quick usage
- **Stats endpoint** for each shortened URL
- Lightweight JSON-based storage (no database setup needed)

---

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/url-shortener.git
   cd url-shortener

### Install dependencies:

- npm install

### (Optional) install nodemon for auto-reload during development:

- npm install --save-dev nodemon

# Usage
## Start the server
- npm start

### By default, the app runs at:

http://localhost:3000/

## 🌐 API Guide

### 1. Shorten a URL

**POST** `/api/shorten`

#### Request body:
```json
{
  "url": "https://example.com",
  "customAlias": "myalias"   // optional
}

Response:
{
  "shortUrl": "http://localhost:3000/myalias"
}


2. Redirect to original URL

GET /:code

Example:

http://localhost:3000/myalias


➡️ Redirects to:

https://example.com

3. Get stats for a short URL

GET /api/stats/:code

Response:
{
  "code": "myalias",
  "url": "https://example.com",
  "createdAt": "2025-09-10T06:30:00.000Z",
  "visits": 5,
  "lastVisited": "2025-09-10T07:45:00.000Z"
}