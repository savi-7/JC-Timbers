import 'dart:convert';
import 'package:http/http.dart' as http;

import '../auth/auth_service.dart';
import '../config/api_config.dart';
import '../models/marketplace_listing.dart';

class MarketplaceService {
  MarketplaceService(this._auth);

  final AuthService _auth;

  Map<String, String> get _headers {
    final h = <String, String>{'Content-Type': 'application/json'};
    h.addAll(_auth.authHeaders);
    return h;
  }

  /// List listings with optional filters. Uses same backend as MERN.
  Future<({List<MarketplaceListing> listings, int total, int totalPages})> getListings({
    int page = 1,
    int limit = 20,
    String? category,
    String? condition,
    String sortBy = 'createdAt',
    String sortOrder = 'desc',
  }) async {
    try {
      final q = <String>['page=$page', 'limit=$limit', 'sortBy=$sortBy', 'sortOrder=$sortOrder'];
      if (category != null && category.isNotEmpty) q.add('category=${Uri.encodeComponent(category)}');
      if (condition != null && condition.isNotEmpty) q.add('condition=${Uri.encodeComponent(condition)}');
      final uri = Uri.parse('${ApiConfig.marketplaceListings}?${q.join('&')}');
      final res = await http.get(uri, headers: _headers);
      if (res.statusCode != 200) return (listings: <MarketplaceListing>[], total: 0, totalPages: 0);
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      final list = data['listings'] as List<dynamic>? ?? [];
      final total = (data['total'] as num?)?.toInt() ?? 0;
      final totalPages = (data['totalPages'] as num?)?.toInt() ?? 1;
      final listings = list
          .map((e) => MarketplaceListing.fromJson(e as Map<String, dynamic>))
          .toList();
      return (listings: listings, total: total, totalPages: totalPages);
    } catch (_) {
      return (listings: <MarketplaceListing>[], total: 0, totalPages: 0);
    }
  }

  /// Get single listing by ID.
  Future<MarketplaceListing?> getListingById(String id) async {
    try {
      final uri = Uri.parse(ApiConfig.marketplaceListingById(id));
      final res = await http.get(uri, headers: _headers);
      if (res.statusCode != 200) return null;
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      final listingJson = data['listing'] as Map<String, dynamic>? ?? data;
      return MarketplaceListing.fromJson(listingJson);
    } catch (_) {
      return null;
    }
  }

  /// Create listing (auth required). Sends multipart: title, price, category, condition, description, location, lat, lon, image file.
  Future<({bool success, String? message})> createListing({
    required String title,
    required double price,
    required String category,
    required String condition,
    required String description,
    required String location,
    required double lat,
    required double lon,
    required String imagePath,
  }) async {
    if (!_auth.isLoggedIn) return (success: false, message: 'Please log in');
    try {
      final uri = Uri.parse(ApiConfig.marketplaceListings);
      final request = http.MultipartRequest('POST', uri);
      request.headers.addAll(_auth.authHeaders);
      request.fields['title'] = title;
      request.fields['price'] = price.toString();
      request.fields['category'] = category;
      request.fields['condition'] = condition;
      request.fields['description'] = description;
      request.fields['location'] = location;
      request.fields['lat'] = lat.toString();
      request.fields['lon'] = lon.toString();
      request.files.add(await http.MultipartFile.fromPath('image', imagePath));
      final streamed = await request.send();
      final res = await http.Response.fromStream(streamed);
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      final msg = data['message'] as String?;
      if (res.statusCode == 201 || res.statusCode == 200) {
        return (success: true, message: msg);
      }
      return (success: false, message: msg ?? 'Failed to create listing');
    } catch (e) {
      return (success: false, message: e.toString());
    }
  }
}
