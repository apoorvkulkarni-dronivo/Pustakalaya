# My Library - Personal Library Management iOS App

A comprehensive, modern iOS application for managing your personal book collection, built with SwiftUI for iPhone 14 and compatible devices. Track your books, manage lending, maintain wishlists, and analyze your reading habits with beautiful, intuitive design.

## ✨ Key Features

### 📚 Advanced Book Management
- **Barcode/ISBN Scanning**: Scan ISBN barcodes to automatically fetch complete book information including title, author, language, categories, and page count
- **Manual Entry**: Add books manually with comprehensive details
- **Cover Image Management**: 
  - Capture book covers directly with camera
  - Select from photo library
  - Crop and retake functionality
  - Automatic image compression for storage efficiency
- **Book Editing**: Edit any book details after adding
- **Comprehensive Details**: Track title, author, language, category, page count, ISBN, and custom notes

### 🎯 Smart Organization & Filtering
- **Multi-Category Support**: Books can have multiple categories simultaneously
- **Advanced Filtering**: 
  - Multi-select category filtering
  - Language-based filtering (English, Marathi, Hindi, German)
  - Real-time search functionality
- **Visual Library**: Beautiful card-based interface with book covers and key details
- **Statistics Dashboard**: 
  - Total books count
  - Category-wise breakdown
  - Language-wise statistics
  - Reading progress insights

### 🤝 Complete Lending System
- **Track Lending**: Record who you've lent books to with contact information
- **Return Management**: 
  - Mark books as returned with date tracking
  - Complete lending history preservation
  - Active vs. historical lending views
- **Lending History**: Comprehensive record of all lending activities with timestamps
- **Contact Integration**: Store borrower contact details for easy follow-up

### 📝 Wishlist Management
- **Quick Add**: Rapidly add books to your wishlist with minimal information
- **Photo Capture**: Take photos of interesting books for future reference
- **Wishlist to Library**: Convert wishlist items to full library entries
- **Organized Tracking**: Keep track of books you want to read

### 🎨 Modern Design System
- **iOS Native**: Built with SwiftUI following Apple's latest design guidelines
- **Custom Design System**: 
  - Professional typography with rounded fonts
  - Consistent color palette
  - Custom button styles and animations
  - Beautiful gradients and shadows
- **Responsive Layout**: Optimized for iPhone 14 and all iOS devices
- **Smooth Animations**: Delightful micro-interactions and transitions
- **Accessibility**: Full VoiceOver support and accessibility features

## 🏗️ Technical Architecture

### **MVVM Pattern**
- Clean separation of concerns with ViewModels
- Reactive data binding with `@Published` properties
- Centralized data management through `LibraryManager`

### **SwiftUI Framework**
- Modern declarative UI framework
- Custom components and reusable views
- Advanced navigation with TabView and NavigationView
- Sheet presentations and modal interactions

### **Data Persistence**
- **UserDefaults Storage**: Local data persistence for all user data
- **JSON Serialization**: Efficient Codable models for data encoding/decoding
- **Data Management**: 
  - Clear all data functionality with double confirmation
  - No automatic sample data (clean slate approach)
  - Robust error handling and data validation

### **iOS Integration**
- **VisionKit**: Advanced barcode scanning with ISBN recognition
- **AVFoundation**: Camera integration for book cover capture
- **PhotosUI**: Native photo picker with modern interface
- **UIKit Integration**: Custom camera controls and image cropping

### **External APIs**
- **Open Library API**: Fetch book details by ISBN
- **Google Books API**: Alternative book information source
- **Automatic Data Population**: Complete book information retrieval

## 📱 App Structure

```
Library Managment/
├── Models/
│   ├── Book.swift                    # Core book data model
│   └── WishlistItem.swift           # Wishlist item model
├── ViewModels/
│   └── LibraryManager.swift         # Central data management
├── Services/
│   └── BookAPIService.swift         # External API integration
├── Views/
│   ├── Components/
│   │   ├── BarcodeScannerView.swift # ISBN scanning interface
│   │   ├── CameraCaptureView.swift  # Camera integration
│   │   ├── ImagePickerView.swift    # Photo library picker
│   │   └── DesignSystem.swift       # Custom UI components
│   ├── AddBookView.swift            # Book entry form
│   ├── BookDetailView.swift         # Individual book details
│   ├── EditBookView.swift           # Book editing interface
│   ├── LibraryView.swift            # Main library interface
│   ├── LentBooksView.swift          # Lending management
│   ├── WishlistView.swift           # Wishlist management
│   ├── QuickAddWishlistView.swift   # Quick wishlist entry
│   ├── SettingsView.swift           # App settings and info
│   ├── StatisticsView.swift         # Analytics dashboard
│   └── MainTabView.swift            # Tab navigation
├── Assets.xcassets/                 # App icons and images
├── ContentView.swift                # Root view
└── Library_ManagmentApp.swift       # App entry point
```

## 🚀 Getting Started

### Prerequisites
- **Xcode 15.0+** (recommended)
- **iOS 17.0+** target
- **iPhone 14** or compatible device
- **Apple Developer Account** (for device installation)

