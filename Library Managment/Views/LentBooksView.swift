//
//  LentBooksView.swift
//  Library Managment
//
//  Author: Apoorv Kulkarni
//  Portfolio: https://ak-apoorvkulkarni.github.io/
//  Description: View for managing lent books and tracking lending records
//

import SwiftUI

struct LentBooksView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    @State private var showingBookDetail: Book?
    @State private var selectedTab: LendingTab = .active
    
    enum LendingTab: String, CaseIterable {
        case active = "Active"
        case history = "History"
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Tab Picker
                Picker("Tab", selection: $selectedTab) {
                    ForEach(LendingTab.allCases, id: \.self) { tab in
                        Text(tab.rawValue).tag(tab)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                if selectedTab == .active {
                    if libraryManager.lentBooks.isEmpty {
                        activeEmptyStateView
                    } else {
                        lentBooksListView
                    }
                } else {
                    if booksWithHistory.isEmpty {
                        historyEmptyStateView
                    } else {
                        lendingHistoryListView
                    }
                }
            }
            .navigationTitle("Lent Books")
            .navigationBarTitleDisplayMode(.large)
        }
        .sheet(item: $showingBookDetail) { book in
            BookDetailView(book: book)
        }
    }
    
    private var booksWithHistory: [Book] {
        libraryManager.books.filter { $0.lendingRecord != nil }
    }
    
    private var activeEmptyStateView: some View {
        VStack(spacing: 20) {
            Spacer()
            
            Image(systemName: "person.circle")
                .font(.system(size: 80))
                .foregroundColor(.gray)
            
            Text("No Books Lent Out")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Books you lend to friends will appear here")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Spacer()
        }
        .padding()
    }
    
    private var historyEmptyStateView: some View {
        VStack(spacing: 20) {
            Spacer()
            
            Image(systemName: "clock.arrow.circlepath")
                .font(.system(size: 80))
                .foregroundColor(.gray)
            
            Text("No Lending History")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Books you lend to friends will appear here with their complete history")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Spacer()
        }
        .padding()
    }
    
    private var lentBooksListView: some View {
        ScrollView(.vertical, showsIndicators: true) {
            LazyVStack(spacing: 12) {
                ForEach(libraryManager.lentBooks) { book in
                    LentBookCard(book: book) {
                        showingBookDetail = book
                    }
                }
            }
            .padding()
            .padding(.bottom, 100)
        }
    }
    
    private var lendingHistoryListView: some View {
        ScrollView(.vertical, showsIndicators: true) {
            LazyVStack(spacing: 12) {
                ForEach(booksWithHistory.sorted { $0.lendingRecord?.dateLent ?? Date.distantPast > $1.lendingRecord?.dateLent ?? Date.distantPast }) { book in
                    LendingHistoryCard(book: book) {
                        showingBookDetail = book
                    }
                }
            }
            .padding()
            .padding(.bottom, 100)
        }
    }
}

