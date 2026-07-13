import 'package:shared_preferences/shared_preferences.dart';

/// TokenService - stores JWT like localStorage in React.
/// Uses shared_preferences for persistence across app restarts.
class TokenService {
  static const _tokenKey = 'jc_timber_jwt_token';

  /// Save JWT token (persists across app restarts)
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  /// Get stored token, or null if none
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  /// Clear token on logout
  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }
}
