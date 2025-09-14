//
//  DesignSystem.swift
//  Library Managment
//
//  Author: Apoorv Kulkarni
//  Portfolio: https://ak-apoorvkulkarni.github.io/
//  Description: Design system with custom fonts, colors, and styling for modern UI
//

import SwiftUI

// MARK: - Custom Fonts
extension Font {
    static let appTitle = Font.system(size: 28, weight: .bold, design: .rounded)
    static let appHeadline = Font.system(size: 20, weight: .semibold, design: .rounded)
    static let appSubheadline = Font.system(size: 16, weight: .medium, design: .rounded)
    static let appBody = Font.system(size: 16, weight: .regular, design: .default)
    static let appCaption = Font.system(size: 14, weight: .medium, design: .default)
    static let appSmall = Font.system(size: 12, weight: .regular, design: .default)
}

// MARK: - Custom Colors
extension Color {
    static let appPrimary = Color(red: 0.0, green: 0.48, blue: 1.0) // iOS Blue
    static let appSecondary = Color(red: 0.55, green: 0.55, blue: 0.57) // iOS Gray
    static let appBackground = Color(red: 0.95, green: 0.95, blue: 0.97) // iOS Background
    static let appCardBackground = Color.white
    static let appSuccess = Color(red: 0.20, green: 0.78, blue: 0.35) // iOS Green
    static let appWarning = Color(red: 1.0, green: 0.58, blue: 0.0) // iOS Orange
    static let appError = Color(red: 1.0, green: 0.23, blue: 0.19) // iOS Red
    
    // Gradient colors
    static let appGradientStart = Color(red: 0.0, green: 0.48, blue: 1.0)
    static let appGradientEnd = Color(red: 0.0, green: 0.28, blue: 0.8)
}

// MARK: - Custom Gradients
extension LinearGradient {
    static let appPrimary = LinearGradient(
        colors: [.appGradientStart, .appGradientEnd],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let appCard = LinearGradient(
        colors: [.appCardBackground, Color.appCardBackground.opacity(0.8)],
        startPoint: .top,
        endPoint: .bottom
    )
}

// MARK: - Custom Shadows
extension View {
    func appCardShadow() -> some View {
        self.shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }
    
    func appButtonShadow() -> some View {
        self.shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
    }
    
    func appFloatingShadow() -> some View {
        self.shadow(color: .black.opacity(0.15), radius: 12, x: 0, y: 6)
    }
}

// MARK: - Custom Button Styles
struct AppPrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.appSubheadline)
            .foregroundColor(.white)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.appPrimary)
                    .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            )
            .appButtonShadow()
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct AppSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.appSubheadline)
            .foregroundColor(Color.appPrimary)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.appPrimary, lineWidth: 2)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.appPrimary.opacity(configuration.isPressed ? 0.1 : 0.0))
                    )
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct AppFloatingButtonStyle: ButtonStyle {
    let color: Color
    
    init(color: Color = Color.appPrimary) {
        self.color = color
    }
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.title2)
            .foregroundColor(.white)
            .frame(width: 56, height: 56)
            .background(
                Circle()
                    .fill(color)
                    .scaleEffect(configuration.isPressed ? 0.9 : 1.0)
            )
            .appFloatingShadow()
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Custom Card Styles
struct AppCard<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        content
            .padding()
            .background(Color.appCardBackground)
            .cornerRadius(16)
            .appCardShadow()
    }
}

// MARK: - Custom Text Field Styles
struct AppTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .font(.appBody)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.appBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.appSecondary.opacity(0.3), lineWidth: 1)
                    )
            )
    }
}

// MARK: - Custom Progress View Styles
struct AppProgressViewStyle: ProgressViewStyle {
    let color: Color
    
    init(color: Color = Color.appPrimary) {
        self.color = color
    }
    
    func makeBody(configuration: Configuration) -> some View {
        ProgressView(value: configuration.fractionCompleted)
            .progressViewStyle(LinearProgressViewStyle(tint: color))
            .scaleEffect(x: 1, y: 2, anchor: .center)
            .clipShape(RoundedRectangle(cornerRadius: 4))
    }
}

// MARK: - Custom Badge Styles
struct AppBadge: View {
    let text: String
    let color: Color
    
    init(_ text: String, color: Color = Color.appPrimary) {
        self.text = text
        self.color = color
    }
    
    var body: some View {
        Text(text)
            .font(.appSmall)
            .fontWeight(.semibold)
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                Capsule()
                    .fill(color)
            )
    }
}

// MARK: - Custom Divider
struct AppDivider: View {
    var body: some View {
        Rectangle()
            .fill(Color.appSecondary.opacity(0.2))
            .frame(height: 1)
    }
}

// MARK: - Custom Spacing
struct AppSpacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
    static let xxl: CGFloat = 48
}

// MARK: - Custom Corner Radius
struct AppCornerRadius {
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let full: CGFloat = 999
}

// MARK: - Animation Extensions
extension Animation {
    static let appSpring = Animation.spring(response: 0.5, dampingFraction: 0.8, blendDuration: 0)
    static let appEaseInOut = Animation.easeInOut(duration: 0.3)
    static let appBounce = Animation.interpolatingSpring(stiffness: 300, damping: 20)
}
