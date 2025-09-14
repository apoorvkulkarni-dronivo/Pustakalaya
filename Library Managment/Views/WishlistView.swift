//  Author: Apoorv Kulkarni
//  Portfolio: https://ak-apoorvkulkarni.github.io/
//  Description: Wishlist view to display and manage books user wants to read
//

import SwiftUI
import PhotosUI

struct WishlistView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    @State private var showingQuickAdd = false
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationView {
            ScrollView(.vertical, showsIndicators: true) {
                VStack(spacing: 20) {
                    if libraryManager.wishlistItems.isEmpty {
                        emptyStateView
                    } else {
                        wishlistItemsView
                    }
                }
                .padding()
            }
            .navigationTitle("Wishlist")
            .navigationBarTitleDisplayMode(.large)
            .navigationBarBackButtonHidden(true)
            .navigationBarItems(
                trailing: Button(action: { showingQuickAdd = true }) {
                    Image(systemName: "plus")
                        .font(.title2)
                }
            )
        }
        .sheet(isPresented: $showingQuickAdd) {
            QuickAddWishlistView()
        }
        .alert("Success", isPresented: $showingAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "heart")
                .font(.system(size: 80))
                .foregroundColor(.pink.opacity(0.6))
            
            Text("Your Wishlist is Empty")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Add books you want to read later by tapping the + button")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button(action: { showingQuickAdd = true }) {
                HStack {
                    Image(systemName: "plus")
                    Text("Add to Wishlist")
                }
                .font(.headline)
                .foregroundColor(.white)
                .padding()
                .background(Color.pink)
                .cornerRadius(12)
            }
        }
        .padding(.top, 100)
    }
    
    private var wishlistItemsView: some View {
        LazyVStack(spacing: 16) {
            ForEach(libraryManager.wishlistItems) { item in
                WishlistItemCard(item: item)
            }
        }
    }
}

struct WishlistItemCard: View {
    let item: WishlistItem
    @EnvironmentObject var libraryManager: LibraryManager
    @State private var showingDetail = false
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 16) {
                // Cover Image
                if let coverImage = item.coverUIImage {
                    Image(uiImage: coverImage)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 80, height: 120)
                        .clipped()
                        .cornerRadius(8)
                        .shadow(radius: 4)
                } else {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 80, height: 120)
                        .overlay(
                            Image(systemName: "book.closed")
                                .font(.title)
                                .foregroundColor(.gray)
                        )
                }
                
                // Book Info
                VStack(alignment: .leading, spacing: 8) {
                    Text(item.title)
                        .font(.headline)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                    
                    Text("by \(item.author)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                    
                    if !item.notes.isEmpty {
                        Text(item.notes)
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                    }
                    
                    Text("Added \(item.dateAdded, style: .date)")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                }
                
                Spacer()
                
                // Action Menu
                Menu {
                    Button(action: { moveToLibrary() }) {
                        Label("Move to Library", systemImage: "books.vertical")
                    }
                    
                    Button(action: { showingDetail = true }) {
                        Label("Edit", systemImage: "pencil")
                    }
                    
                    Button(role: .destructive, action: { removeFromWishlist() }) {
                        Label("Remove", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .font(.title2)
                        .foregroundColor(.secondary)
                        .padding(8)
                }
            }
            .padding()
        }
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
        .sheet(isPresented: $showingDetail) {
            EditWishlistItemView(item: item)
        }
        .alert("Success", isPresented: $showingAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
    }
    
    private func moveToLibrary() {
        let book = libraryManager.moveWishlistToLibrary(item)
        alertMessage = "\(book.title) has been moved to your library!"
        showingAlert = true
    }
    
    private func removeFromWishlist() {
        libraryManager.removeWishlistItem(item)
        alertMessage = "\(item.title) has been removed from wishlist"
        showingAlert = true
    }
}

struct EditWishlistItemView: View {
    let item: WishlistItem
    @EnvironmentObject var libraryManager: LibraryManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var title: String
    @State private var author: String
    @State private var notes: String
    @State private var coverImage: UIImage?
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var showingCamera = false
    @State private var showingImageCrop = false
    
    init(item: WishlistItem) {
        self.item = item
        self._title = State(initialValue: item.title)
        self._author = State(initialValue: item.author)
        self._notes = State(initialValue: item.notes)
        self._coverImage = State(initialValue: item.coverUIImage)
    }
    
    var body: some View {
        NavigationView {
            ScrollView(.vertical, showsIndicators: true) {
                VStack(spacing: 24) {
                    coverImageSection
                    formFieldsSection
                    Spacer(minLength: 100)
                }
                .padding()
            }
            .navigationTitle("Edit Wishlist Item")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    saveChanges()
                }
                .disabled(title.isEmpty || author.isEmpty)
            )
        }
        .sheet(isPresented: $showingCamera) {
            CameraPickerView(selectedImage: $coverImage)
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
                        .shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
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
                                .foregroundColor(.blue)
                            Text("Take Photo")
                                .font(.headline)
                                .foregroundColor(.blue)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(12)
                    }
                    
                    PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                        VStack(spacing: 8) {
                            Image(systemName: "photo.fill")
                                .font(.system(size: 30))
                                .foregroundColor(.green)
                            Text("Choose from Photos")
                                .font(.headline)
                                .foregroundColor(.green)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(12)
                    }
                }
            }
        }
    }
    
    private var formFieldsSection: some View {
        VStack(spacing: 20) {
            CustomTextField(title: "Book Title", text: $title, placeholder: "Enter book title")
            
            CustomTextField(title: "Author", text: $author, placeholder: "Enter author name")
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Notes")
                    .font(.headline)
                    .foregroundColor(.primary)
                
                TextField("Add any notes about this book...", text: $notes, axis: .vertical)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .lineLimit(3...6)
            }
        }
    }
    
    private func saveChanges() {
        let compressedImageData = coverImage?.jpegData(compressionQuality: 0.3)
        
        let updatedItem = WishlistItem(
            title: title,
            author: author,
            coverImage: compressedImageData,
            notes: notes,
            isbn: item.isbn
        )
        
        // Update the item with the same ID
        var updatedItemWithID = updatedItem
        updatedItemWithID = WishlistItem(
            title: title,
            author: author,
            coverImage: compressedImageData,
            notes: notes,
            isbn: item.isbn
        )
        
        libraryManager.updateWishlistItem(updatedItemWithID)
        dismiss()
    }
}

#Preview {
    WishlistView()
        .environmentObject(LibraryManager())
}
