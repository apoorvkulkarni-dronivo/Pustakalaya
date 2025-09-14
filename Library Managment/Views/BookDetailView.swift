//
//  BookDetailView.swift
//  Library Managment
//
//  Author: Apoorv Kulkarni
//  Portfolio: https://ak-apoorvkulkarni.github.io/
//  Description: Detailed view for individual books with lending functionality
//

import SwiftUI

struct BookDetailView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    @Environment(\.dismiss) private var dismiss
    
    let book: Book
    @State private var showingLendForm = false
    @State private var showingReturnConfirmation = false
    @State private var showingDeleteConfirmation = false
    @State private var showingEditForm = false
    
    var body: some View {
        NavigationView {
            ScrollView(.vertical, showsIndicators: true) {
                VStack(spacing: 24) {
                    // Cover Image
                    coverImageView
                    
                    // Book Information
                    bookInfoView
                    
                    // Lending Information
                    if book.isLent, let lendingRecord = book.lendingRecord {
                        lendingInfoView(lendingRecord)
                    }
                    
                    // Action Buttons
                    actionButtonsView
                    
                    Spacer(minLength: 100)
                }
                .padding()
            }
            .navigationTitle("Book Details")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .navigationBarItems(
                leading: Button("Close") {
                    dismiss()
                },
                trailing: Menu {
                    Button("Edit Book", action: { showingEditForm = true })
                    Button("Delete Book", role: .destructive, action: { showingDeleteConfirmation = true })
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            )
        }
        .sheet(isPresented: $showingLendForm) {
            LendBookView(book: book)
        }
        .sheet(isPresented: $showingEditForm) {
            EditBookView(book: book)
        }
        .alert("Return Book", isPresented: $showingReturnConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Return", role: .destructive) {
                libraryManager.returnBook(book)
            }
        } message: {
            Text("Are you sure you want to mark this book as returned?")
        }
        .alert("Delete Book", isPresented: $showingDeleteConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                libraryManager.deleteBook(book)
                dismiss()
            }
        } message: {
            Text("Are you sure you want to delete this book from your library? This action cannot be undone.")
        }
    }
    
    private var coverImageView: some View {
        Group {
            if let coverData = book.coverImage,
               let coverImage = UIImage(data: coverData) {
                Image(uiImage: coverImage)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(maxHeight: 300)
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
            } else {
                VStack(spacing: 16) {
                    Image(systemName: "book.closed")
                        .font(.system(size: 80))
                        .foregroundColor(book.primaryCategory.color)
                    
                    Text("No Cover Image")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .frame(height: 200)
                .frame(maxWidth: .infinity)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
            }
        }
    }
    
    private var bookInfoView: some View {
        VStack(spacing: 16) {
            // Title and Author
            VStack(spacing: 8) {
                Text(book.title)
                    .font(.title2)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                
                Text("by \(book.author)")
                    .font(.title3)
                    .foregroundColor(.secondary)
            }
            
            // Categories
            VStack(alignment: .leading, spacing: 8) {
                Text("Categories")
                    .font(.headline)
                    .foregroundColor(.primary)
                
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 8) {
                    ForEach(book.categories, id: \.self) { category in
                        HStack(spacing: 6) {
                            Image(systemName: category.icon)
                                .font(.caption)
                                .foregroundColor(category.color)
                            
                            Text(category.rawValue)
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(category.color)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(category.color.opacity(0.1))
                        .cornerRadius(16)
                    }
                }
            }
            
            // Book Details Grid
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 16) {
                DetailItem(title: "Pages", value: "\(book.numberOfPages)", icon: "doc.text")
                DetailItem(title: "Language", value: book.language, icon: "globe")
                DetailItem(title: "Added", value: DateFormatter.shortDate.string(from: book.dateAdded), icon: "calendar")
                if let isbn = book.isbn {
                    DetailItem(title: "ISBN", value: isbn, icon: "barcode")
                }
            }
        }
    }
    
    private func lendingInfoView(_ lendingRecord: LendingRecord) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "person.circle.fill")
                    .foregroundColor(.orange)
                
                Text("Currently Lent To")
                    .font(.headline)
                    .foregroundColor(.orange)
            }
            
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Borrower:")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text(lendingRecord.borrowerName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                if let contact = lendingRecord.borrowerContact {
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
                        Text(DateFormatter.shortDate.string(from: expectedReturn))
                            .font(.subheadline)
                            .fontWeight(.medium)
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
            .background(Color.orange.opacity(0.1))
            .cornerRadius(12)
        }
    }
    
    private var actionButtonsView: some View {
        VStack(spacing: 12) {
            if book.isLent {
                Button(action: { showingReturnConfirmation = true }) {
                    HStack {
                        Image(systemName: "arrow.uturn.left.circle.fill")
                        Text("Mark as Returned")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .cornerRadius(12)
                }
            } else {
                Button(action: { showingLendForm = true }) {
                    HStack {
                        Image(systemName: "person.circle.fill")
                        Text("Lend to Someone")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(12)
                }
            }
        }
    }
}

struct DetailItem: View {
    let title: String
    let value: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.blue)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

struct LendBookView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    @Environment(\.dismiss) private var dismiss
    
    let book: Book
    
    @State private var borrowerName = ""
    @State private var borrowerContact = ""
    @State private var expectedReturnDate: Date? = nil
    @State private var notes = ""
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section("Borrower Information") {
                    TextField("Borrower Name", text: $borrowerName)
                    TextField("Contact (Optional)", text: $borrowerContact)
                        .keyboardType(.phonePad)
                }
                
                Section("Notes") {
                    TextField("Additional notes (Optional)", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("Lend Book")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Lend") {
                    lendBook()
                }
                .fontWeight(.semibold)
                .disabled(borrowerName.isEmpty)
            )
        }
        .alert("Error", isPresented: $showingAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
    }
    
    private func lendBook() {
        libraryManager.lendBook(
            book,
            to: borrowerName,
            contact: borrowerContact.isEmpty ? nil : borrowerContact,
            expectedReturn: nil,
            notes: notes.isEmpty ? nil : notes
        )
        dismiss()
    }
}

extension DateFormatter {
    static let shortDate: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter
    }()
}

#Preview {
    BookDetailView(book: Book(title: "Sample Book", author: "Sample Author", language: "English", categories: [.fiction], numberOfPages: 300))
        .environmentObject(LibraryManager())
}