struct LentBookCard: View {
    @EnvironmentObject var libraryManager: LibraryManager
    let book: Book
    let onTap: () -> Void
    @State private var showingReturnConfirmation = false
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 16) {
                HStack(spacing: 16) {
                    // Cover Image
                    Group {
                        if let coverData = book.coverImage,
                           let coverImage = UIImage(data: coverData) {
                            Image(uiImage: coverImage)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } else {
                            Image(systemName: "book.closed")
                                .font(.system(size: 30))
                                .foregroundColor(book.primaryCategory.color)
                        }
                    }
                    .frame(width: 50, height: 70)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                    
                    // Book Info
                    VStack(alignment: .leading, spacing: 4) {
                        Text(book.title)
                            .font(.headline)
                            .fontWeight(.semibold)
                            .lineLimit(2)
                            .multilineTextAlignment(.leading)
                        
                        Text(book.author)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                        
                        HStack {
                            if book.categories.count == 1 {
                                Image(systemName: book.categories.first!.icon)
                                    .font(.caption)
                                    .foregroundColor(book.categories.first!.color)
                                
                                Text(book.categories.first!.rawValue)
                                    .font(.caption)
                                    .foregroundColor(book.categories.first!.color)
                            } else {
                                HStack(spacing: 2) {
                                    ForEach(Array(book.categories.prefix(2)), id: \.self) { category in
                                        Image(systemName: category.icon)
                                            .font(.caption2)
                                            .foregroundColor(category.color)
                                    }
                                    if book.categories.count > 2 {
                                        Text("+\(book.categories.count - 2)")
                                            .font(.caption2)
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                // Lending Info
                if let lendingRecord = book.lendingRecord {
                    VStack(spacing: 8) {
                        HStack {
                            Image(systemName: "person.fill")
                                .font(.caption)
                                .foregroundColor(.orange)
                            
                            Text("Lent to: \(lendingRecord.borrowerName)")
                                .font(.subheadline)
                                .fontWeight(.medium)
                            
                            Spacer()
                        }
                        
                        HStack {
                            Image(systemName: "calendar")
                                .font(.caption)
                                .foregroundColor(.orange)
                            
                            Text("Lent on: \(DateFormatter.shortDate.string(from: lendingRecord.dateLent))")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Spacer()
                            
                            if let expectedReturn = lendingRecord.expectedReturnDate {
                                let isOverdue = expectedReturn < Date()
                                
                                HStack(spacing: 4) {
                                    Image(systemName: isOverdue ? "exclamationmark.triangle.fill" : "clock")
                                        .font(.caption)
                                        .foregroundColor(isOverdue ? .red : .orange)
                                    
                                    Text("Due: \(DateFormatter.shortDate.string(from: expectedReturn))")
                                        .font(.caption)
                                        .foregroundColor(isOverdue ? .red : .secondary)
                                }
                            }
                        }
                        
                        if let contact = lendingRecord.borrowerContact, !contact.isEmpty {
                            HStack {
                                Image(systemName: "phone")
                                    .font(.caption)
                                    .foregroundColor(.orange)
                                
                                Text("Contact: \(contact)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                Spacer()
                            }
                        }
                        
                        if let notes = lendingRecord.notes, !notes.isEmpty {
                            HStack(alignment: .top) {
                                Image(systemName: "note.text")
                                    .font(.caption)
                                    .foregroundColor(.orange)
                                
                                Text("Notes: \(notes)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.leading)
                                
                                Spacer()
                            }
                        }
                        
                        // Return Button
                        Button(action: { showingReturnConfirmation = true }) {
                            HStack {
                                Image(systemName: "arrow.uturn.left.circle.fill")
                                Text("Mark as Returned")
                            }
                            .font(.caption)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(Color.green)
                            .cornerRadius(8)
                        }
                    }
                    .padding()
                    .background(Color.orange.opacity(0.1))
                    .cornerRadius(8)
                }
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
        .alert("Return Book", isPresented: $showingReturnConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Return", role: .destructive) {
                libraryManager.returnBook(book)
            }
        } message: {
            Text("Are you sure you want to mark this book as returned? The lending history will be preserved.")
        }
    }
}

struct LendingHistoryCard: View {
    let book: Book
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 16) {
                HStack(spacing: 16) {
                    // Cover Image
                    Group {
                        if let coverData = book.coverImage,
                           let coverImage = UIImage(data: coverData) {
                            Image(uiImage: coverImage)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } else {
                            Image(systemName: "book.closed")
                                .font(.system(size: 30))
                                .foregroundColor(book.primaryCategory.color)
                        }
                    }
                    .frame(width: 50, height: 70)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                    
                    // Book Info
                    VStack(alignment: .leading, spacing: 4) {
                        Text(book.title)
                            .font(.headline)
                            .fontWeight(.semibold)
                            .lineLimit(2)
                            .multilineTextAlignment(.leading)
                        
                        Text(book.author)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                        
                        HStack {
                            if book.categories.count == 1 {
                                Image(systemName: book.categories.first!.icon)
                                    .font(.caption)
                                    .foregroundColor(book.categories.first!.color)
                                
                                Text(book.categories.first!.rawValue)
                                    .font(.caption)
                                    .foregroundColor(book.categories.first!.color)
                            } else {
                                HStack(spacing: 2) {
                                    ForEach(Array(book.categories.prefix(2)), id: \.self) { category in
                                        Image(systemName: category.icon)
                                            .font(.caption2)
                                            .foregroundColor(category.color)
                                    }
                                    if book.categories.count > 2 {
                                        Text("+\(book.categories.count - 2)")
                                            .font(.caption2)
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                // Lending History Info
                if let lendingRecord = book.lendingRecord {
                    VStack(spacing: 12) {
                        // Status Header
                        HStack {
                            Image(systemName: book.isLent ? "person.circle.fill" : "checkmark.circle.fill")
                                .foregroundColor(book.isLent ? .orange : .green)
                            
                            Text(book.isLent ? "Currently Lent To" : "Returned")
                                .font(.headline)
                                .foregroundColor(book.isLent ? .orange : .green)
                            
                            Spacer()
                        }
                        
                        // Borrower Info
                        HStack {
                            Text("Borrower:")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(lendingRecord.borrowerName)
                                .font(.subheadline)
                                .fontWeight(.medium)
                        }
                        
                        if let contact = lendingRecord.borrowerContact, !contact.isEmpty {
                            HStack {
                                Text("Contact:")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text(contact)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                            }
                        }
                        
                        // Dates
                        HStack {
                            Text("Lent on:")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(DateFormatter.shortDate.string(from: lendingRecord.dateLent))
                                .font(.subheadline)
                                .fontWeight(.medium)
                        }
                        
                        if let expectedReturn = lendingRecord.expectedReturnDate {
                            HStack {
                                Text("Expected return:")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Spacer()
                                let isOverdue = expectedReturn < Date() && book.isLent
                                Text(DateFormatter.shortDate.string(from: expectedReturn))
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundColor(isOverdue ? .red : .primary)
                            }
                        }
                        
                        if let dateReturned = lendingRecord.dateReturned {
                            HStack {
                                Text("Returned on:")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text(DateFormatter.shortDate.string(from: dateReturned))
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundColor(.green)
                            }
                        }
                        
                        if let notes = lendingRecord.notes, !notes.isEmpty {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Notes:")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Text(notes)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                            }
                        }
                    }
                    .padding()
                    .background(book.isLent ? Color.orange.opacity(0.1) : Color.green.opacity(0.1))
                    .cornerRadius(8)
                }
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    LentBooksView()
        .environmentObject(LibraryManager())
}
