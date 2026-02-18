import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user.dart';

/// AuthService for JC Timber - connects to existing MERN backend.
/// Uses POST /api/auth/login - no new auth system, matches backend exactly.
class AuthService extends ChangeNotifier {
  static const _tokenKey = 'jc_timber_jwt_token';
  static const _userKey = 'jc_timber_user';

  String? _token;
  User? _user;

  String? get token => _token;
  User? get user => _user;
  bool get isLoggedIn => _token != null && _token!.isNotEmpty;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      try {
        _user = User.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
      } catch (_) {}
    }
  }

  Future<void> _persist(String? token, User? user) async {
    _token = token;
    _user = user;
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString(_tokenKey, token);
    } else {
      await prefs.remove(_tokenKey);
    }
    if (user != null) {
      await prefs.setString(_userKey, jsonEncode(user.toJson()));
    } else {
      await prefs.remove(_userKey);
    }
  }

  /// Login - POST /api/auth/login (MERN backend)
  /// - Sends JSON: { email, password }
  /// - Receives: { token (JWT), user: { id, name, email, phone, role } }
  /// - Returns AuthResult (success with user, or failure with error message)
  Future<AuthResult> login(String email, String password) async {
    try {
      // JSON request body
      final body = jsonEncode({'email': email, 'password': password});
      final res = await http.post(
        Uri.parse(ApiConfig.authLogin),
        headers: {'Content-Type': 'application/json'},
        body: body,
      );
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};

      if (res.statusCode == 200) {
        final token = data['token'] as String?;
        final userMap = data['user'] as Map<String, dynamic>?;
        if (token == null || userMap == null) {
          return AuthResult.fail('Invalid response from server');
        }
        final user = User.fromJson(userMap);
        await _persist(token, user);
        notifyListeners();
        return AuthResult.success(user);
      }
      // Handle login errors (400 Invalid credentials, 500 server error)
      return AuthResult.fail(
        data['message'] as String? ?? 'Login failed',
      );
    } catch (e) {
      return AuthResult.fail(e.toString());
    }
  }

  /// Register - POST /api/auth/register (same as MERN)
  Future<AuthResult> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      final res = await http.post(
        Uri.parse(ApiConfig.authRegister),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          if (phone != null && phone.isNotEmpty) 'phone': phone,
        }),
      );
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};

      if (res.statusCode == 201) {
        // Registration success - go to login page (no auto-login)
        return AuthResult.registrationSuccess();
      }
      return AuthResult.fail(
        data['message'] as String? ?? 'Registration failed',
      );
    } catch (e) {
      return AuthResult.fail(e.toString());
    }
  }

  Future<void> logout() async {
    await _persist(null, null);
    notifyListeners();
  }

  Map<String, String> get authHeaders {
    if (_token == null) return {};
    return {'Authorization': 'Bearer $_token'};
  }

  /// Update profile - PUT /api/auth/profile
  /// Updates name / email / phone for the logged-in user and refreshes local cache.
  Future<AuthResult> updateProfile({
    required String name,
    required String email,
    String? phone,
  }) async {
    if (_token == null) {
      return AuthResult.fail('Not authenticated');
    }
    try {
      final res = await http.put(
        Uri.parse(ApiConfig.authProfile),
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: jsonEncode({
          'name': name,
          'email': email,
          if (phone != null && phone.isNotEmpty) 'phone': phone,
        }),
      );

      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};

      if (res.statusCode == 200) {
        final userMap = data['user'] as Map<String, dynamic>?;
        if (userMap == null) {
          return AuthResult.fail('Invalid response from server');
        }
        final updatedUser = User.fromJson(userMap);
        await _persist(_token, updatedUser);
        notifyListeners();
        return AuthResult.success(updatedUser);
      }

      return AuthResult.fail(
        data['message'] as String? ?? 'Profile update failed',
      );
    } catch (e) {
      return AuthResult.fail(e.toString());
    }
  }

  /// Change password - PUT /api/auth/change-password
  Future<AuthResult> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    if (_token == null) {
      return AuthResult.fail('Not authenticated');
    }
    try {
      final res = await http.put(
        Uri.parse(ApiConfig.authChangePassword),
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: jsonEncode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      if (res.statusCode == 200) {
        return AuthResult._(success: true, user: _user);
      }
      return AuthResult.fail(
        data['message'] as String? ?? 'Password change failed',
      );
    } catch (e) {
      return AuthResult.fail(e.toString());
    }
  }
}

class AuthResult {
  final bool success;
  final User? user;
  final String? error;

  AuthResult._({required this.success, this.user, this.error});

  factory AuthResult.success(User user) =>
      AuthResult._(success: true, user: user);

  /// Used when registration succeeds - user should go to login page
  factory AuthResult.registrationSuccess() =>
      AuthResult._(success: true, user: null);

  factory AuthResult.fail(String error) =>
      AuthResult._(success: false, error: error);
}
