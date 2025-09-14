//
//  AddBookView.swift
//  Library Managment
//
//  Author: Apoorv Kulkarni
//  Email: https://ak-apoorvkulkarni.github.io/
//  Description: View for adding new books to the library with barcode scanning
//

import SwiftUI
import PhotosUI

struct AddBookView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var title = ""
    @State private var author = ""
    @State private var language = "English"
    @State private var selectedCategory: BookCategory = .other
    @State private var numberOfPages = ""
    @State private var isbn = ""
    @State private var coverImage: UIImage?
    @State private var selectedPhotoItem: PhotosPickerItem?
    
    @State private var showingScanner = false
    @State private var showingImagePicker = false
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    private let languages = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Other"]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "book.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.blue)
                        
                        Text("Add New Book")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Scan barcode or enter details manually")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top)
                    
                    // Cover Image Section
                    VStack(spacing: 16) {
                        Text("Book Cover")
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        if let coverImage = coverImage {
                            Image(uiImage: coverImage)
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(height: 200)
                                .cornerRadius(12)
                                .overlay(
                                    Button(action: { coverImage = nil }) {
                                        Image(systemName: "xmark.circle.fill")
                                            .foregroundColor(.red)
                                            .background(Color.white)
                                            .clipShape(Circle())
                                    }
                                    .padding(8),
                                    alignment: .topTrailing
                                )
                        } else {
                            PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                                VStack(spacing: 12) {
                                    Image(systemName: "camera.fill")
                                        .font(.system(size: 40))
                                        .foregroundColor(.blue)
                                    
                                    Text("Add Cover Photo")
                                        .font(.headline)
                                        .foregroundColor(.blue)
                                    
                                    Text("Tap to select from Photos")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                .frame(height: 200)
                                .frame(maxWidth: .infinity)
                                .background(Color.gray.opacity(0.1))
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.blue, style: StrokeStyle(lineWidth: 2, dash: [8]))
                                )
                            }
                        }
                    }
                    
                    // Barcode Scanner Section
                    VStack(spacing: 16) {
                        Text("ISBN Scanner")
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        Button(action: { showingScanner = true }) {
                            HStack {
                                Image(systemName: "barcode.viewfinder")
                                    .font(.title2)
                                Text("Scan ISBN Barcode")
                                    .font(.headline)
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(12)
                        }
                        
                        if !isbn.isEmpty {
                            HStack {
                                Text("Scanned ISBN:")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text(isbn)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                            }
                            .padding()
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(8)
                        }
                    }
                    
                    // Form Fields
                    VStack(spacing: 20) {
                        // Title
                        CustomTextField(title: "Book Title", text: $title, placeholder: "Enter book title")
                        
                        // Author
                        CustomTextField(title: "Author", text: $author, placeholder: "Enter author name")
                        
                        // Language
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Language")
                                .font(.headline)
                            
                            Picker("Language", selection: $language) {
                                ForEach(languages, id: \.self) { lang in
                                    Text(lang).tag(lang)
                                }
                            }
                            .pickerStyle(MenuPickerStyle())
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(12)
                        }
                        
                        // Category
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Category")
                                .font(.headline)
                            
                            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                                ForEach(BookCategory.allCases, id: \.self) { category in
                                    CategoryButton(
                                        category: category,
                                        isSelected: selectedCategory == category
                                    ) {
                                        selectedCategory = category
                                    }
                                }
                            }
                        }
                        
                        // Number of Pages
                        CustomTextField(
                            title: "Number of Pages",
                            text: $numberOfPages,
                            placeholder: "Enter number of pages",
                            keyboardType: .numberPad
                        )
                        
                        // ISBN (Manual Entry)
                        CustomTextField(
                            title: "ISBN (Optional)",
                            text: $isbn,
                            placeholder: "Enter ISBN manually"
                        )
                    }
                    
                    Spacer(minLength: 100)
                }
                .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveBook()
                    }
                    .fontWeight(.semibold)
                    .disabled(!isFormValid)
                }
            }
        }
        .sheet(isPresented: $showingScanner) {
            ISBNScannerView(isPresented: $showingScanner, scannedISBN: $isbn)
        }
        .onChange(of: selectedPhotoItem) { _, newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    coverImage = image
                }
            }
        }
        .alert("Error", isPresented: $showingAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
    }
    
    private var isFormValid: Bool {
        !title.isEmpty && !author.isEmpty && !numberOfPages.isEmpty
    }
    
    private func saveBook() {
        guard let pages = Int(numberOfPages) else {
            alertMessage = "Please enter a valid number of pages"
            showingAlert = true
            return
        }
        
        let book = Book(
            title: title,
            author: author,
            language: language,
            category: selectedCategory,
            numberOfPages: pages,
            isbn: isbn.isEmpty ? nil : isbn,
            coverImage: coverImage?.jpegData(compressionQuality: 0.8)
        )
        
        libraryManager.addBook(book)
        dismiss()
    }
}

struct CustomTextField: View {
    let title: String
    @Binding var text: String
    let placeholder: String
    var keyboardType: UIKeyboardType = .default
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)
            
            TextField(placeholder, text: $text)
                .textFieldStyle(PlainTextFieldStyle())
                .keyboardType(keyboardType)
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
        }
    }
}

struct CategoryButton: View {
    let category: BookCategory
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: category.icon)
                    .font(.caption)
                Text(category.rawValue)
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .foregroundColor(isSelected ? .white : category.color)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(isSelected ? category.color : category.color.opacity(0.1))
            .cornerRadius(20)
        }
    }
}

#Preview {
    AddBookView()
        .environmentObject(LibraryManager())
}
