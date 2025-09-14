//  Author: Apoorv Kulkarni
//  Portfolio: https://ak-apoorvkulkarni.github.io/
//  Description: Settings view with developer information and app preferences
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    @State private var showingAbout = false
    @State private var showingClearDataAlert = false
    @State private var showingFinalConfirmation = false
    
    var body: some View {
        NavigationView {
            ScrollView(.vertical, showsIndicators: true) {
                VStack(spacing: 24) {
                    headerView
                    developerInfoSection
                    appInfoSection
                    statisticsSection
                    clearDataSection
                    Spacer(minLength: 50)
                }
                .padding()
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
        }
        .alert("Clear All Data", isPresented: $showingClearDataAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Continue", role: .destructive) {
                showingFinalConfirmation = true
            }
        } message: {
            Text("This will permanently delete all your books, wishlist items, and lending records. This action cannot be undone.")
        }
        .alert("Final Confirmation", isPresented: $showingFinalConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Delete All Data", role: .destructive) {
                clearAllData()
            }
        } message: {
            Text("Are you absolutely sure you want to delete ALL data? This includes:\n\n• All books in your library\n• All wishlist items\n• All lending records and history\n\nThis action cannot be undone!")
        }
    }
    
    private var headerView: some View {
        VStack(spacing: 16) {
            Image(systemName: "books.vertical.fill")
                .font(.system(size: 60))
                .foregroundColor(.blue)
            
            Text("My Library")
                .font(.title)
                .fontWeight(.bold)
            
            Text("Your Personal Book Management App")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.vertical)
    }
    
    private func clearAllData() {
        libraryManager.clearAllData()
    }
    
    private var clearDataSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Data Management")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                Button(action: {
                    showingClearDataAlert = true
                }) {
                    HStack(spacing: 12) {
                        Image(systemName: "trash.fill")
                            .font(.title2)
                            .foregroundColor(.red)
                            .frame(width: 24)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Clear All Data")
                                .font(.title3)
                                .fontWeight(.semibold)
                                .foregroundColor(.red)
                            
                            Text("Delete all books, wishlist, and lending records")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }
                .buttonStyle(PlainButtonStyle())
            }
        }
    }
    
    private var developerInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Developer Information")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                DeveloperInfoRow(
                    icon: "person.fill",
                    title: "Developer",
                    value: "Apoorv Kulkarni",
                    iconColor: .blue
                )
                
                DeveloperInfoRow(
                    icon: "globe",
                    title: "Portfolio",
                    value: "ak-apoorvkulkarni.github.io",
                    iconColor: .green,
                    isLink: true,
                    url: "https://ak-apoorvkulkarni.github.io/"
                )
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }
    
    private var appInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("App Information")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                InfoRow(
                    icon: "app.fill",
                    title: "App Name",
                    value: "My Library"
                )
                
                InfoRow(
                    icon: "number",
                    title: "Version",
                    value: "1.0.0"
                )
                
                InfoRow(
                    icon: "calendar",
                    title: "Release Date",
                    value: "September 2025"
                )
                
                InfoRow(
                    icon: "iphone",
                    title: "Platform",
                    value: "iOS 18.5+"
                )
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }
    
    private var statisticsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Your Library Statistics")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                StatisticRow(
                    icon: "book.fill",
                    title: "Total Books",
                    value: "\(libraryManager.books.count)",
                    iconColor: .blue
                )
                
                StatisticRow(
                    icon: "heart.fill",
                    title: "Wishlist Items",
                    value: "\(libraryManager.wishlistItems.count)",
                    iconColor: .pink
                )
                
                StatisticRow(
                    icon: "person.2.fill",
                    title: "Lent Books",
                    value: "\(libraryManager.lentBooks.count)",
                    iconColor: .orange
                )
                
                StatisticRow(
                    icon: "tag.fill",
                    title: "Categories",
                    value: "\(Set(libraryManager.books.flatMap { $0.categories }).count)",
                    iconColor: .purple
                )
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }
}

struct DeveloperInfoRow: View {
    let icon: String
    let title: String
    let value: String
    let iconColor: Color
    var isLink: Bool = false
    var url: String = ""
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(iconColor)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                if isLink {
                    Button(action: {
                        if let url = URL(string: url) {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        Text(value)
                            .font(.body)
                            .foregroundColor(iconColor)
                            .underline()
                    }
                } else {
                    Text(value)
                        .font(.body)
                        .foregroundColor(.primary)
                }
            }
            
            Spacer()
        }
    }
}

struct InfoRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.blue)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(value)
                    .font(.body)
                    .foregroundColor(.primary)
            }
            
            Spacer()
        }
    }
}

struct StatisticRow: View {
    let icon: String
    let title: String
    let value: String
    let iconColor: Color
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(iconColor)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(value)
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
            }
            
            Spacer()
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(LibraryManager())
}
