import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// JC Timber design system - matches MERN tailwind.config.js exactly.
class JcTimberTheme {
  // Colors from tailwind.config.js
  static const Color cream = Color(0xFFFEFAF0);
  static const Color lightCream = Color(0xFFF5F1E8);
  static const Color darkBrown = Color(0xFF2E0F13);
  static const Color accentRed = Color(0xFF913F4A);
  static const Color lightPink = Color(0xFFEAB9B3);

  // Opacity variants (MERN uses /20, /60, /70)
  static Color get darkBrown20 => darkBrown.withOpacity(0.2);
  static Color get darkBrown60 => darkBrown.withOpacity(0.6);
  static Color get darkBrown70 => darkBrown.withOpacity(0.7);
  static Color get accentRed20 => accentRed.withOpacity(0.2);
  static Color get accentRed30 => accentRed.withOpacity(0.3);
  static Color get gray200 => const Color(0xFFE5E7EB);
  static Color get gray300 => const Color(0xFFD1D5DB);
  static Color get gray500 => const Color(0xFF6B7280);
  static Color get gray600 => const Color(0xFF4B5563);

  // Error (MERN: red-500, red-600)
  static const Color errorBorder = Color(0xFFEF4444);
  static const Color errorBg = Color(0xFFFEF2F2);
  static const Color errorText = Color(0xFFDC2626);

  // Fonts: Fraunces (heading), Inter (paragraph) - from tailwind
  static TextStyle headingStyle({
    double? fontSize,
    FontWeight fontWeight = FontWeight.bold,
    Color color = darkBrown,
  }) =>
      GoogleFonts.fraunces(
        fontSize: fontSize ?? 28,
        fontWeight: fontWeight,
        color: color,
      );

  static TextStyle paragraphStyle({
    double? fontSize,
    FontWeight fontWeight = FontWeight.w500,
    Color color = darkBrown,
  }) =>
      GoogleFonts.inter(
        fontSize: fontSize ?? 14,
        fontWeight: fontWeight,
        color: color,
      );

  static ThemeData get theme => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.light(
          primary: accentRed,
          onPrimary: cream,
          surface: cream,
          onSurface: darkBrown,
          error: errorBorder,
          onError: Colors.white,
        ),
        scaffoldBackgroundColor: cream,
        fontFamily: GoogleFonts.inter().fontFamily,
        textTheme: TextTheme(
          headlineLarge: GoogleFonts.fraunces(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: darkBrown,
          ),
          headlineMedium: GoogleFonts.fraunces(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: darkBrown,
          ),
          titleMedium: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: darkBrown70,
          ),
          bodyMedium: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: darkBrown,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withOpacity(0.8),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: darkBrown20),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: accentRed, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: errorBorder),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          labelStyle: paragraphStyle(fontSize: 14, fontWeight: FontWeight.w600),
          hintStyle: paragraphStyle(fontSize: 14, color: darkBrown60),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: accentRed,
            foregroundColor: cream,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      );
}
