//  Author: Apoorv Kulkarni
//  Portfolio: https://ak-apoorvkulkarni.github.io/
//  Description: Quick add to wishlist view for capturing interesting books
//

import SwiftUI
import PhotosUI

struct QuickAddWishlistView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var title = ""
    @State private var author = ""
    @State private var notes = ""
    @State private var coverImage: UIImage?
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var showingCamera = false
    @State private var showingImageCrop = false
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationView {
            ScrollView(.vertical, showsIndicators: true) {
                VStack(spacing: 24) {
                    headerView
                    coverImageSection
                    formFieldsSection
                    Spacer(minLength: 100)
                }
                .padding()
            }
            .navigationTitle("Add to Wishlist")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    saveWishlistItem()
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
        .alert("Error", isPresented: $showingAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
    }
    
    private var headerView: some View {
        VStack(spacing: 8) {
            Image(systemName: "heart.fill")
                .font(.system(size: 40))
                .foregroundColor(.pink)
            
            Text("Quick Add to Wishlist")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Capture interesting books you want to read later")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
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
                Text("Notes (Optional)")
                    .font(.headline)
                    .foregroundColor(.primary)
                
                TextField("Add any notes about this book...", text: $notes, axis: .vertical)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .lineLimit(3...6)
            }
        }
    }
    
    private func saveWishlistItem() {
        let compressedImageData = coverImage?.jpegData(compressionQuality: 0.3)
        
        let wishlistItem = WishlistItem(
            title: title,
            author: author,
            coverImage: compressedImageData,
            notes: notes
        )
        
        libraryManager.addWishlistItem(wishlistItem)
        dismiss()
    }
}
