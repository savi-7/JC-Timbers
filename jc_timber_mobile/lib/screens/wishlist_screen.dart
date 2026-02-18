import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../auth/auth_service.dart';
import '../services/wishlist_service.dart';
import '../services/cart_service.dart';
import '../theme/jc_timber_theme.dart';

class WishlistScreen extends StatefulWidget {
  const WishlistScreen({super.key});

  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {
  late final WishlistService _wishlistService;
  late final CartService _cartService;

  List<WishlistItem> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthService>();
    _wishlistService = WishlistService(auth);
    _cartService = CartService(auth);
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final list = await _wishlistService.getWishlist();
    if (!mounted) return;
    setState(() {
      _items = list;
      _loading = false;
    });
  }

  Future<void> _moveToCart(WishlistItem item) async {
    final result = await _cartService.addToCart(productId: item.productId);
    if (!result.success) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result.errorMessage ?? 'Failed to move item to cart')),
      );
      return;
    }
    await _wishlistService.removeFromWishlist(item.productId);
    await _load();
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Moved ${item.product.name} to cart')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('My Wishlist'),
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
                        'Your wishlist is empty.\nTap the heart icon on furniture to add items here.',
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 14,
                          color: JcTimberTheme.darkBrown70,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _items.length,
                    itemBuilder: (context, index) {
                      final item = _items[index];
                      final img = item.product.primaryImageUrl;
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
                                child: img == null
                                    ? Icon(
                                        Icons.chair_outlined,
                                        size: 32,
                                        color: Colors.brown.shade300,
                                      )
                                    : Image.network(img, fit: BoxFit.cover),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.product.name,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: JcTimberTheme.paragraphStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '₹${item.product.price.toStringAsFixed(0)}',
                                    style: JcTimberTheme.paragraphStyle(
                                      fontSize: 13,
                                      color: JcTimberTheme.accentRed,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      TextButton(
                                        onPressed: () => _moveToCart(item),
                                        child: const Text('Move to cart'),
                                      ),
                                      const Spacer(),
                                      IconButton(
                                        icon: const Icon(Icons.delete_outline),
                                        onPressed: () async {
                                          await _wishlistService
                                              .removeFromWishlist(
                                            item.productId,
                                          );
                                          await _load();
                                        },
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}

