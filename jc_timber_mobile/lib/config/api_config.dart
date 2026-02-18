import 'package:flutter/foundation.dart' show kIsWeb;

/// API configuration - same backend as MERN web app.
///
/// Production: Vercel backend (works on any device, no LAN needed).
/// Local dev: set _apiBaseUrlOverride to empty and use --dart-define=API_BASE_URL=...
///
/// - Production (Vercel): https://jc-timbersbackend.vercel.app
/// - Web (Chrome):        http://localhost:5001
/// - Android emulator:    http://10.0.2.2:5001
/// - Physical device:     Your PC's LAN IP, e.g. http://192.168.1.5:5001
const String _apiBaseUrlOverride = 'https://jc-timbersbackend.vercel.app';

class ApiConfig {
  static String get baseUrl {
    if (_apiBaseUrlOverride.isNotEmpty) return _apiBaseUrlOverride;
    if (kIsWeb) return 'http://localhost:5001'; // Flutter web in Chrome
    return const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'http://10.0.2.2:5001',
    );
  }

  static String get authLogin => '$baseUrl/api/auth/login';
  static String get authRegister => '$baseUrl/api/auth/register';
  static String get authProfile => '$baseUrl/api/auth/profile';
  static String get authChangePassword => '$baseUrl/api/auth/change-password';

  // Ecommerce - products (shared with MERN web)
  static String get products => '$baseUrl/api/products';
  static String productById(String id) => '$baseUrl/api/products/$id';

  // Ecommerce - cart
  static String get cart => '$baseUrl/api/cart';

  // Ecommerce - wishlist
  static String get wishlist => '$baseUrl/api/wishlist';
  static String wishlistItem(String productId) =>
      '$baseUrl/api/wishlist/$productId';

  // Payments (Razorpay & COD)
  static String get paymentRazorpay => '$baseUrl/api/payment/razorpay';
  static String get paymentVerify => '$baseUrl/api/payment/verify';
  static String get paymentCod => '$baseUrl/api/payment/cod';

  static String get addresses => '$baseUrl/api/addresses';
  static String addressById(String id) => '$baseUrl/api/addresses/$id';
  static String addressSetDefault(String id) => '$baseUrl/api/addresses/$id/default';

  static String get serviceEnquiries => '$baseUrl/api/services/enquiries';
  static String myEnquiry(String id) => '$baseUrl/api/services/enquiries/$id';
  static String cancelEnquiry(String id) =>
      '$baseUrl/api/services/enquiries/$id/cancel';
  static String availableSlots(String date, {int duration = 120}) =>
      '$baseUrl/api/services/schedule/available/$date?duration=$duration';
}
