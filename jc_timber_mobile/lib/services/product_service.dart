import 'dart:convert';

import 'package:http/http.dart' as http;

import '../auth/auth_service.dart';
import '../config/api_config.dart';
import '../models/product.dart';

class ProductService {
  ProductService(this._auth);

  final AuthService _auth;

  Map<String, String> get _headers {
    final h = <String, String>{'Content-Type': 'application/json'};
    h.addAll(_auth.authHeaders);
    return h;
  }

  /// Fetch all furniture products (category = 'furniture') from backend.
  Future<List<Product>> getFurnitureProducts() async {
    try {
      final uri = Uri.parse('${ApiConfig.products}?limit=100');
      final res = await http.get(uri, headers: _headers);
      if (res.statusCode != 200) return [];
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      final list = data['products'] as List<dynamic>? ?? [];
      return list
          .map((e) => Product.fromJson(e as Map<String, dynamic>))
          .where((p) => p.category == 'furniture')
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<Product?> getProductById(String id) async {
    try {
      final uri = Uri.parse(ApiConfig.productById(id));
      final res = await http.get(uri, headers: _headers);
      if (res.statusCode != 200) return null;
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      final productJson = data['product'] as Map<String, dynamic>? ?? data;
      return Product.fromJson(productJson);
    } catch (_) {
      return null;
    }
  }
}

