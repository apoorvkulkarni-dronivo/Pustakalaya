//
//  LibraryView.swift
//  Library Managment
//
//  Author: Apoorv Kulkarni
//  Email: https://ak-apoorvkulkarni.github.io/
//  Description: Main library view displaying all books with search and filter functionality
//

import SwiftUI

struct LibraryView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    @State private var showingAddBook = false
    @State private var showingBookDetail: Book?
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header Stats
                headerStatsView
                
                // Search and Filter
                searchAndFilterView
                
                // Books List
                booksListView
            }
            .navigationTitle("My Library")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddBook = true }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                }
            }
        }
        .sheet(isPresented: $showingAddBook) {
            AddBookView()
        }
        .sheet(item: $showingBookDetail) { book in
            BookDetailView(book: book)
        }
        .onAppear {
            if libraryManager.books.isEmpty {
                libraryManager.addSampleData()
            }
        }
    }
    
    private var headerStatsView: some View {
        HStack(spacing: 20) {
            StatCard(
                title: "Total Books",
                value: "\(libraryManager.books.count)",
                icon: "book.fill",
                color: .blue
            )
            
            StatCard(
                title: "Available",
                value: "\(libraryManager.availableBooks.count)",
                icon: "checkmark.circle.fill",
                color: .green
            )
            
            StatCard(
                title: "Lent Out",
                value: "\(libraryManager.lentBooks.count)",
                icon: "person.circle.fill",
                color: .orange
            )
        }
        .padding(.horizontal)
        .padding(.top, 8)
    }
    
    private var searchAndFilterView: some View {
        VStack(spacing: 12) {
            // Search Bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                
                TextField("Search books...", text: $searchText)
                    .textFieldStyle(PlainTextFieldStyle())
                    .onChange(of: searchText) { newValue in
                        libraryManager.searchBooks(query: newValue)
                    }
                
                if !searchText.isEmpty {
                    Button(action: { searchText = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
            
            // Category Filter
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    FilterChip(
                        title: "All",
                        isSelected: libraryManager.selectedCategory == nil
                    ) {
                        libraryManager.filterByCategory(nil)
                    }
                    
                    ForEach(BookCategory.allCases, id: \.self) { category in
                        FilterChip(
                            title: category.rawValue,
                            isSelected: libraryManager.selectedCategory == category,
                            color: category.color
                        ) {
                            libraryManager.filterByCategory(category)
                        }
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding(.horizontal)
    }
    
    private var booksListView: some View {
        Group {
            if libraryManager.filteredBooks.isEmpty {
                emptyStateView
            } else {
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(libraryManager.filteredBooks) { book in
                            BookCard(book: book) {
                                showingBookDetail = book
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 100)
                }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Spacer()
            
            Image(systemName: "books.vertical")
                .font(.system(size: 80))
                .foregroundColor(.gray)
            
            Text("No Books Found")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text(searchText.isEmpty ? "Add your first book to get started" : "Try adjusting your search or filters")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            if searchText.isEmpty {
                Button(action: { showingAddBook = true }) {
                    Text("Add Book")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(12)
                }
            }
            
            Spacer()
        }
        .padding()
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let color: Color
    let action: () -> Void
    
    init(title: String, isSelected: Bool, color: Color = .blue, action: @escaping () -> Void) {
        self.title = title
        self.isSelected = isSelected
        self.color = color
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(isSelected ? .white : color)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? color : color.opacity(0.1))
                .cornerRadius(20)
        }
    }
}

struct BookCard: View {
    let book: Book
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
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
                            .font(.system(size: 40))
                            .foregroundColor(book.category.color)
                    }
                }
                .frame(width: 60, height: 80)
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
                        
                        Spacer()
                        
                        if book.isLent {
                            HStack(spacing: 4) {
                                Image(systemName: "person.circle.fill")
                                    .font(.caption)
                                    .foregroundColor(.orange)
                                
                                Text("Lent")
                                    .font(.caption)
                                    .foregroundColor(.orange)
                            }
                        }
                    }
                    
                    HStack {
                        Text("\(book.numberOfPages) pages")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Spacer()
                        
                        Text(book.language)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
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
    LibraryView()
        .environmentObject(LibraryManager())
}
