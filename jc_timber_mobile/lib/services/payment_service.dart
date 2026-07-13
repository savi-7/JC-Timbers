import 'dart:convert';

import 'package:http/http.dart' as http;

import '../auth/auth_service.dart';
import '../config/api_config.dart';
import '../models/address.dart';

class PaymentOrder {
  final String orderId;
  final int amountPaise;
  final String currency;
  final String keyId;

  const PaymentOrder({
    required this.orderId,
    required this.amountPaise,
    required this.currency,
    required this.keyId,
  });
}

class PaymentService {
  PaymentService(this._auth);

  final AuthService _auth;

  Map<String, String> get _headers {
    final h = <String, String>{'Content-Type': 'application/json'};
    h.addAll(_auth.authHeaders);
    return h;
  }

  Future<PaymentOrder?> createRazorpayOrder({
    required double amount,
    required Address address,
  }) async {
    if (!_auth.isLoggedIn) return null;
    try {
      final res = await http.post(
        Uri.parse(ApiConfig.paymentRazorpay),
        headers: _headers,
        body: jsonEncode({
          'amount': amount,
          'address': {
            'name': address.fullName,
            'phone': address.mobileNumber,
            'addressLine': address.address,
            'flatHouseCompany': address.flatHouseCompany,
            'city': address.city,
            'state': address.state,
            'zip': address.pincode,
            'landmark': address.landmark,
            'addressType': address.addressType,
          },
        }),
      );
      if (res.statusCode != 200) return null;
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      return PaymentOrder(
        orderId: data['orderId'] as String? ?? '',
        amountPaise: (data['amount'] as num?)?.toInt() ?? 0,
        currency: data['currency'] as String? ?? 'INR',
        keyId: data['keyId'] as String? ?? '',
      );
    } catch (_) {
      return null;
    }
  }

  Future<bool> verifyRazorpayPayment({
    required String razorpayOrderId,
    required String paymentId,
    required String signature,
    required Address address,
  }) async {
    if (!_auth.isLoggedIn) return false;
    try {
      final res = await http.post(
        Uri.parse(ApiConfig.paymentVerify),
        headers: _headers,
        body: jsonEncode({
          'razorpay_order_id': razorpayOrderId,
          'razorpay_payment_id': paymentId,
          'razorpay_signature': signature,
          'address': {
            'name': address.fullName,
            'phone': address.mobileNumber,
            'addressLine': address.address,
            'flatHouseCompany': address.flatHouseCompany,
            'city': address.city,
            'state': address.state,
            'zip': address.pincode,
            'landmark': address.landmark,
            'addressType': address.addressType,
          },
        }),
      );
      if (res.statusCode != 201 && res.statusCode != 200) return false;
      final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
      return data['success'] == true;
    } catch (_) {
      return false;
    }
  }
}

