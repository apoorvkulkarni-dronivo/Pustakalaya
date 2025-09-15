
//  LibraryManager.swift
//  Library Managment
//
//  Author: Apoorv Kulkarni
//  Portfolio: https://ak-apoorvkulkarni.github.io/
//  Description: ViewModel for managing library data and operations
//

import Foundation
import SwiftUI
import VisionKit

class LibraryManager: ObservableObject {
    @Published var books: [Book] = []
    @Published var wishlistItems: [WishlistItem] = []
    @Published var searchText = ""
    @Published var selectedCategories: Set<BookCategory> = []
    @Published var selectedLanguages: Set<String> = []
    
    private let userDefaults = UserDefaults.standard
    private let booksKey = "SavedBooks"
    private let wishlistKey = "SavedWishlist"
    
    init() {
        loadBooks()
        loadWishlist()
    }
    
    var filteredBooks: [Book] {
        var filtered = books
        
        if !searchText.isEmpty {
            filtered = filtered.filter { book in
                book.title.localizedCaseInsensitiveContains(searchText) ||
                book.author.localizedCaseInsensitiveContains(searchText) ||
                book.isbn?.localizedCaseInsensitiveContains(searchText) == true
            }
        }
        
        if !selectedCategories.isEmpty {
            filtered = filtered.filter { book in
                !Set(book.categories).isDisjoint(with: selectedCategories)
            }
        }
        
        if !selectedLanguages.isEmpty {
            filtered = filtered.filter { book in
                selectedLanguages.contains(book.language)
            }
        }
        
        return filtered.sorted { $0.title < $1.title }
    }
    
    var lentBooks: [Book] {
        books.filter { $0.isLent }
    }
    
    var availableBooks: [Book] {
        books.filter { !$0.isLent }
    }
    
    func addBook(_ book: Book) {
        books.append(book)
        saveBooks()
    }
    
    func updateBook(_ book: Book) {
        if let index = books.firstIndex(where: { $0.id == book.id }) {
            books[index] = book
            saveBooks()
        }
    }
    
    func deleteBook(_ book: Book) {
        books.removeAll { $0.id == book.id }
        saveBooks()
    }
    
    func lendBook(_ book: Book, to borrowerName: String, contact: String? = nil, expectedReturn: Date? = nil, notes: String? = nil) {
        if let index = books.firstIndex(where: { $0.id == book.id }) {
            let lendingRecord = LendingRecord(
                borrowerName: borrowerName,
                borrowerContact: contact,
                expectedReturnDate: expectedReturn,
                notes: notes
            )
            books[index].isLent = true
            books[index].lendingRecord = lendingRecord
            saveBooks()
        }
    }
    
    func returnBook(_ book: Book) {
        if let index = books.firstIndex(where: { $0.id == book.id }) {
            books[index].isLent = false
            books[index].lendingRecord?.isReturned = true
            books[index].lendingRecord?.dateReturned = Date()
            saveBooks()
        }
    }
    
    func searchBooks(query: String) {
        searchText = query
    }
    
    func toggleCategory(_ category: BookCategory) {
        if selectedCategories.contains(category) {
            selectedCategories.remove(category)
        } else {
            selectedCategories.insert(category)
        }
    }
    
    func toggleLanguage(_ language: String) {
        if selectedLanguages.contains(language) {
            selectedLanguages.remove(language)
        } else {
            selectedLanguages.insert(language)
        }
    }
    
    func clearAllFilters() {
        selectedCategories.removeAll()
        selectedLanguages.removeAll()
    }
    
    func clearAllData() {
        books.removeAll()
        wishlistItems.removeAll()
        selectedCategories.removeAll()
        selectedLanguages.removeAll()
        searchText = ""
        saveBooks()
        saveWishlist()
    }
    
    private func saveBooks() {
        if let encoded = try? JSONEncoder().encode(books) {
            userDefaults.set(encoded, forKey: booksKey)
        }
    }
    
    private func loadBooks() {
        if let data = userDefaults.data(forKey: booksKey),
           let decoded = try? JSONDecoder().decode([Book].self, from: data) {
            books = decoded
        }
    }
    
    // Mock data for testing
    func addSampleData() {
        let sampleBooks = [
            Book(title: "The Great Gatsby", author: "F. Scott Fitzgerald", language: "English", categories: [.fiction], numberOfPages: 180, isbn: "9780743273565"),
            Book(title: "Sapiens", author: "Yuval Noah Harari", language: "English", categories: [.history, .nonFiction], numberOfPages: 443, isbn: "9780062316097"),
            Book(title: "Clean Code", author: "Robert C. Martin", language: "English", categories: [.technology, .education], numberOfPages: 464, isbn: "9780132350884"),
            Book(title: "Atomic Habits", author: "James Clear", language: "English", categories: [.selfHelp, .business], numberOfPages: 320, isbn: "9780735211292")
        ]
        
        for book in sampleBooks {
            if !books.contains(where: { $0.title == book.title }) {
                books.append(book)
            }
        }
        saveBooks()
    }
    
    // MARK: - Wishlist Methods
    
    func addWishlistItem(_ item: WishlistItem) {
        wishlistItems.append(item)
        saveWishlist()
    }
    
    func removeWishlistItem(_ item: WishlistItem) {
        wishlistItems.removeAll { $0.id == item.id }
        saveWishlist()
    }
    
    func updateWishlistItem(_ item: WishlistItem) {
        if let index = wishlistItems.firstIndex(where: { $0.id == item.id }) {
            wishlistItems[index] = item
            saveWishlist()
        }
    }
    
    func moveWishlistToLibrary(_ item: WishlistItem) -> Book {
        let book = Book(
            title: item.title,
            author: item.author,
            language: "English", // Default language
            categories: [.fiction], // Default category
            numberOfPages: 0, // Will be updated later
            isbn: item.isbn,
            coverImage: item.coverImage
        )
        
        addBook(book)
        removeWishlistItem(item)
        return book
    }
    
    private func loadWishlist() {
        if let data = userDefaults.data(forKey: wishlistKey),
           let decoded = try? JSONDecoder().decode([WishlistItem].self, from: data) {
            wishlistItems = decoded
        }
    }
    
    private func saveWishlist() {
        if let encoded = try? JSONEncoder().encode(wishlistItems) {
            userDefaults.set(encoded, forKey: wishlistKey)
        }
    }
}
