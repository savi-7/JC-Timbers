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
    // Backend returns: { productId, name, price, image, available }
    // We need to construct a Product object from this data
    final productId = (json['productId'] ?? '').toString();
    final name = json['name'] as String? ?? '';
    final price = (json['price'] as num?)?.toDouble() ?? 0.0;
    final available = (json['available'] as num?)?.toInt() ?? 0;
    final imageUrl = json['image'] as String?;
    
    // Create a minimal Product object
    final product = Product(
      id: productId,
      name: name,
      category: '', // Not provided by backend
      quantity: available,
      unit: 'pieces',
      price: price,
      images: imageUrl != null && imageUrl.isNotEmpty
          ? [ProductImage(
              url: imageUrl,
              contentType: 'image/jpeg',
              filename: '',
            )]
          : [],
      attributes: {},
    );
    
    return WishlistItem(
      productId: productId,
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
      if (res.statusCode != 200) {
        print('Wishlist API error: ${res.statusCode} - ${res.body}');
        return [];
      }
      Map<String, dynamic> data = {};
      try {
        if (res.body.isNotEmpty) {
          data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
        }
      } catch (e) {
        print('Wishlist API JSON parse error: $e');
        return [];
      }
      final list = data['items'] as List<dynamic>? ?? [];
      return list
          .map((e) {
            try {
              return WishlistItem.fromJson(e as Map<String, dynamic>);
            } catch (e) {
              print('Wishlist item parse error: $e');
              return null;
            }
          })
          .whereType<WishlistItem>()
          .toList();
    } catch (e) {
      print('Wishlist API network error: $e');
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
        Map<String, dynamic> data = {};
        try {
          if (res.body.isNotEmpty) {
            data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
          }
        } catch (e) {
          // If response body is not valid JSON, continue with empty data
        }
        final msg = data['message'] as String?;
        if (res.statusCode == 200 || res.statusCode == 201) {
          return (success: true, wasAdded: true, errorMessage: null);
        }
        String errorMsg = msg ?? 'Failed to add to wishlist';
        if (res.statusCode == 401) {
          errorMsg = 'Please log in to add to wishlist';
        } else if (res.statusCode == 404) {
          errorMsg = msg ?? 'Product not found';
        }
        return (success: false, wasAdded: null, errorMessage: errorMsg);
      }
      if (add == false) {
        final res = await http.delete(
          Uri.parse(ApiConfig.wishlistItem(productId)),
          headers: _headers,
        );
        Map<String, dynamic> data = {};
        try {
          if (res.body.isNotEmpty) {
            data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
          }
        } catch (e) {
          // If response body is not valid JSON, continue with empty data
        }
        final msg = data['message'] as String?;
        if (res.statusCode == 200) {
          return (success: true, wasAdded: false, errorMessage: null);
        }
        String errorMsg = msg ?? 'Failed to remove from wishlist';
        if (res.statusCode == 401) {
          errorMsg = 'Please log in to remove from wishlist';
        } else if (res.statusCode == 404) {
          errorMsg = msg ?? 'Product not found';
        }
        return (success: false, wasAdded: null, errorMessage: errorMsg);
      }
      // Toggle: try POST first; if conflict/400 then DELETE
      final res = await http.post(
        Uri.parse(ApiConfig.wishlistItem(productId)),
        headers: _headers,
      );
      Map<String, dynamic> data = {};
      try {
        if (res.body.isNotEmpty) {
          data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
        }
      } catch (e) {
        // If response body is not valid JSON, continue with empty data
      }
      final msg = data['message'] as String?;
      if (res.statusCode == 200 || res.statusCode == 201) {
        return (success: true, wasAdded: true, errorMessage: null);
      }
      // If POST failed, try DELETE (item might already be in wishlist)
      final delRes = await http.delete(
        Uri.parse(ApiConfig.wishlistItem(productId)),
        headers: _headers,
      );
      Map<String, dynamic> delData = {};
      try {
        if (delRes.body.isNotEmpty) {
          delData = jsonDecode(delRes.body) as Map<String, dynamic>? ?? {};
        }
      } catch (e) {
        // If response body is not valid JSON, continue with empty data
      }
      final delMsg = delData['message'] as String?;
      if (delRes.statusCode == 200) {
        return (success: true, wasAdded: false, errorMessage: null);
      }
      return (success: false, wasAdded: null, errorMessage: delMsg ?? msg ?? 'Failed to update wishlist');
    } catch (e) {
      return (success: false, wasAdded: null, errorMessage: 'Network error. Please check your connection and try again.');
    }
  }

  Future<bool> removeFromWishlist(String productId) async {
    final result = await toggleWishlist(productId, add: false);
    return result.success;
  }
}