### Installation
1. **Clone Repository**:
   ```bash
   git clone https://github.com/ak-apoorvkulkarni/Library-Management-iOS.git
   cd Library-Management-iOS
   ```

2. **Open in Xcode**:
   - Open `Library Managment.xcodeproj` in Xcode
   - Select your target device (iPhone 14 recommended)
   - Configure signing with your Apple Developer account

3. **Build and Run**:
   - Press `⌘+R` to build and run
   - Or use `⌘+B` to build only

### First Launch
- The app starts with a clean, empty library
- Tap the "+" button to add your first book
- Use the barcode scanner for quick ISBN-based entry
- Explore all tabs to discover features

## 📖 Usage Guide

### Adding Books

#### **Via Barcode Scanner** (Recommended)
1. Tap "Add Book" → "Scan ISBN Barcode"
2. Point camera at book's barcode
3. Review automatically populated information
4. Add cover photo and complete details
5. Save to library

#### **Manual Entry**
1. Tap "Add Book"
2. Fill in title, author, and other details
3. Select categories (multiple selection supported)
4. Choose language from predefined options
5. Add cover photo (optional)
6. Save to library

#### **From Wishlist**
1. Go to Wishlist tab
2. Tap any wishlist item
3. Complete missing information
4. Convert to full library entry

### Managing Your Library

#### **Search & Filter**
- **Search**: Use the search bar for real-time book finding
- **Category Filter**: Multi-select category filtering
- **Language Filter**: Filter by English, Marathi, Hindi, or German
- **Combined Filters**: Use multiple filters simultaneously

#### **Book Management**
- **View Details**: Tap any book card for full information
- **Edit Book**: Modify any book details after adding
- **Delete Book**: Remove books from your collection
- **Statistics**: View collection analytics and insights

### Lending System

#### **Lending Books**
1. Open book details
2. Tap "Lend to Someone"
3. Enter borrower information
4. Add contact details (optional)
5. Confirm lending

#### **Tracking Returns**
- **Active Lending**: View currently lent books
- **Mark Returned**: Tap to mark books as returned
- **Lending History**: Complete record of all lending activities
- **Historical View**: See when books were lent and returned

### Wishlist Management

#### **Quick Add to Wishlist**
1. Go to Wishlist tab
2. Tap "Quick Add"
3. Enter book title and author
4. Take photo (optional)
5. Save to wishlist

#### **Converting to Library**
1. Tap wishlist item
2. Complete missing details
3. Convert to full library entry

### Settings & Data Management

#### **App Information**
- View app version and release date
- Access developer information
- Portfolio link integration

#### **Data Management**
- **Clear All Data**: Remove all books, wishlist, and lending records
- **Double Confirmation**: Prevents accidental data loss
- **Complete Reset**: Returns app to initial state

## 🏷️ Categories & Languages

### **Book Categories** (Multi-select supported)
- 📖 Fiction
- 📚 Non-Fiction
- ⚛️ Science
- 💻 Technology
- 🕐 History
- 👤 Biography
- ❤️ Self Help
- 💼 Business
- 🎨 Art
- 🍴 Cooking
- ✈️ Travel
- ⚕️ Health
- 🎓 Education
- 🧸 Children
- ❓ Other

### **Supported Languages**
- 🇺🇸 English
- 🇮🇳 Marathi
- 🇮🇳 Hindi
- 🇩🇪 German

## 🔒 Privacy & Security

- **Local Storage Only**: All data remains on your device
- **No Cloud Sync**: Your library is completely private
- **No Analytics**: No usage data is collected or transmitted
- **User Control**: Complete control over your data
- **Secure Storage**: Data encrypted using iOS security features

## 🎯 Key Improvements in This Version

### **Enhanced User Experience**
- ✅ Fixed app display name to "My Library"
- ✅ Removed automatic sample data addition
- ✅ Multi-select filtering for categories and languages
- ✅ Language-wise statistics dashboard
- ✅ Complete lending history with return tracking
- ✅ Book editing functionality
- ✅ Image compression for storage efficiency
- ✅ Camera integration with crop/retake options

### **Technical Enhancements**
- ✅ External API integration for book data
- ✅ Robust error handling and validation
- ✅ Clean data management with confirmation dialogs
- ✅ Modern SwiftUI architecture
- ✅ Custom design system implementation
- ✅ Comprehensive wishlist functionality

## 🛠️ Development

### **Code Quality**
- Clean, well-documented Swift code
- MVVM architecture pattern
- Comprehensive error handling
- Type-safe data models with Codable
- Modern SwiftUI best practices

### **Testing**
- Built for iPhone 14 and iOS 17+
- Tested on physical devices
- Comprehensive feature validation
- User experience optimization

## 📞 Support & Contact

- **Developer**: Apoorv Kulkarni
- **Portfolio**: [https://ak-apoorvkulkarni.github.io/](https://ak-apoorvkulkarni.github.io/)
- **GitHub**: [https://github.com/ak-apoorvkulkarni/Library-Management-iOS](https://github.com/ak-apoorvkulkarni/Library-Management-iOS)

## 📄 License

This project is created for personal use and educational purposes. All rights reserved.

---

**Built with ❤️ using SwiftUI for iOS**

*Version 1.0 - September 2025*