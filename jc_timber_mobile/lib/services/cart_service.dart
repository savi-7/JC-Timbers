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
      if (res.statusCode != 200) {
        // Log error for debugging
        print('Cart API error: ${res.statusCode} - ${res.body}');
        return [];
      }
      Map<String, dynamic> data = {};
      try {
        if (res.body.isNotEmpty) {
          data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
        }
      } catch (e) {
        print('Cart API JSON parse error: $e');
        return [];
      }
      final list = data['items'] as List<dynamic>? ?? [];
      return list
          .map((e) {
            try {
              return CartItem.fromJson(e as Map<String, dynamic>);
            } catch (e) {
              print('Cart item parse error: $e');
              return null;
            }
          })
          .whereType<CartItem>()
          .toList();
    } catch (e) {
      print('Cart API network error: $e');
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
      
      Map<String, dynamic> data = {};
      try {
        if (res.body.isNotEmpty) {
          data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
        }
      } catch (e) {
        // If response body is not valid JSON, continue with empty data
      }
      
      final message = data['message'] as String?;
      
      if (res.statusCode == 200 || res.statusCode == 201) {
        return (success: true, errorMessage: null);
      }
      
      // Handle specific error status codes
      String errorMsg = message ?? 'Failed to add to cart';
      if (res.statusCode == 400) {
        errorMsg = message ?? 'Invalid request. Please check product availability.';
      } else if (res.statusCode == 401) {
        errorMsg = 'Please log in to add to cart';
      } else if (res.statusCode == 404) {
        errorMsg = message ?? 'Product not found';
      } else if (res.statusCode == 500) {
        errorMsg = message ?? 'Server error. Please try again later.';
      }
      
      return (success: false, errorMessage: errorMsg);
    } catch (e) {
      return (success: false, errorMessage: 'Network error. Please check your connection and try again.');
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

