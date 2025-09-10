# 🔗 URL Shortener (Node.js + Express)

A lightweight **URL Shortener** built with **Node.js** and **Express**.  
It allows you to turn long URLs into short, shareable links like:

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
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Install `nodemon` for auto-reload during development:
   ```bash
   npm install --save-dev nodemon
   ```

---

## 🚀 Usage

### Start the server
```bash
npm start
```

By default, the app runs at:  
[http://localhost:3000/](http://localhost:3000/)

---

## 🌐 API Guide

### 1. Shorten a URL

**POST** `/api/shorten`

#### Request body:
```json
{
  "url": "https://example.com",
  "customAlias": "myalias"   // optional
}
```

#### Response:
```json
{
  "shortUrl": "http://localhost:3000/myalias"
}
```

---

### 2. Redirect to original URL

**GET** `/:code`

#### Example:
`http://localhost:3000/myalias`

➡️ Redirects to:  
`https://example.com`

---

### 3. Get stats for a short URL

**GET** `/api/stats/:code`

#### Response:
```json
{
  "code": "myalias",
  "url": "https://example.com",
  "createdAt": "2025-09-10T06:30:00.000Z",
  "visits": 5,
  "lastVisited": "2025-09-10T07:45:00.000Z"
}
```