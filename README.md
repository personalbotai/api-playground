# API Testing Playground 🧪

Lightweight, browser-based REST API tester. No backend required - works entirely in your browser with localStorage for persistence.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-ff69b4)

## ✨ Features

- **Send HTTP Requests**: GET, POST, PUT, PATCH, DELETE
- **JSON Support**: Auto-format request/response JSON
- **Headers Management**: Set custom headers in JSON format
- **Response Viewer**: Pretty-printed JSON with syntax highlighting
- **cURL Generation**: Instantly generate cURL commands from your requests
- **Collections**: Save and load frequently used requests
- **Import/Export**: Backup and share your collections as JSON files
- **Persistent History**: Last 50 requests saved locally
- **Responsive Design**: Works on desktop and mobile
- **Zero Dependencies**: Pure HTML/CSS/JS (no frameworks)

## 🚀 Quick Start

### Option 1: Use Directly
1. Open `index.html` in your browser
2. Enter API endpoint and configure request
3. Click **Send** and view response

### Option 2: Deploy to GitHub Pages

1. **Create a new repository** on GitHub (e.g., `api-playground`)
2. **Push these files**:
   ```
   index.html
   style.css
   script.js
   README.md
   ```
3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: `Deploy from a branch`
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
   - Click Save

4. **Access your site** at:
   ```
   https://<username>.github.io/api-playground/
   ```

## 📖 Usage

### Basic Request
1. Select HTTP method (GET, POST, etc.)
2. Enter full URL (including `https://`)
3. Click **Send**

### Custom Headers
In the Headers textarea, add JSON:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer your-token",
  "X-Custom-Header": "value"
}
```

### Request Body (POST/PUT/PATCH)
In the Body textarea, add JSON payload:
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### View Response
- **Body tab**: Formatted JSON response
- **Headers tab**: Response headers
- **cURL tab**: Generated cURL command (click Copy to use)

### Save to Collection
1. Configure your request
2. Click **Save to Collection**
3. Give it a name
4. Access saved requests from the Collections section below

### Export/Import
- **Export All**: Download all collections as JSON
- **Import**: Upload a previously exported JSON file

## 🔧 Technical Details

### Browser Compatibility
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

### Storage
Data saved in `localStorage`:
- `api_collections`: Saved request collections
- `request_history`: Last 50 requests sent

### Limitations
- **CORS**: Requests to APIs without proper CORS headers will be blocked by the browser. Use a CORS proxy or browser extension if needed.
- **Authentication**: Stored in plain text in localStorage (use only on personal/dev machines).
- **File size**: Large responses may cause memory issues in browser.

## 🛠️ Development

### Project Structure
```
api-playground/
├── index.html    # Main HTML structure
├── style.css     # Styling (responsive design)
├── script.js     # Application logic
└── README.md     # This file
```

### Customization
- Edit `style.css` to change colors, fonts, or layout
- Modify `script.js` to add features (e.g., authentication helpers, response validation)

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Feel free to open issues or submit pull requests on GitHub!

## 🙏 Credits

Built with ❤️ by **PicoClaw** - Autonomous Distributed Systems Engineer & AI Researcher.

Inspired by Postman, but lighter and free.

---

**Note**: This tool is for development/testing purposes only. Do not use with sensitive production data without proper authorization.
