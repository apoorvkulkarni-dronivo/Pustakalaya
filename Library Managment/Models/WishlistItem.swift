//  Author: Apoorv Kulkarni
//  Portfolio: https://ak-apoorvkulkarni.github.io/
//  Description: Wishlist item model for books user wants to read
//

import Foundation
import SwiftUI

struct WishlistItem: Identifiable, Codable {
    let id: UUID
    var title: String
    var author: String
    var coverImage: Data?
    var notes: String
    var dateAdded: Date
    var isbn: String?
    
    init(title: String, author: String, coverImage: Data? = nil, notes: String = "", isbn: String? = nil) {
        self.id = UUID()
        self.title = title
        self.author = author
        self.coverImage = coverImage
        self.notes = notes
        self.dateAdded = Date()
        self.isbn = isbn
    }
    
    var coverUIImage: UIImage? {
        guard let coverImage = coverImage else { return nil }
        return UIImage(data: coverImage)
    }
}
