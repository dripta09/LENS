# LENS — Photography Portfolio

A premium, dark-themed photography portfolio website built with vanilla HTML, CSS, and JavaScript. All data is stored in the browser's `localStorage` — no backend required.

![LENS Photography](https://img.shields.io/badge/LENS-Photography-c8a96b?style=for-the-badge)

---

## ✨ Features

- **Stunning Dark Theme** — Premium dark aesthetics with gold accents
- **Hero Section** — Full-viewport hero with customizable headline
- **Masonry Gallery** — Responsive photo grid with lightbox viewer
- **Blog / Journal** — Create and manage blog posts with rich HTML content
- **About Page** — Photographer bio with profile photo and specialties
- **Contact Form** — Visitor messages saved to localStorage
- **Full Admin Panel** — Password-protected dashboard to manage everything
  - 📊 Dashboard with stats
  - 🖼 Photo management (upload from device or paste URL)
  - ✍️ Blog post editor (create, edit, delete)
  - ⚙ Site settings (name, bio, avatar, hero text)
  - 💬 Message inbox
- **Profile Photo Upload** — Choose photo from device or paste a URL
- **Fully Responsive** — Mobile-first design with hamburger navigation
- **Zero Dependencies** — Pure HTML, CSS, JavaScript (no frameworks)

---

## 📁 Project Structure

```
lens-photography/
├── index.html          # Main HTML structure
├── style.css       # All styles (variables, components, responsive)
│   
├── app.js          # Application logic (routing, CRUD, admin)
└── README.md           # This file
```

---

## 🚀 Getting Started

### Option 1: Open Directly
Simply open `index.html` in any modern browser. No server needed!

### Option 2: Local Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

---

## 🔐 Admin Access

1. Click **Admin** in the navigation bar
2. Default password: `admin123`
3. Change the password in **Settings** after first login

---

## 🎨 Customization

### Colors
Edit the CSS variables in `css/style.css`:
```css
:root {
  --bg: #080808;        /* Background */
  --surface: #111;      /* Card surfaces */
  --gold: #c8a96b;      /* Accent color */
  --text: #f2ede8;      /* Primary text */
}
```

### Fonts
The site uses three Google Fonts:
- **Cormorant Garamond** — Headings (serif)
- **Barlow** — Body text (sans-serif)
- **Barlow Condensed** — Labels & navigation

---

## 📸 Adding Photos

### From Admin Panel:
1. **Upload from device** — Drag & drop or click the upload zone
2. **Paste URL** — Enter any image URL (e.g., Unsplash)

### Profile Photo:
Go to **Admin → Settings** and either:
- Click "Browse from device" to upload from your computer
- Paste a URL in the Profile Photo URL field

---

## 💾 Data Storage

All data is stored in `localStorage` under these keys:
| Key | Description |
|-----|-------------|
| `s_cfg` | Site settings (name, bio, avatar, etc.) |
| `s_photos` | Photo gallery items |
| `s_posts` | Blog posts |
| `s_msgs` | Contact form messages |

> ⚠️ Clearing browser data will reset everything. Export your data if needed.

---

## 📄 License

MIT License — free for personal and commercial use.
