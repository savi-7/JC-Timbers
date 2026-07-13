import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Stores pending cart/wishlist actions for guests (like MERN localStorage).
/// After login, app processes these and redirects to cart or wishlist.
const String _keyPendingCartItem = 'pendingCartItem';
const String _keyPendingWishlistItem = 'pendingWishlistItem';
const String _keyLoginRedirect = 'loginRedirect';

class PendingCartItem {
  final String productId;
  final String productName;
  final int quantity;
  final int timestamp;

  PendingCartItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'productName': productName,
        'quantity': quantity,
        'timestamp': timestamp,
      };

  static PendingCartItem? fromJson(Map<String, dynamic>? json) {
    if (json == null) return null;
    final productId = json['productId']?.toString();
    final productName = json['productName']?.toString();
    final quantity = (json['quantity'] as num?)?.toInt();
    final timestamp = (json['timestamp'] as num?)?.toInt();
    if (productId == null || productName == null || quantity == null || quantity < 1 || timestamp == null) return null;
    return PendingCartItem(productId: productId, productName: productName, quantity: quantity, timestamp: timestamp);
  }
}

class PendingWishlistItem {
  final String productId;
  final String productName;
  final int timestamp;

  PendingWishlistItem({
    required this.productId,
    required this.productName,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'productName': productName,
        'timestamp': timestamp,
      };

  static PendingWishlistItem? fromJson(Map<String, dynamic>? json) {
    if (json == null) return null;
    final productId = json['productId']?.toString();
    final productName = json['productName']?.toString();
    final timestamp = (json['timestamp'] as num?)?.toInt();
    if (productId == null || productName == null || timestamp == null) return null;
    return PendingWishlistItem(productId: productId, productName: productName, timestamp: timestamp);
  }
}

/// Redirect after login: 'cart' | 'checkout' | 'wishlist'
class PendingActionsStorage {
  static Future<void> setPendingCartItem({
    required String productId,
    required String productName,
    int quantity = 1,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _keyPendingCartItem,
      jsonEncode(PendingCartItem(
        productId: productId,
        productName: productName,
        quantity: quantity,
        timestamp: DateTime.now().millisecondsSinceEpoch,
      ).toJson()),
    );
  }

  static Future<void> setPendingWishlistItem({
    required String productId,
    required String productName,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _keyPendingWishlistItem,
      jsonEncode(PendingWishlistItem(
        productId: productId,
        productName: productName,
        timestamp: DateTime.now().millisecondsSinceEpoch,
      ).toJson()),
    );
  }

  static Future<void> setLoginRedirect(String redirect) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyLoginRedirect, redirect);
  }

  static Future<PendingCartItem?> getPendingCartItem() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_keyPendingCartItem);
    if (raw == null) return null;
    try {
      return PendingCartItem.fromJson(jsonDecode(raw) as Map<String, dynamic>?);
    } catch (_) {
      return null;
    }
  }

  static Future<PendingWishlistItem?> getPendingWishlistItem() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_keyPendingWishlistItem);
    if (raw == null) return null;
    try {
      return PendingWishlistItem.fromJson(jsonDecode(raw) as Map<String, dynamic>?);
    } catch (_) {
      return null;
    }
  }

  static Future<String?> getLoginRedirect() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyLoginRedirect);
  }

  static Future<void> clearPendingCartItem() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyPendingCartItem);
  }

  static Future<void> clearPendingWishlistItem() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyPendingWishlistItem);
  }

  static Future<void> clearLoginRedirect() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyLoginRedirect);
  }

  /// Clear all pending and redirect (after processing).
  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyPendingCartItem);
    await prefs.remove(_keyPendingWishlistItem);
    await prefs.remove(_keyLoginRedirect);
  }
}
