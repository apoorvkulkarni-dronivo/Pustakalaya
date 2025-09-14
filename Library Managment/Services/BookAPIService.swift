//  Author: Apoorv Kulkarni
//  Portfolio: https://ak-apoorvkulkarni.github.io/
//  Description: Service for fetching book details from ISBN using Open Library API
//

import Foundation

struct BookAPIService {
    static let shared = BookAPIService()
    
    private init() {}
    
    func fetchBookDetails(isbn: String) async throws -> BookDetails? {
        // Clean ISBN (remove hyphens and spaces)
        let cleanISBN = isbn.replacingOccurrences(of: "-", with: "").replacingOccurrences(of: " ", with: "")
        
        // Try Open Library API first
        if let bookDetails = try? await fetchFromOpenLibrary(isbn: cleanISBN) {
            return bookDetails
        }
        
        // Fallback to Google Books API
        if let bookDetails = try? await fetchFromGoogleBooks(isbn: cleanISBN) {
            return bookDetails
        }
        
        return nil
    }
    
    private func fetchFromOpenLibrary(isbn: String) async throws -> BookDetails? {
        let urlString = "https://openlibrary.org/isbn/\(isbn).json"
        guard let url = URL(string: urlString) else { return nil }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let openLibraryResponse = try JSONDecoder().decode(OpenLibraryResponse.self, from: data)
        
        let bookDetails = BookDetails(
            title: openLibraryResponse.title ?? "Unknown Title",
            author: openLibraryResponse.authors?.first?.name ?? "Unknown Author",
            language: openLibraryResponse.languages?.first?.key?.replacingOccurrences(of: "/languages/", with: "").uppercased() ?? "English",
            numberOfPages: openLibraryResponse.numberOfPages ?? 0,
            isbn: isbn,
            description: openLibraryResponse.description?.value ?? openLibraryResponse.description?.string,
            publishDate: openLibraryResponse.publishDate,
            publisher: openLibraryResponse.publishers?.first?.name,
            coverImageURL: openLibraryResponse.cover?.large ?? openLibraryResponse.cover?.medium,
            suggestedCategories: []
        )
        
        return suggestCategories(for: bookDetails)
    }
    
    private func fetchFromGoogleBooks(isbn: String) async throws -> BookDetails? {
        let urlString = "https://www.googleapis.com/books/v1/volumes?q=isbn:\(isbn)"
        guard let url = URL(string: urlString) else { return nil }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let googleBooksResponse = try JSONDecoder().decode(GoogleBooksResponse.self, from: data)
        
        guard let book = googleBooksResponse.items?.first?.volumeInfo else { return nil }
        
        let bookDetails = BookDetails(
            title: book.title ?? "Unknown Title",
            author: book.authors?.joined(separator: ", ") ?? "Unknown Author",
            language: book.language?.uppercased() ?? "English",
            numberOfPages: book.pageCount ?? 0,
            isbn: isbn,
            description: book.description,
            publishDate: book.publishedDate,
            publisher: book.publisher,
            coverImageURL: book.imageLinks?.thumbnail?.replacingOccurrences(of: "http://", with: "https://"),
            suggestedCategories: []
        )
        
        return suggestCategories(for: bookDetails)
    }
    
