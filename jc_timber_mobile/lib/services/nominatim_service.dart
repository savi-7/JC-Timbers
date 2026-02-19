import 'dart:convert';
import 'package:http/http.dart' as http;

/// Nominatim (OpenStreetMap) search and reverse geocode. Same usage as MERN (User-Agent, countrycodes=in).
class NominatimService {
  static const String _base = 'https://nominatim.openstreetmap.org';
  static const String _userAgent = 'JC-Timbers-Marketplace/1.0';

  static final _headers = {'User-Agent': _userAgent};

  /// Search for a place by query. Returns list of { displayName, lat, lon }.
  static Future<List<({String displayName, double lat, double lon})>> search(
    String query, {
    String countryCodes = 'in',
  }) async {
    if (query.trim().isEmpty) return [];
    try {
      final uri = Uri.parse('$_base/search').replace(
        queryParameters: {
          'q': query.trim(),
          'format': 'json',
          'countrycodes': countryCodes,
          'limit': '10',
        },
      );
      final res = await http.get(uri, headers: _headers);
      if (res.statusCode != 200) return [];
      final list = jsonDecode(res.body) as List<dynamic>? ?? [];
      return list.map((e) {
        final m = e as Map<String, dynamic>;
        final lat = (m['lat'] as num?)?.toDouble() ?? 0.0;
        final lon = (m['lon'] as num?)?.toDouble() ?? 0.0;
        final name = m['display_name'] as String? ?? '';
        return (displayName: name, lat: lat, lon: lon);
      }).toList();
    } catch (_) {
      return [];
    }
  }

  /// Reverse geocode lat/lon to address string.
  static Future<String?> reverse(double lat, double lon) async {
    try {
      final uri = Uri.parse('$_base/reverse').replace(
        queryParameters: {
          'lat': lat.toString(),
          'lon': lon.toString(),
          'format': 'json',
        },
      );
      final res = await http.get(uri, headers: _headers);
      if (res.statusCode != 200) return null;
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      return data['display_name'] as String?;
    } catch (_) {
      return null;
    }
  }
}
