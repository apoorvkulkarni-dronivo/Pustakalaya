//
//  Book.swift
//  Library Managment
//
//  Author: Apoorv Kulkarni
//  Email: https://ak-apoorvkulkarni.github.io/
//  Description: Data model for Book entity with all required properties
//

import Foundation
import SwiftUI

struct Book: Identifiable, Codable {
    let id: UUID
    var title: String
    var author: String
    var language: String
    var category: BookCategory
    var numberOfPages: Int
    var isbn: String?
    var coverImage: Data?
    var dateAdded: Date
    var isLent: Bool
    var lendingRecord: LendingRecord?
    
    init(title: String, author: String, language: String, category: BookCategory, numberOfPages: Int, isbn: String? = nil, coverImage: Data? = nil) {
        self.id = UUID()
        self.title = title
        self.author = author
        self.language = language
        self.category = category
        self.numberOfPages = numberOfPages
        self.isbn = isbn
        self.coverImage = coverImage
        self.dateAdded = Date()
        self.isLent = false
        self.lendingRecord = nil
    }
}

enum BookCategory: String, CaseIterable, Codable {
    case fiction = "Fiction"
    case nonFiction = "Non-Fiction"
    case science = "Science"
    case technology = "Technology"
    case history = "History"
    case biography = "Biography"
    case selfHelp = "Self Help"
    case business = "Business"
    case art = "Art"
    case cooking = "Cooking"
    case travel = "Travel"
    case health = "Health"
    case education = "Education"
    case children = "Children"
    case other = "Other"
    
    var icon: String {
        switch self {
        case .fiction: return "book.closed"
        case .nonFiction: return "book"
        case .science: return "atom"
        case .technology: return "laptopcomputer"
        case .history: return "clock"
        case .biography: return "person.circle"
        case .selfHelp: return "heart"
        case .business: return "briefcase"
        case .art: return "paintbrush"
        case .cooking: return "fork.knife"
        case .travel: return "airplane"
        case .health: return "cross"
        case .education: return "graduationcap"
        case .children: return "teddybear"
        case .other: return "questionmark.circle"
        }
    }
    
    var color: Color {
        switch self {
        case .fiction: return .purple
        case .nonFiction: return .blue
        case .science: return .green
        case .technology: return .orange
        case .history: return .brown
        case .biography: return .pink
        case .selfHelp: return .mint
        case .business: return .indigo
        case .art: return .red
        case .cooking: return .yellow
        case .travel: return .cyan
        case .health: return .green
        case .education: return .blue
        case .children: return .pink
        case .other: return .gray
        }
    }
}

struct LendingRecord: Identifiable, Codable {
    let id: UUID
    var borrowerName: String
    var borrowerContact: String?
    var dateLent: Date
    var expectedReturnDate: Date?
    var notes: String?
    var isReturned: Bool
    var dateReturned: Date?
    
    init(borrowerName: String, borrowerContact: String? = nil, expectedReturnDate: Date? = nil, notes: String? = nil) {
        self.id = UUID()
        self.borrowerName = borrowerName
        self.borrowerContact = borrowerContact
        self.dateLent = Date()
        self.expectedReturnDate = expectedReturnDate
        self.notes = notes
        self.isReturned = false
        self.dateReturned = nil
    }
}
