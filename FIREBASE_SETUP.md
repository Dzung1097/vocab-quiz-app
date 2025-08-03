# Firebase Setup for Data Sync

## 🔥 Setup Firebase Project

### 1. Tạo Firebase Project
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Đặt tên: `vocab-quiz-app`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Thêm Web App
1. Click "Add app" → "Web"
2. Đặt tên: `vocab-quiz-app-web`
3. Copy config object

### 3. Cấu hình Firestore
1. Vào "Firestore Database"
2. Click "Create database"
3. Chọn "Start in test mode"
4. Chọn location gần nhất

### 4. Cập nhật Config
Thay thế config trong `index.html`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🔄 Cách hoạt động

### Sync Flow:
1. **User tạo chủ đề** → Lưu vào localStorage
2. **localStorage.setItem** → Trigger sync to Firebase
3. **Firebase Firestore** → Lưu data với user ID
4. **Realtime listener** → Sync về các thiết bị khác

### Features:
- ✅ **Anonymous auth** - Không cần đăng ký
- ✅ **Real-time sync** - Tự động đồng bộ
- ✅ **Offline support** - Hoạt động offline
- ✅ **Cross-device** - Mobile ↔ Desktop

## 🚀 Deploy

1. **Setup Firebase config** như trên
2. **Deploy lên GitHub Pages**
3. **Test sync** giữa mobile và desktop

## 📱 Test

1. **Tạo chủ đề** trên desktop
2. **Mở mobile** → Refresh trang
3. **Chủ đề sẽ xuất hiện** tự động
4. **Debug panel** hiển thị: `🟢 Online`

## 💰 Cost

- **Free tier**: 50,000 reads/day, 20,000 writes/day
- **Đủ cho app nhỏ** với vài trăm users
- **Không cần credit card** để setup 