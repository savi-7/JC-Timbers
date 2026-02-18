import 'dart:convert';

import 'package:http/http.dart' as http;

import '../auth/auth_service.dart';
import '../config/api_config.dart';
import '../models/product.dart';

class WishlistItem {
  final String productId;
  final Product product;

  const WishlistItem({
    required this.productId,
    required this.product,
  });

  factory WishlistItem.fromJson(Map<String, dynamic> json) {
    final productJson = json['product'] as Map<String, dynamic>? ?? {};
    final product = Product.fromJson(productJson);
    return WishlistItem(
      productId: (json['productId'] ?? productJson['_id'] ?? '').toString(),
      product: product,
    );
  }
}

class WishlistService {
  WishlistService(this._auth);

  final AuthService _auth;

  Map<String, String> get _headers {
    final h = <String, String>{'Content-Type': 'application/json'};
    h.addAll(_auth.authHeaders);
    return h;
  }

  Future<List<WishlistItem>> getWishlist() async {
    if (!_auth.isLoggedIn) return [];
    try {
      final res =
          await http.get(Uri.parse(ApiConfig.wishlist), headers: _headers);
      if (res.statusCode != 200) return [];
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      final list = data['items'] as List<dynamic>? ?? [];
      return list
          .map((e) => WishlistItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  /// Toggle wishlist. When [add] is null, toggles (add if not in list, remove if in list).
  /// Returns (success, wasAdded, errorMessage). wasAdded: true = added, false = removed.
  Future<({bool success, bool? wasAdded, String? errorMessage})> toggleWishlist(String productId, {bool? add}) async {
    if (!_auth.isLoggedIn) {
      return (success: false, wasAdded: null, errorMessage: 'Please log in to use wishlist');
    }
    try {
      if (add == true) {
        final res = await http.post(
          Uri.parse(ApiConfig.wishlistItem(productId)),
          headers: _headers,
        );
        final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
        final msg = data['message'] as String?;
        if (res.statusCode == 200 || res.statusCode == 201) {
          return (success: true, wasAdded: true, errorMessage: null);
        }
        return (success: false, wasAdded: null, errorMessage: msg ?? 'Failed to add to wishlist');
      }
      if (add == false) {
        final res = await http.delete(
          Uri.parse(ApiConfig.wishlistItem(productId)),
          headers: _headers,
        );
        Map<String, dynamic> data = {};
        try {
          if (res.body.isNotEmpty) data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
        } catch (_) {}
        final msg = data['message'] as String?;
        if (res.statusCode == 200) {
          return (success: true, wasAdded: false, errorMessage: null);
        }
        return (success: false, wasAdded: null, errorMessage: msg ?? 'Failed to remove from wishlist');
      }
      // Toggle: try POST first; if conflict/400 then DELETE
      final res = await http.post(
        Uri.parse(ApiConfig.wishlistItem(productId)),
        headers: _headers,
      );
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      final msg = data['message'] as String?;
      if (res.statusCode == 200 || res.statusCode == 201) {
        return (success: true, wasAdded: true, errorMessage: null);
      }
      final delRes = await http.delete(
        Uri.parse(ApiConfig.wishlistItem(productId)),
        headers: _headers,
      );
      Map<String, dynamic> delData = {};
      try {
        if (delRes.body.isNotEmpty) delData = jsonDecode(delRes.body) as Map<String, dynamic>? ?? {};
      } catch (_) {}
      final delMsg = delData['message'] as String?;
      if (delRes.statusCode == 200) {
        return (success: true, wasAdded: false, errorMessage: null);
      }
      return (success: false, wasAdded: null, errorMessage: delMsg ?? msg ?? 'Failed to update wishlist');
    } catch (_) {
      return (success: false, wasAdded: null, errorMessage: 'Failed to update wishlist');
    }
  }

  Future<bool> removeFromWishlist(String productId) async {
    final result = await toggleWishlist(productId, add: false);
    return result.success;
  }
}

