//  Author: Apoorv Kulkarni
//  Portfolio: https://ak-apoorvkulkarni.github.io/
//  Description: View for editing existing book details
//

import SwiftUI
import PhotosUI

struct EditBookView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    @Environment(\.dismiss) private var dismiss
    
    let book: Book
    
    @State private var title: String
    @State private var author: String
    @State private var language: String
    @State private var numberOfPages: String
    @State private var isbn: String?
    @State private var selectedCategories: Set<BookCategory>
    @State private var coverImage: UIImage?
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var showingImagePicker = false
    @State private var showingCamera = false
    @State private var showingImageCrop = false
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    init(book: Book) {
        self.book = book
        self._title = State(initialValue: book.title)
        self._author = State(initialValue: book.author)
        self._language = State(initialValue: book.language)
        self._numberOfPages = State(initialValue: String(book.numberOfPages))
        self._isbn = State(initialValue: book.isbn)
        self._selectedCategories = State(initialValue: Set(book.categories))
        self._coverImage = State(initialValue: book.coverImage.flatMap { UIImage(data: $0) })
    }
    
    var body: some View {
        NavigationView {
            ScrollView(.vertical, showsIndicators: true) {
                VStack(spacing: 24) {
                    // Header
                    headerView
                    
                    // Cover Image Section
                    coverImageSection
                    
                    // Form Fields
                    formFieldsSection
                    
                    Spacer(minLength: 100)
                }
                .padding()
            }
            .navigationTitle("Edit Book")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    saveBook()
                }
                .fontWeight(.semibold)
                .disabled(!isFormValid)
            )
        }
        .onChange(of: selectedPhotoItem) { _, newItem in
            guard let newItem = newItem else { return }
            
            newItem.loadTransferable(type: Data.self) { result in
                switch result {
                case .success(let data):
                    if let data = data, let image = UIImage(data: data) {
                        DispatchQueue.main.async {
                            coverImage = image
                        }
                    }
                case .failure(let error):
                    print("Failed to load image: \(error)")
                }
            }
        }
        .sheet(isPresented: $showingCamera) {
            CameraCaptureView(capturedImage: $coverImage)
        }
        .sheet(isPresented: $showingImageCrop) {
            ImageCropView(image: $coverImage)
        }
        .alert("Error", isPresented: $showingAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
    }
    
    private var headerView: some View {
        VStack(spacing: 8) {
            Text("Edit Book Details")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Update the information for this book")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
    
    private var coverImageSection: some View {
        VStack(spacing: 16) {
            Text("Book Cover")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            if let coverImage = coverImage {
                VStack(spacing: 12) {
                    Button(action: { showingImageCrop = true }) {
                        Image(uiImage: coverImage)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(height: 200)
                            .cornerRadius(12)
                            .shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.blue.opacity(0.3), lineWidth: 2)
                            )
                            .overlay(
                                VStack {
                                    HStack {
                                        Spacer()
                                        Button(action: { self.coverImage = nil }) {
                                            Image(systemName: "xmark.circle.fill")
                                                .foregroundColor(.red)
                                                .background(Color.white)
                                                .clipShape(Circle())
                                        }
                                    }
                                    Spacer()
                                    HStack {
                                        Image(systemName: "crop")
                                        Text("Tap to edit")
                                    }
                                    .font(.caption)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.black.opacity(0.7))
                                    .cornerRadius(8)
                                }
                                .padding(8)
                            )
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    VStack(spacing: 8) {
                        HStack(spacing: 12) {
                            Button(action: { showingCamera = true }) {
                                HStack {
                                    Image(systemName: "camera")
                                    Text("Take Photo")
                                }
                                .font(.subheadline)
                                .foregroundColor(.white)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color.blue)
                                .cornerRadius(8)
                            }
                            
                            PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                                HStack {
                                    Image(systemName: "photo")
                                    Text("Change Photo")
                                }
                                .font(.subheadline)
                                .foregroundColor(.blue)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(8)
                            }
                        }
                        
                        Button(action: { 
                            self.coverImage = nil 
                        }) {
                            HStack {
                                Image(systemName: "trash")
                                Text("Remove")
                            }
                            .font(.subheadline)
                            .foregroundColor(.red)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(8)
                        }
                    }
                }
            } else {
                VStack(spacing: 16) {
                    Image(systemName: "book.closed")
                        .font(.system(size: 60))
                        .foregroundColor(.gray)
                    
                    Text("No Cover Image")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    VStack(spacing: 12) {
                        Button(action: { showingCamera = true }) {
                            HStack {
                                Image(systemName: "camera")
                                Text("Take Photo")
                            }
                            .font(.subheadline)
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(Color.blue)
                            .cornerRadius(8)
                        }
                        
                        PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                            HStack {
                                Image(systemName: "photo")
                                Text("Choose from Photos")
                            }
                            .font(.subheadline)
                            .foregroundColor(.blue)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(8)
                        }
                    }
                }
                .frame(height: 200)
                .frame(maxWidth: .infinity)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
            }
        }
    }
    
    private var formFieldsSection: some View {
        VStack(spacing: 20) {
            // Title
            VStack(alignment: .leading, spacing: 8) {
                Text("Title")
                    .font(.headline)
                CustomTextField(title: "Title", text: $title, placeholder: "Enter book title")
            }
            
            // Author
            VStack(alignment: .leading, spacing: 8) {
                Text("Author")
                    .font(.headline)
                CustomTextField(title: "Author", text: $author, placeholder: "Enter author name")
            }
            
            // Language
            VStack(alignment: .leading, spacing: 8) {
                Text("Language")
                    .font(.headline)
                CustomTextField(title: "Language", text: $language, placeholder: "Enter language")
            }
            
            // Number of Pages
            VStack(alignment: .leading, spacing: 8) {
                Text("Number of Pages")
                    .font(.headline)
                CustomTextField(title: "Pages", text: $numberOfPages, placeholder: "Enter number of pages")
                    .keyboardType(.numberPad)
            }
            
            // ISBN
            VStack(alignment: .leading, spacing: 8) {
                Text("ISBN (Optional)")
                    .font(.headline)
                CustomTextField(
                    title: "ISBN",
                    text: Binding(
                        get: { isbn ?? "" },
                        set: { isbn = $0.isEmpty ? nil : $0 }
                    ),
                    placeholder: "Enter ISBN"
                )
            }
            
            // Categories
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Categories")
                        .font(.headline)
                    Spacer()
                    if selectedCategories.count > 1 {
                        Text("\(selectedCategories.count) selected")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                    ForEach(BookCategory.allCases, id: \.self) { category in
                        CategoryButton(
                            category: category,
                            isSelected: selectedCategories.contains(category)
                        ) {
                            if selectedCategories.contains(category) {
                                selectedCategories.remove(category)
                                // Ensure at least one category is always selected
                                if selectedCategories.isEmpty {
                                    selectedCategories.insert(.other)
                                }
                            } else {
                                selectedCategories.insert(category)
                            }
                        }
                    }
                }
            }
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
        
        var updatedBook = book
        updatedBook.title = title
        updatedBook.author = author
        updatedBook.language = language
        updatedBook.numberOfPages = pages
        updatedBook.isbn = isbn
        updatedBook.categories = Array(selectedCategories)
        updatedBook.coverImage = coverImage?.jpegData(compressionQuality: 0.3)
        
        libraryManager.updateBook(updatedBook)
        dismiss()
    }
}


#Preview {
    EditBookView(book: Book(title: "Sample Book", author: "Sample Author", language: "English", categories: [.fiction], numberOfPages: 300))
        .environmentObject(LibraryManager())
}
