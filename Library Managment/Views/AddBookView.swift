//
//  AddBookView.swift
//  Library Managment
//
//  Author: Apoorv Kulkarni
//  Portfolio: https://ak-apoorvkulkarni.github.io/
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
    @State private var selectedCategories: Set<BookCategory> = [.other]
    @State private var numberOfPages = ""
    @State private var isbn: String? = nil
    @State private var coverImage: UIImage?
    @State private var selectedPhotoItem: PhotosPickerItem?
    
    @State private var showingScanner = false
    @State private var showingImagePicker = false
    @State private var showingCamera = false
    @State private var showingImageCrop = false
    @State private var showingAlert = false
    @State private var alertMessage = ""
    @State private var isLoadingBookData = false
    @State private var fetchedBookDetails: BookDetails?
    
    private let languages = ["English", "Marathi", "Hindi", "German"]
    
    var body: some View {
        NavigationView {
            ScrollView(.vertical, showsIndicators: true) {
                VStack(spacing: 24) {
                    headerView
                    coverImageSection
                    barcodeScannerSection
                    formFieldsSection
                    Spacer(minLength: 100)
                }
                .padding()
            }
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
        .sheet(isPresented: $showingScanner) {
            ISBNScannerView(isPresented: $showingScanner, scannedISBN: $isbn)
        }
        .sheet(isPresented: $showingCamera) {
            CameraCaptureView(capturedImage: $coverImage)
        }
        .sheet(isPresented: $showingImageCrop) {
            ImageCropView(image: $coverImage)
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
        .onChange(of: isbn) { _, newISBN in
            if let newISBN = newISBN, !newISBN.isEmpty {
                fetchBookDetails(isbn: newISBN)
            }
        }
        .alert("Error", isPresented: $showingAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
    }
    
    private var headerView: some View {
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
    }
    
    private var coverImageSection: some View {
        VStack(spacing: 16) {
            Text("Book Cover")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            if let currentCoverImage = coverImage {
                Button(action: { showingImageCrop = true }) {
                    Image(uiImage: currentCoverImage)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(height: 200)
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.blue.opacity(0.3), lineWidth: 2)
                        )
                        .overlay(
                            VStack {
                                HStack {
                                    Spacer()
                                    Button(action: { coverImage = nil }) {
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
            } else {
                VStack(spacing: 12) {
                    Button(action: { showingCamera = true }) {
                        VStack(spacing: 8) {
                            Image(systemName: "camera.fill")
                                .font(.system(size: 30))
                                .foregroundColor(.white)
                            
                            Text("Take Photo")
                                .font(.headline)
                                .foregroundColor(.white)
                        }
                        .frame(height: 80)
                        .frame(maxWidth: .infinity)
                        .background(Color.blue)
                        .cornerRadius(12)
                    }
                    
                    PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                        VStack(spacing: 8) {
                            Image(systemName: "photo")
                                .font(.system(size: 30))
                                .foregroundColor(.blue)
                            
                            Text("Choose from Photos")
                                .font(.headline)
                                .foregroundColor(.blue)
                        }
                        .frame(height: 80)
                        .frame(maxWidth: .infinity)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(12)
                    }
                }
            }
        }
    }
    
    private var barcodeScannerSection: some View {
        VStack(spacing: 16) {
            Text("ISBN Scanner")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            Button(action: { showingScanner = true }) {
                HStack {
                    if isLoadingBookData {
                        ProgressView()
                            .scaleEffect(0.8)
                    } else {
                        Image(systemName: "barcode.viewfinder")
                            .font(.title2)
                    }
                    Text(isLoadingBookData ? "Fetching Book Data..." : "Scan ISBN Barcode")
                        .font(.headline)
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(isLoadingBookData ? Color.gray : Color.blue)
                .cornerRadius(12)
            }
            .disabled(isLoadingBookData)
            
            if let isbn = isbn, !isbn.isEmpty {
                VStack(spacing: 12) {
                    HStack {
                        Text("Scanned ISBN:")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(isbn)
                            .font(.subheadline)
                            .fontWeight(.medium)
                    }
                    
                    if let bookDetails = fetchedBookDetails {
                        VStack(spacing: 8) {
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                                Text("Book data found!")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundColor(.green)
                                Spacer()
                            }
                            
                            if let coverURL = bookDetails.coverImageURL {
                                AsyncImage(url: URL(string: coverURL)) { image in
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(height: 100)
                                        .cornerRadius(8)
                                } placeholder: {
                                    Rectangle()
                                        .fill(Color.gray.opacity(0.3))
                                        .frame(height: 100)
                                        .cornerRadius(8)
                                        .overlay(
                                            ProgressView()
                                        )
                                }
                            }
                            
                            if !bookDetails.suggestedCategories.isEmpty {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Suggested Categories:")
                                        .font(.caption)
                                        .fontWeight(.medium)
                                        .foregroundColor(.secondary)
                                    
                                    HStack {
                                        ForEach(bookDetails.suggestedCategories, id: \.self) { category in
                                            HStack(spacing: 4) {
                                                Image(systemName: category.icon)
                                                    .font(.caption2)
                                                Text(category.rawValue)
                                                    .font(.caption2)
                                            }
                                            .foregroundColor(category.color)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 4)
                                            .background(category.color.opacity(0.1))
                                            .cornerRadius(12)
                                        }
                                        Spacer()
                                    }
                                }
                            }
                        }
                        .padding()
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
                .padding()
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)
            }
        }
    }
    
    private var formFieldsSection: some View {
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
                text: Binding(
                    get: { isbn ?? "" },
                    set: { isbn = $0.isEmpty ? nil : $0 }
                ),
                placeholder: "Enter ISBN manually"
            )
        }
    }
    
    private var isFormValid: Bool {
        !title.isEmpty && !author.isEmpty && !numberOfPages.isEmpty
    }
    
    private func fetchBookDetails(isbn: String) {
        isLoadingBookData = true
        fetchedBookDetails = nil
        
        Task {
            do {
                let bookDetails = try await BookAPIService.shared.fetchBookDetails(isbn: isbn)
                await MainActor.run {
                    isLoadingBookData = false
                    if let details = bookDetails {
                        fetchedBookDetails = details
                        // Auto-fill form fields with fetched data
                        title = details.title
                        author = details.author
                        language = details.language
                        numberOfPages = String(details.numberOfPages)
                        
                        // Auto-select suggested categories
                        if !details.suggestedCategories.isEmpty {
                            selectedCategories = Set(details.suggestedCategories)
                        }
                        
                        // Download and set cover image if available
                        if let coverURL = details.coverImageURL {
                            downloadCoverImage(from: coverURL)
                        }
                    } else {
                        alertMessage = "No book data found for ISBN: \(isbn)"
                        showingAlert = true
                    }
                }
            } catch {
                await MainActor.run {
                    isLoadingBookData = false
                    alertMessage = "Failed to fetch book data: \(error.localizedDescription)"
                    showingAlert = true
                }
            }
        }
    }
    
    private func downloadCoverImage(from urlString: String) {
        guard let url = URL(string: urlString) else { return }
        
        Task {
            do {
                let (data, _) = try await URLSession.shared.data(from: url)
                if let image = UIImage(data: data) {
                    await MainActor.run {
                        // Compress the downloaded image to save storage
                        if let compressedData = image.jpegData(compressionQuality: 0.3),
                           let compressedImage = UIImage(data: compressedData) {
                            coverImage = compressedImage
                        } else {
                            coverImage = image
                        }
                    }
                }
            } catch {
                print("Failed to download cover image: \(error)")
            }
        }
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
            categories: Array(selectedCategories),
            numberOfPages: pages,
            isbn: isbn,
            coverImage: coverImage?.jpegData(compressionQuality: 0.3)
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
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.caption2)
                        .foregroundColor(.white)
                }
            }
            .foregroundColor(isSelected ? .white : category.color)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(isSelected ? category.color : category.color.opacity(0.1))
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(category.color, lineWidth: isSelected ? 0 : 1)
            )
            .cornerRadius(20)
        }
        .scaleEffect(isSelected ? 1.05 : 1.0)
        .animation(.easeInOut(duration: 0.1), value: isSelected)
    }
}

#Preview {
    AddBookView()
        .environmentObject(LibraryManager())
}
