//
//  LibraryManager.swift
//  Library Managment
//
//  Author: Apoorv Kulkarni
//  Email: https://ak-apoorvkulkarni.github.io/
//  Description: ViewModel for managing library data and operations
//

import Foundation
import SwiftUI
import VisionKit

class LibraryManager: ObservableObject {
    @Published var books: [Book] = []
    @Published var searchText = ""
    @Published var selectedCategory: BookCategory?
    
    private let userDefaults = UserDefaults.standard
    private let booksKey = "SavedBooks"
    
    init() {
        loadBooks()
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
        
        if let category = selectedCategory {
            filtered = filtered.filter { $0.category == category }
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
    
    func filterByCategory(_ category: BookCategory?) {
        selectedCategory = category
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
            Book(title: "The Great Gatsby", author: "F. Scott Fitzgerald", language: "English", category: .fiction, numberOfPages: 180, isbn: "9780743273565"),
            Book(title: "Sapiens", author: "Yuval Noah Harari", language: "English", category: .history, numberOfPages: 443, isbn: "9780062316097"),
            Book(title: "Clean Code", author: "Robert C. Martin", language: "English", category: .technology, numberOfPages: 464, isbn: "9780132350884"),
            Book(title: "Atomic Habits", author: "James Clear", language: "English", category: .selfHelp, numberOfPages: 320, isbn: "9780735211292")
        ]
        
        for book in sampleBooks {
            if !books.contains(where: { $0.title == book.title }) {
                books.append(book)
            }
        }
        saveBooks()
    }
}