    private func suggestCategories(for bookDetails: BookDetails) -> BookDetails {
        var suggestedCategories: [BookCategory] = []
        let textToAnalyze = "\(bookDetails.title) \(bookDetails.author) \(bookDetails.description ?? "")".lowercased()
        
        // Analyze title, author, and description for category keywords
        if textToAnalyze.contains("fiction") || textToAnalyze.contains("novel") || textToAnalyze.contains("story") {
            suggestedCategories.append(.fiction)
        }
        
        if textToAnalyze.contains("science") || textToAnalyze.contains("physics") || textToAnalyze.contains("chemistry") || textToAnalyze.contains("biology") || textToAnalyze.contains("mathematics") {
            suggestedCategories.append(.science)
        }
        
        if textToAnalyze.contains("technology") || textToAnalyze.contains("computer") || textToAnalyze.contains("programming") || textToAnalyze.contains("software") || textToAnalyze.contains("digital") {
            suggestedCategories.append(.technology)
        }
        
        if textToAnalyze.contains("history") || textToAnalyze.contains("historical") || textToAnalyze.contains("war") || textToAnalyze.contains("ancient") {
            suggestedCategories.append(.history)
        }
        
        if textToAnalyze.contains("biography") || textToAnalyze.contains("autobiography") || textToAnalyze.contains("life of") {
            suggestedCategories.append(.biography)
        }
        
        if textToAnalyze.contains("business") || textToAnalyze.contains("management") || textToAnalyze.contains("finance") || textToAnalyze.contains("marketing") || textToAnalyze.contains("entrepreneur") {
            suggestedCategories.append(.business)
        }
        
        if textToAnalyze.contains("self help") || textToAnalyze.contains("self-help") || textToAnalyze.contains("motivation") || textToAnalyze.contains("personal development") || textToAnalyze.contains("success") {
            suggestedCategories.append(.selfHelp)
        }
        
        if textToAnalyze.contains("art") || textToAnalyze.contains("painting") || textToAnalyze.contains("design") || textToAnalyze.contains("creative") {
            suggestedCategories.append(.art)
        }
        
        if textToAnalyze.contains("cooking") || textToAnalyze.contains("recipe") || textToAnalyze.contains("food") || textToAnalyze.contains("culinary") {
            suggestedCategories.append(.cooking)
        }
        
        if textToAnalyze.contains("travel") || textToAnalyze.contains("guide") || textToAnalyze.contains("destination") || textToAnalyze.contains("tourism") {
            suggestedCategories.append(.travel)
        }
        
        if textToAnalyze.contains("health") || textToAnalyze.contains("medical") || textToAnalyze.contains("fitness") || textToAnalyze.contains("wellness") {
            suggestedCategories.append(.health)
        }
        
        if textToAnalyze.contains("education") || textToAnalyze.contains("learning") || textToAnalyze.contains("textbook") || textToAnalyze.contains("academic") {
            suggestedCategories.append(.education)
        }
        
        if textToAnalyze.contains("children") || textToAnalyze.contains("kids") || textToAnalyze.contains("young") || textToAnalyze.contains("juvenile") {
            suggestedCategories.append(.children)
        }
        
        // If no specific categories found, suggest non-fiction as default
        if suggestedCategories.isEmpty {
            suggestedCategories.append(.nonFiction)
        }
        
        return BookDetails(
            title: bookDetails.title,
            author: bookDetails.author,
            language: bookDetails.language,
            numberOfPages: bookDetails.numberOfPages,
            isbn: bookDetails.isbn,
            description: bookDetails.description,
            publishDate: bookDetails.publishDate,
            publisher: bookDetails.publisher,
            coverImageURL: bookDetails.coverImageURL,
            suggestedCategories: suggestedCategories
        )
    }
}

struct BookDetails {
    let title: String
    let author: String
    let language: String
    let numberOfPages: Int
    let isbn: String
    let description: String?
    let publishDate: String?
    let publisher: String?
    let coverImageURL: String?
    let suggestedCategories: [BookCategory]
}

// MARK: - Open Library API Models
struct OpenLibraryResponse: Codable {
    let title: String?
    let authors: [Author]?
    let languages: [Language]?
    let numberOfPages: Int?
    let description: Description?
    let publishDate: String?
    let publishers: [Publisher]?
    let cover: Cover?
    
    struct Author: Codable {
        let name: String
    }
    
    struct Language: Codable {
        let key: String?
    }
    
    struct Description: Codable {
        let value: String?
        let string: String?
    }
    
    struct Publisher: Codable {
        let name: String
    }
    
    struct Cover: Codable {
        let small: String?
        let medium: String?
        let large: String?
    }
}

// MARK: - Google Books API Models
struct GoogleBooksResponse: Codable {
    let items: [BookItem]?
    
    struct BookItem: Codable {
        let volumeInfo: VolumeInfo
    }
    
    struct VolumeInfo: Codable {
        let title: String?
        let authors: [String]?
        let language: String?
        let pageCount: Int?
        let description: String?
        let publishedDate: String?
        let publisher: String?
        let imageLinks: ImageLinks?
        
        struct ImageLinks: Codable {
            let thumbnail: String?
        }
    }
}
