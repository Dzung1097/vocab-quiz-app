# Vocab Quiz App

Ứng dụng trắc nghiệm từ vựng Tiếng Anh được xây dựng với React, TypeScript và Google Gemini AI.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `VITE_GEMINI_API_KEY` environment variable:
   - Create `.env.local` file
   - Add: `VITE_GEMINI_API_KEY=your_gemini_api_key_here`

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open browser: `http://localhost:5173`

## Deploy to GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update homepage in package.json:**
   Replace `your-username` with your actual GitHub username:
   ```json
   "homepage": "https://your-username.github.io/vocab-quiz-app"
   ```

3. **Build and deploy:**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to your repo Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` → Save

5. **Set environment variable:**
   - Go to repo Settings → Secrets and variables → Actions
   - Add repository secret: `VITE_GEMINI_API_KEY` = your API key

## Features

- 🎯 Multiple quiz types (English-Vietnamese, Vietnamese-English, Mixed)
- 📚 Predefined vocabulary topics
- ✏️ Custom vocabulary input
- 🔊 AI-generated phonetics
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- ⌨️ Keyboard shortcuts:
  - **1, 2, 3, 4**: Chọn đáp án (từ trái sang phải, trên xuống dưới)
  - **← →**: Chuyển câu hỏi
  - **Enter**: Nộp bài
