import 'dart:convert';

import 'package:http/http.dart' as http;

import '../auth/auth_service.dart';
import '../config/api_config.dart';
import '../models/cart_item.dart';

class CartService {
  CartService(this._auth);

  final AuthService _auth;

  Map<String, String> get _headers {
    final h = <String, String>{'Content-Type': 'application/json'};
    h.addAll(_auth.authHeaders);
    return h;
  }

  Future<List<CartItem>> getCartItems() async {
    if (!_auth.isLoggedIn) return [];
    try {
      final res = await http.get(Uri.parse(ApiConfig.cart), headers: _headers);
      if (res.statusCode != 200) return [];
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      final list = data['items'] as List<dynamic>? ?? [];
      return list
          .map((e) => CartItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  /// Returns (success, errorMessage). Error message from API when status is not 2xx.
  Future<({bool success, String? errorMessage})> addToCart({
    required String productId,
    int quantity = 1,
  }) async {
    if (!_auth.isLoggedIn) {
      return (success: false, errorMessage: 'Please log in to add to cart');
    }
    try {
      final res = await http.post(
        Uri.parse(ApiConfig.cart),
        headers: _headers,
        body: jsonEncode({'productId': productId, 'quantity': quantity}),
      );
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      final message = data['message'] as String?;
      if (res.statusCode == 200 || res.statusCode == 201) {
        return (success: true, errorMessage: null);
      }
      return (success: false, errorMessage: message ?? 'Failed to add to cart');
    } catch (e) {
      return (success: false, errorMessage: 'Failed to add to cart');
    }
  }

  Future<bool> updateQuantity({
    required String productId,
    required int quantity,
  }) async {
    if (!_auth.isLoggedIn) return false;
    try {
      final res = await http.patch(
        Uri.parse(ApiConfig.cart),
        headers: _headers,
        body: jsonEncode({'productId': productId, 'quantity': quantity}),
      );
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<bool> removeFromCart(String productId) async {
    if (!_auth.isLoggedIn) return false;
    try {
      final uri = Uri.parse('${ApiConfig.cart}/$productId');
      final res = await http.delete(uri, headers: _headers);
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}

