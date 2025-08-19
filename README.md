
# 🏠 Home-Test Chat Application

Welcome to **Home-Test**, a modern web-based chat platform for team communication and candidate evaluation. This app combines a sleek interface with powerful features to make messaging fun and productive.

---

## ✨ Features

- **Real-time chat** between users
- **Text, image, and voice messages**
- **Animated emoji picker** (GIFs and PNGs)
- **Profile pictures** for users and contacts
- **Search & lazy loading** for chats and messages
- **Admin tools** for logging and error reporting
- **Modular PHP backend** with MySQL database

---

## 🛠️ Technologies Used

- **Backend:** PHP
- **Frontend:** JavaScript, jQuery, Bootstrap, FontAwesome
- **Database:** MySQL
- **Other:** Composer, vlucas/phpdotenv

---

## 🚀 Getting Started

### Prerequisites

- PHP 7.4 or higher
- MySQL server
- Composer
- Web server (Apache, XAMPP, etc.)

### Installation Steps

1. **Clone or copy** this repository to your web server directory.
2. Run `composer install` in the project root to install PHP dependencies.
3. **Create a MySQL database** and import the schema from [`mysql.sql`](mysql.sql).
4. **Add a `.env` file** in the root directory (see example below).
5. **Update** `config.php` if you need to change database settings.
6. Ensure `uploaded_files/`, `assets/audio/`, and `profile_pics/` are **writable** by the web server.

#### Example `.env` file
```env
LOCAL_DB_SERVER=yourservername
LOCAL_DB_USER=yourusername
LOCAL_DB_NAME=yourdbname
LOCAL_DB_PASSWORD=yourpassword
LOCAL_DB_ENV=LOCAL
```

### Running the App

1. Start your web server and MySQL server.
2. Open your browser and go to: `http://localhost/home-test/`
3. Log in with a test user from the `users` table, or create a new user in the database.

---

## 💡 Usage Guide

- Start new chats, send text, images, and voice notes.
- Use the emoji picker for expressive messages.
- Review logs in `log_me.txt` for debugging.
- Explore the UI and try lazy loading by scrolling through chats and messages.

---

## 📝 Developer Tips

- **Key files:** `config.php`, `api.php`, `assets/js/main.js`
- Use browser **DevTools** (Network tab) to inspect API requests and responses.
- The app is designed for **extensibility**—add plugins or modules in the `modules/` and `plugins/` folders.
- Check the database schema in `mysql.sql` for table structure and sample data.

---

## 🤝 Contributing & Support

For any issues, questions, or suggestions, please contact the repository owner or open an issue.

---

Enjoy chatting! 🚀