import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/address.dart';
import '../auth/auth_service.dart';

/// Address service - CRUD for user addresses (GET/POST/PUT/DELETE/PATCH default).
class AddressService {
  final AuthService auth;

  AddressService(this.auth);

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        ...auth.authHeaders,
      };

  Future<List<Address>> getAddresses() async {
    final res = await http.get(
      Uri.parse(ApiConfig.addresses),
      headers: _headers,
    );
    final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
    if (res.statusCode != 200) {
      throw Exception(data['message'] as String? ?? 'Failed to load addresses');
    }
    final list = data['addresses'] as List<dynamic>? ?? [];
    return list
        .map((e) => Address.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Address> addAddress(Address address) async {
    final res = await http.post(
      Uri.parse(ApiConfig.addresses),
      headers: _headers,
      body: jsonEncode(address.toJson()),
    );
    final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
    if (res.statusCode != 201) {
      throw Exception(data['message'] as String? ?? 'Failed to add address');
    }
    final created = data['address'] as Map<String, dynamic>?;
    if (created == null) throw Exception('Invalid response');
    return Address.fromJson(created);
  }

  Future<Address> updateAddress(String id, Address address) async {
    final res = await http.put(
      Uri.parse(ApiConfig.addressById(id)),
      headers: _headers,
      body: jsonEncode(address.toJson()),
    );
    final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
    if (res.statusCode != 200) {
      throw Exception(data['message'] as String? ?? 'Failed to update address');
    }
    final updated = data['address'] as Map<String, dynamic>?;
    if (updated == null) throw Exception('Invalid response');
    return Address.fromJson(updated);
  }

  Future<void> deleteAddress(String id) async {
    final res = await http.delete(
      Uri.parse(ApiConfig.addressById(id)),
      headers: _headers,
    );
    if (res.statusCode != 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      throw Exception(data['message'] as String? ?? 'Failed to delete address');
    }
  }

  Future<void> setDefaultAddress(String id) async {
    final res = await http.patch(
      Uri.parse(ApiConfig.addressSetDefault(id)),
      headers: _headers,
    );
    if (res.statusCode != 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      throw Exception(data['message'] as String? ?? 'Failed to set default');
    }
  }
}
