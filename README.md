# Personal Library Management iOS App

A modern, feature-rich iOS application for managing your personal book collection, built with SwiftUI for iPhone 14 and compatible devices.

## Features

### 📚 Book Management
- **Barcode Scanning**: Scan ISBN barcodes to automatically populate book information
- **Manual Entry**: Add books manually with all required details
- **Cover Photos**: Add custom cover images from your photo library
- **Comprehensive Details**: Track title, author, language, category, page count, and ISBN

### 📖 Library Organization
- **Smart Categories**: 15 predefined categories with custom icons and colors
- **Search & Filter**: Find books quickly with real-time search and category filtering
- **Visual Library**: Beautiful card-based interface showing book covers and details
- **Statistics**: Track your collection with detailed analytics

### 🤝 Lending Management
- **Track Lending**: Record who you've lent books to and when
- **Contact Information**: Store borrower contact details
- **Return Dates**: Set and track expected return dates
- **Overdue Alerts**: Visual indicators for overdue books
- **Lending History**: Complete record of all lending activities

### 🎨 Modern Design
- **iOS Native**: Built with SwiftUI following Apple's design guidelines
- **Custom Typography**: Professional font system with rounded design
- **Color-Coded Categories**: Each book category has its own color and icon
- **Responsive Layout**: Optimized for iPhone 14 and other iOS devices
- **Smooth Animations**: Delightful micro-interactions throughout the app

## Technical Features

### 🏗️ Architecture
- **MVVM Pattern**: Clean separation of concerns with ViewModels
- **SwiftUI**: Modern declarative UI framework
- **UserDefaults Storage**: Local data persistence
- **Codable Models**: Type-safe data structures

### 📱 iOS Integration
- **VisionKit**: Advanced barcode scanning capabilities
- **AVFoundation**: Camera integration for ISBN scanning
- **PhotosUI**: Native photo picker integration
- **Tab Navigation**: Intuitive multi-tab interface

### 🔧 Data Management
- **Local Storage**: All data stored locally on device
- **JSON Serialization**: Efficient data encoding/decoding
- **Sample Data**: Pre-loaded sample books for testing
- **Export/Import**: Foundation for future data portability

## App Structure

```
Library Managment/
├── Models/
│   └── Book.swift                 # Core data models
├── ViewModels/
│   └── LibraryManager.swift      # Business logic and data management
├── Views/
│   ├── Components/
│   │   ├── BarcodeScannerView.swift
│   │   └── DesignSystem.swift
│   ├── AddBookView.swift         # Book entry form
│   ├── BookDetailView.swift      # Individual book details
│   ├── LibraryView.swift         # Main library interface
│   ├── LentBooksView.swift       # Lending management
│   └── MainTabView.swift         # Tab navigation
├── ContentView.swift             # Root view
└── Library_ManagmentApp.swift    # App entry point
```

## Getting Started

### Prerequisites
- Xcode 15.0 or later
- iOS 17.0 or later
- iPhone 14 or compatible device

### Installation
1. Open `Library Managment.xcodeproj` in Xcode
2. Select your target device (iPhone 14 recommended)
3. Build and run the project (⌘+R)

### First Launch
- The app includes sample data to demonstrate functionality
- Tap the "+" button to add your first book
- Use the barcode scanner to quickly add books with ISBN codes
- Explore the different tabs to see all features

## Usage Guide

### Adding Books
1. **Via Barcode Scanner**:
   - Tap "Add Book" → "Scan ISBN Barcode"
   - Point camera at book's barcode
   - Review and complete book details

2. **Manual Entry**:
   - Tap "Add Book"
   - Fill in all required fields
   - Add cover photo (optional)
   - Select appropriate category

### Managing Your Library
- **Search**: Use the search bar to find specific books
- **Filter**: Tap category chips to filter by book type
- **View Details**: Tap any book card to see full details
- **Edit/Delete**: Use the menu in book detail view

### Lending Books
1. Open book details
2. Tap "Lend to Someone"
3. Enter borrower information
4. Set expected return date
5. Add notes (optional)
6. Confirm lending

### Tracking Returns
- View all lent books in the "Lent Out" tab
- Overdue books are highlighted in red
- Tap any lent book to mark as returned

## Categories

The app includes 15 predefined categories:
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

Each category has a unique icon and color for easy visual identification.

## Data Privacy

- **Local Storage Only**: All data remains on your device
- **No Cloud Sync**: Your library is private and secure
- **No Analytics**: No usage data is collected or transmitted
- **User Control**: You have complete control over your data

## Future Enhancements

Planned features for future updates:
- **Cloud Sync**: iCloud integration for data backup
- **Export/Import**: CSV and JSON data portability
- **Reading Progress**: Track reading status and progress
- **Wishlist**: Maintain a list of books you want to read
- **Reviews & Ratings**: Rate and review your books
- **Social Features**: Share recommendations with friends
- **Widgets**: Home screen widgets for quick access

## Support

For questions, suggestions, or bug reports:
- **Author**: Apoorv Kulkarni
- **Email**: apoorv.kulkarni@dronivo.com

## License

This project is created for personal use. All rights reserved.

---

**Built with ❤️ using SwiftUI for iOS**
