import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/service_enquiry.dart';
import '../models/availability_result.dart';
import '../auth/auth_service.dart';

/// Timber processing booking - uses SAME backend APIs as MERN.
class TimberService {
  TimberService(this._auth);

  final AuthService _auth;

  Map<String, String> get _headers {
    final h = {'Content-Type': 'application/json'};
    h.addAll(_auth.authHeaders);
    return h;
  }

  /// Check availability for a date (public, no auth) - matches MERN
  Future<AvailabilityResult> checkAvailability(String date, {int duration = 120}) async {
    try {
      final res = await http.get(
        Uri.parse(ApiConfig.availableSlots(date, duration: duration)),
      );
      if (res.statusCode != 200) {
        return AvailabilityResult(isHoliday: false, availableSlots: [], bookedSlots: []);
      }
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      return AvailabilityResult.fromJson(data);
    } catch (_) {
      return AvailabilityResult(isHoliday: false, availableSlots: [], bookedSlots: []);
    }
  }

  /// Check if a time is available (not in booked slots)
  bool isTimeAvailable(String time, List<TimeSlot> bookedSlots) {
    if (time.isEmpty || bookedSlots.isEmpty) return true;
    final parts = time.split(':');
    if (parts.length < 2) return true;
    final selectedMin = (int.tryParse(parts[0]) ?? 0) * 60 + (int.tryParse(parts[1]) ?? 0);
    for (final slot in bookedSlots) {
      final sParts = slot.startTime.split(':');
      final eParts = slot.endTime.split(':');
      if (sParts.length < 2 || eParts.length < 2) continue;
      final startMin = (int.tryParse(sParts[0]) ?? 0) * 60 + (int.tryParse(sParts[1]) ?? 0);
      final endMin = (int.tryParse(eParts[0]) ?? 0) * 60 + (int.tryParse(eParts[1]) ?? 0);
      if (selectedMin >= startMin && selectedMin < endMin) return false;
    }
    return true;
  }

  /// Create enquiry - POST /api/services/enquiries (auth required)
  Future<TimberResult> createEnquiry({
    required String workType,
    required List<LogItem> logItems,
    required String requestedDate,
    required String requestedTime,
    String? phoneNumber,
    String? name,
    String? notes,
  }) async {
    if (!_auth.isLoggedIn) {
      return TimberResult.fail('Please log in first');
    }
    try {
      final totalCubicFeet =
          logItems.fold<double>(0, (s, i) => s + i.cubicFeet);
      final body = {
        'workType': workType,
        'logItems': logItems.map((e) => e.toJson()).toList(),
        'cubicFeet': totalCubicFeet,
        'requestedDate': requestedDate,
        'requestedTime': requestedTime,
        if (phoneNumber != null && phoneNumber.isNotEmpty) 'phoneNumber': phoneNumber,
        if (name != null && name.isNotEmpty) 'name': name,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
      };
      final res = await http.post(
        Uri.parse(ApiConfig.serviceEnquiries),
        headers: _headers,
        body: jsonEncode(body),
      );
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};

      if (res.statusCode == 201) {
        final enquiry = data['enquiry'];
        if (enquiry != null) {
          return TimberResult.success(
            ServiceEnquiry.fromJson(enquiry as Map<String, dynamic>),
          );
        }
      }
      return TimberResult.fail(
        data['message'] as String? ?? 'Failed to submit booking',
      );
    } catch (e) {
      return TimberResult.fail(e.toString());
    }
  }

  /// Get my enquiries - GET /api/services/enquiries/my
  Future<List<ServiceEnquiry>> getMyEnquiries({String? status}) async {
    if (!_auth.isLoggedIn) return [];
    try {
      var url = '${ApiConfig.serviceEnquiries}/my';
      if (status != null && status.isNotEmpty) {
        url += '?status=$status';
      }
      final res = await http.get(Uri.parse(url), headers: _headers);
      if (res.statusCode != 200) return [];
      final data = jsonDecode(res.body);
      final list = data['enquiries'] as List<dynamic>? ?? [];
      return list
          .map((e) => ServiceEnquiry.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  /// Cancel enquiry - PUT /api/services/enquiries/:id/cancel
  Future<bool> cancelEnquiry(String id) async {
    if (!_auth.isLoggedIn) return false;
    try {
      final res = await http.put(
        Uri.parse(ApiConfig.cancelEnquiry(id)),
        headers: _headers,
      );
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}

class TimberResult {
  final bool success;
  final ServiceEnquiry? enquiry;
  final String? error;

  TimberResult._({required this.success, this.enquiry, this.error});

  factory TimberResult.success(ServiceEnquiry enquiry) =>
      TimberResult._(success: true, enquiry: enquiry);

  factory TimberResult.fail(String error) =>
      TimberResult._(success: false, error: error);
}
