import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../auth/auth_service.dart';
import '../models/cart_item.dart';
import '../services/cart_service.dart';
import '../services/payment_service.dart';
import '../services/address_service.dart';
import '../theme/jc_timber_theme.dart';
import 'login_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  late final CartService _cartService;
  late final PaymentService _paymentService;
  late final AddressService _addressService;

  List<CartItem> _items = [];
  bool _loading = true;
  bool _placing = false;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthService>();
    _cartService = CartService(auth);
    _paymentService = PaymentService(auth);
    _addressService = AddressService(auth);
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final items = await _cartService.getCartItems();
    if (!mounted) return;
    setState(() {
      _items = items;
      _loading = false;
    });
  }

  double get _subtotal =>
      _items.fold(0, (s, i) => s + (i.subtotal != 0 ? i.subtotal : i.price * i.quantity));

  double get _shipping => _subtotal >= 1000 ? 0 : (_subtotal == 0 ? 0 : 50);

  double get _total => _subtotal + _shipping;

  Future<void> _checkoutWithRazorpay() async {
    final auth = context.read<AuthService>();
    if (!auth.isLoggedIn) {
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      return;
    }

    if (_items.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Your cart is empty')),
      );
      return;
    }

    setState(() => _placing = true);
    try {
      final addresses = await _addressService.getAddresses();
      if (!mounted) return;
      if (addresses.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please add a delivery address in Profile > Address Management'),
          ),
        );
        return;
      }
      final addr = addresses.firstWhere(
        (a) => a.isDefault,
        orElse: () => addresses.first,
      );

      final order = await _paymentService.createRazorpayOrder(
        amount: _total,
        address: addr,
      );
      if (order == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to create payment order')),
        );
        return;
      }

      // Use Razorpay Flutter SDK
      // We keep the integration minimal here; you may customise UI as needed.
      // ignore: avoid_dynamic_calls
      final razorpay = RazorpaySingleton.instance;
      await razorpay.startPayment(
        context: context,
        key: order.keyId,
        amountPaise: order.amountPaise,
        orderId: order.orderId,
        customerName: addr.fullName,
        customerPhone: addr.mobileNumber,
        onSuccess: (paymentId, signature) async {
          final ok = await _paymentService.verifyRazorpayPayment(
            razorpayOrderId: order.orderId,
            paymentId: paymentId,
            signature: signature,
            address: addr,
          );
          if (!mounted) return;
          if (ok) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Payment successful! Your order has been placed.'),
              ),
            );
            await _load();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Payment verification failed')),
            );
          }
        },
        onFailure: (message) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(message ?? 'Payment cancelled')),
          );
        },
      );
    } finally {
      if (mounted) {
        setState(() => _placing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('My Cart'),
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
      ),
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _items.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text(
                        'Your cart is empty.\nBrowse furniture and add items to cart.',
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 14,
                          color: JcTimberTheme.darkBrown70,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  )
                : Column(
                    children: [
                      Expanded(
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _items.length,
                          itemBuilder: (context, index) {
                            final item = _items[index];
                            return _CartItemTile(
                              item: item,
                              onRemove: () async {
                                await _cartService.removeFromCart(item.productId);
                                await _load();
                              },
                              onQuantityChanged: (q) async {
                                await _cartService.updateQuantity(
                                  productId: item.productId,
                                  quantity: q,
                                );
                                await _load();
                              },
                            );
                          },
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 8,
                              offset: const Offset(0, -2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Subtotal'),
                                Text('₹${_subtotal.toStringAsFixed(0)}'),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Shipping'),
                                Text(_shipping == 0 ? 'Free' : '₹${_shipping.toStringAsFixed(0)}'),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Total',
                                  style: JcTimberTheme.paragraphStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                Text(
                                  '₹${_total.toStringAsFixed(0)}',
                                  style: JcTimberTheme.paragraphStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: JcTimberTheme.accentRed,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: _placing ? null : _checkoutWithRazorpay,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: JcTimberTheme.darkBrown,
                                foregroundColor: JcTimberTheme.cream,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: Text(
                                _placing ? 'Processing...' : 'Pay with Razorpay',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
      ),
    );
  }
}

class _CartItemTile extends StatelessWidget {
  const _CartItemTile({
    required this.item,
    required this.onRemove,
    required this.onQuantityChanged,
  });

  final CartItem item;
  final VoidCallback onRemove;
  final ValueChanged<int> onQuantityChanged;

  @override
  Widget build(BuildContext context) {
    final imageUrl = item.product?.primaryImageUrl;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: JcTimberTheme.gray200),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Container(
              width: 64,
              height: 64,
              color: Colors.grey.shade100,
              child: imageUrl == null
                  ? Icon(
                      Icons.chair_outlined,
                      size: 32,
                      color: Colors.brown.shade300,
                    )
                  : Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                    ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: JcTimberTheme.paragraphStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '₹${item.price.toStringAsFixed(0)}',
                  style: JcTimberTheme.paragraphStyle(
                    fontSize: 13,
                    color: JcTimberTheme.accentRed,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    IconButton(
                      iconSize: 20,
                      onPressed: item.quantity > 1
                          ? () => onQuantityChanged(item.quantity - 1)
                          : null,
                      icon: const Icon(Icons.remove_circle_outline),
                    ),
                    Text(
                      '${item.quantity}',
                      style: const TextStyle(fontSize: 13),
                    ),
                    IconButton(
                      iconSize: 20,
                      onPressed: () => onQuantityChanged(item.quantity + 1),
                      icon: const Icon(Icons.add_circle_outline),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.delete_outline),
                      onPressed: onRemove,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Thin wrapper around `razorpay_flutter` so that CartScreen stays simple.

class RazorpaySingleton {
  RazorpaySingleton._() {
    _razorpay = Razorpay();
  }

  late final Razorpay _razorpay;

  static final RazorpaySingleton instance = RazorpaySingleton._();

  Future<void> startPayment({
    required BuildContext context,
    required String key,
    required int amountPaise,
    required String orderId,
    required String customerName,
    required String customerPhone,
    required void Function(String paymentId, String signature) onSuccess,
    required void Function(String? message) onFailure,
  }) async {
    _razorpay.clear();

    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, (PaymentSuccessResponse r) {
      onSuccess(r.paymentId ?? '', r.signature ?? '');
    });
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, (PaymentFailureResponse r) {
      onFailure(r.message);
    });
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, (_) {});

    final options = {
      'key': key,
      'amount': amountPaise,
      'currency': 'INR',
      'name': 'JC Timbers',
      'order_id': orderId,
      'prefill': {
        'name': customerName,
        'contact': customerPhone,
      },
      'theme': {'color': '#5A3E36'},
    };

    _razorpay.open(options);
  }
}

