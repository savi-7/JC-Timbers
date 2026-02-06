import 'package:flutter/foundation.dart' show kIsWeb;

/// API configuration - same backend as MERN web app.
///
/// Auto-selects by platform:
/// - Web (Chrome):     http://localhost:5001
/// - Android emulator: http://10.0.2.2:5001
/// - Physical device:  set _apiBaseUrlOverride to your PC's LAN IP
const String _apiBaseUrlOverride = 'http://192.168.41.99:5001';

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

  static String get serviceEnquiries => '$baseUrl/api/services/enquiries';
  static String myEnquiry(String id) => '$baseUrl/api/services/enquiries/$id';
  static String cancelEnquiry(String id) =>
      '$baseUrl/api/services/enquiries/$id/cancel';
  static String availableSlots(String date, {int duration = 120}) =>
      '$baseUrl/api/services/schedule/available/$date?duration=$duration';
}
