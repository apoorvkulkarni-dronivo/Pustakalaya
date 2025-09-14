//
//  MainTabView.swift
//  Library Managment
//
//  Author: Apoorv Kulkarni
//  Email: https://ak-apoorvkulkarni.github.io/
//  Description: Main tab navigation structure for the library management app
//

import SwiftUI

struct MainTabView: View {
    @StateObject private var libraryManager = LibraryManager()
    
    var body: some View {
        TabView {
            LibraryView()
                .tabItem {
                    Image(systemName: "books.vertical")
                    Text("Library")
                }
                .environmentObject(libraryManager)
            
            LentBooksView()
                .tabItem {
                    Image(systemName: "person.circle")
                    Text("Lent Out")
                }
                .environmentObject(libraryManager)
                .badge(libraryManager.lentBooks.count > 0 ? libraryManager.lentBooks.count : nil)
            
            StatisticsView()
                .tabItem {
                    Image(systemName: "chart.bar.fill")
                    Text("Statistics")
                }
                .environmentObject(libraryManager)
            
            SettingsView()
                .tabItem {
                    Image(systemName: "gear")
                    Text("Settings")
                }
                .environmentObject(libraryManager)
        }
        .accentColor(.blue)
    }
}

struct StatisticsView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Overview Stats
                    VStack(spacing: 16) {
                        Text("Library Overview")
                            .font(.title2)
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 16) {
                            StatisticCard(
                                title: "Total Books",
                                value: "\(libraryManager.books.count)",
                                icon: "book.fill",
                                color: .blue
                            )
                            
                            StatisticCard(
                                title: "Available",
                                value: "\(libraryManager.availableBooks.count)",
                                icon: "checkmark.circle.fill",
                                color: .green
                            )
                            
                            StatisticCard(
                                title: "Lent Out",
                                value: "\(libraryManager.lentBooks.count)",
                                icon: "person.circle.fill",
                                color: .orange
                            )
                            
                            StatisticCard(
                                title: "Categories",
                                value: "\(Set(libraryManager.books.map { $0.category }).count)",
                                icon: "tag.fill",
                                color: .purple
                            )
                        }
                    }
                    
                    // Category Breakdown
                    VStack(spacing: 16) {
                        Text("Books by Category")
                            .font(.title2)
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        ForEach(BookCategory.allCases, id: \.self) { category in
                            let categoryBooks = libraryManager.books.filter { $0.category == category }
                            if !categoryBooks.isEmpty {
                                CategoryStatRow(
                                    category: category,
                                    count: categoryBooks.count,
                                    total: libraryManager.books.count
                                )
                            }
                        }
                    }
                    
                    // Recent Activity
                    VStack(spacing: 16) {
                        Text("Recent Activity")
                            .font(.title2)
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        let recentBooks = libraryManager.books.sorted { $0.dateAdded > $1.dateAdded }.prefix(5)
                        
                        ForEach(Array(recentBooks), id: \.id) { book in
                            RecentActivityRow(book: book)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Statistics")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}

struct StatisticCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title)
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

struct CategoryStatRow: View {
    let category: BookCategory
    let count: Int
    let total: Int
    
    private var percentage: Double {
        total > 0 ? Double(count) / Double(total) : 0
    }
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: category.icon)
                .font(.title2)
                .foregroundColor(category.color)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(category.rawValue)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text("\(count) book\(count == 1 ? "" : "s")")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text("\(Int(percentage * 100))%")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                ProgressView(value: percentage)
                    .progressViewStyle(LinearProgressViewStyle(tint: category.color))
                    .frame(width: 60)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
}

struct RecentActivityRow: View {
    let book: Book
    
    var body: some View {
        HStack(spacing: 12) {
            Group {
                if let coverData = book.coverImage,
                   let coverImage = UIImage(data: coverData) {
                    Image(uiImage: coverImage)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } else {
                    Image(systemName: "book.closed")
                        .font(.title2)
                        .foregroundColor(book.category.color)
                }
            }
            .frame(width: 40, height: 50)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(6)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(book.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(1)
                
                Text("Added \(DateFormatter.relativeDate.string(from: book.dateAdded))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if book.isLent {
                Image(systemName: "person.circle.fill")
                    .foregroundColor(.orange)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
}

struct SettingsView: View {
    @EnvironmentObject var libraryManager: LibraryManager
    @State private var showingExportAlert = false
    @State private var showingImportAlert = false
    
    var body: some View {
        NavigationView {
            List {
                Section("Library Management") {
                    Button("Add Sample Data") {
                        libraryManager.addSampleData()
                    }
                    
                    Button("Clear All Books") {
                        // TODO: Implement clear all functionality
                    }
                    .foregroundColor(.red)
                }
                
                Section("Data") {
                    Button("Export Library") {
                        showingExportAlert = true
                    }
                    
                    Button("Import Library") {
                        showingImportAlert = true
                    }
                }
                
                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Total Books")
                        Spacer()
                        Text("\(libraryManager.books.count)")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
        }
        .alert("Export Library", isPresented: $showingExportAlert) {
            Button("OK") { }
        } message: {
            Text("Library export functionality will be implemented in a future update.")
        }
        .alert("Import Library", isPresented: $showingImportAlert) {
            Button("OK") { }
        } message: {
            Text("Library import functionality will be implemented in a future update.")
        }
    }
}

extension DateFormatter {
    static let relativeDate: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .none
        formatter.doesRelativeDateFormatting = true
        return formatter
    }()
}

#Preview {
    MainTabView()
}
