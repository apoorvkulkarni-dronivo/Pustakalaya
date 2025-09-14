//
//  LentBooksView.swift
//  Library Managment
//
//  Author: Apoorv Kulkarni
//  Email: https://ak-apoorvkulkarni.github.io/
//  Description: View for managing lent books and tracking lending records
//

import SwiftUI

struct LentBooksView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    @State private var showingBookDetail: Book?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if libraryManager.lentBooks.isEmpty {
                    emptyStateView
                } else {
                    lentBooksListView
                }
            }
            .navigationTitle("Lent Books")
            .navigationBarTitleDisplayMode(.large)
        }
        .sheet(item: $showingBookDetail) { book in
            BookDetailView(book: book)
        }
    }
    
    private var emptyStateView: some View {
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
    
    private var lentBooksListView: some View {
        ScrollView {
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
}

struct LentBookCard: View {
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
                                .foregroundColor(book.category.color)
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
                            Image(systemName: book.category.icon)
                                .font(.caption)
                                .foregroundColor(book.category.color)
                            
                            Text(book.category.rawValue)
                                .font(.caption)
                                .foregroundColor(book.category.color)
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
    }
}

#Preview {
    LentBooksView()
        .environmentObject(LibraryManager())
}
