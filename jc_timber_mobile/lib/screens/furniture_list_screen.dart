import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../auth/auth_service.dart';
import '../models/product.dart';
import '../services/cart_service.dart';
import '../services/product_service.dart';
import '../services/wishlist_service.dart';
import '../theme/jc_timber_theme.dart';
import '../services/pending_actions_storage.dart';
import 'product_detail_screen.dart';
import 'login_screen.dart';
import 'cart_screen.dart';
import 'wishlist_screen.dart';

class FurnitureListScreen extends StatefulWidget {
  const FurnitureListScreen({super.key});

  @override
  State<FurnitureListScreen> createState() => _FurnitureListScreenState();
}

class _FurnitureListScreenState extends State<FurnitureListScreen> {
  late final ProductService _productService;
  late final CartService _cartService;
  late final WishlistService _wishlistService;

  List<Product> _products = [];
  final Set<String> _wishlistIds = {};
  bool _loading = true;
  String? _error;
  String _search = '';

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthService>();
    _productService = ProductService(auth);
    _cartService = CartService(auth);
    _wishlistService = WishlistService(auth);
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final list = await _productService.getFurnitureProducts();
    final auth = context.read<AuthService>();
    Set<String> wishlistIds = {};
    if (auth.isLoggedIn) {
      final wishlist = await _wishlistService.getWishlist();
      wishlistIds = wishlist.map((e) => e.productId).toSet();
    }
    if (!mounted) return;
    setState(() {
      _products = list;
      _wishlistIds.clear();
      _wishlistIds.addAll(wishlistIds);
      _loading = false;
      if (list.isEmpty) {
        _error = 'No furniture available right now. Please check back soon.';
      }
    });
  }

  Future<void> _addToCart(Product p) async {
    final auth = context.read<AuthService>();
    if (!auth.isLoggedIn) {
      await PendingActionsStorage.setPendingCartItem(
        productId: p.id,
        productName: p.name,
        quantity: 1,
      );
      await PendingActionsStorage.setLoginRedirect('cart');
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      return;
    }
    final result = await _cartService.addToCart(productId: p.id, quantity: 1);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result.success ? 'Added ${p.name} to cart' : (result.errorMessage ?? 'Failed to add to cart'),
        ),
      ),
    );
  }

  Future<void> _toggleWishlist(Product p) async {
    final auth = context.read<AuthService>();
    if (!auth.isLoggedIn) {
      await PendingActionsStorage.setPendingWishlistItem(
        productId: p.id,
        productName: p.name,
      );
      await PendingActionsStorage.setLoginRedirect('wishlist');
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      return;
    }
    final isCurrentlyWishlisted = _wishlistIds.contains(p.id);
    final result = await _wishlistService.toggleWishlist(p.id, add: !isCurrentlyWishlisted);
    if (!mounted) return;
    if (result.success) {
      setState(() {
        if (result.wasAdded == true) {
          _wishlistIds.add(p.id);
        } else if (result.wasAdded == false) {
          _wishlistIds.remove(p.id);
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result.wasAdded == true
                ? 'Added ${p.name} to wishlist'
                : result.wasAdded == false
                    ? 'Removed from wishlist'
                    : (result.errorMessage ?? 'Updated wishlist'),
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result.errorMessage ?? 'Failed to update wishlist')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _products.where((p) {
      if (_search.isEmpty) return true;
      final q = _search.toLowerCase();
      return p.name.toLowerCase().contains(q) ||
          (p.description ?? '').toLowerCase().contains(q);
    }).toList();

    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('Furniture'),
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
        actions: [
          IconButton(
            tooltip: 'Wishlist',
            icon: const Icon(Icons.favorite_border),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const WishlistScreen()),
              );
            },
          ),
          IconButton(
            tooltip: 'Cart',
            icon: const Icon(Icons.shopping_cart_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CartScreen()),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null && _products.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: JcTimberTheme.darkBrown.withOpacity(0.06),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.chair_alt_outlined,
                                size: 72,
                                color: Colors.brown.shade300,
                              ),
                              const SizedBox(height: 20),
                              Text(
                                'No Furniture Available',
                                style: JcTimberTheme.headingStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w600,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 10),
                              Text(
                                _error!,
                                style: JcTimberTheme.paragraphStyle(
                                  fontSize: 14,
                                  color: JcTimberTheme.darkBrown70,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  : Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: JcTimberTheme.darkBrown.withOpacity(0.04),
                                      blurRadius: 12,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Handcrafted Furniture',
                                      style: JcTimberTheme.headingStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Explore premium tables, chairs, beds and more – curated from the same catalog as the website.',
                                      style: JcTimberTheme.paragraphStyle(
                                        fontSize: 13,
                                        color: JcTimberTheme.darkBrown70,
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    TextField(
                                      decoration: InputDecoration(
                                        prefixIcon: const Icon(Icons.search),
                                        hintText: 'Search furniture...',
                                        fillColor: Colors.white,
                                        filled: true,
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(16),
                                          borderSide: BorderSide(
                                            color: JcTimberTheme.gray200,
                                          ),
                                        ),
                                        enabledBorder: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(16),
                                          borderSide: BorderSide(
                                            color: JcTimberTheme.gray200,
                                          ),
                                        ),
                                      ),
                                      onChanged: (v) {
                                        setState(() {
                                          _search = v.trim();
                                        });
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Row(
                            children: [
                              Text(
                                filtered.isEmpty
                                    ? 'No results'
                                    : '${filtered.length} ${filtered.length == 1 ? 'item' : 'items'}',
                                style: JcTimberTheme.paragraphStyle(
                                  fontSize: 13,
                                  color: JcTimberTheme.darkBrown70,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        Expanded(
                          child: GridView.builder(
                            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                              childAspectRatio: 0.50,
                            ),
                            itemCount: filtered.length,
                            itemBuilder: (context, index) {
                              final p = filtered[index];
                              return _FurnitureCard(
                                product: p,
                                isWishlisted: _wishlistIds.contains(p.id),
                                onAddToCart: () => _addToCart(p),
                                onToggleWishlist: () => _toggleWishlist(p),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
        ),
      ),
    );
  }
}

class _FurnitureCard extends StatelessWidget {
  const _FurnitureCard({
    required this.product,
    required this.isWishlisted,
    required this.onAddToCart,
    required this.onToggleWishlist,
  });

  final Product product;
  final bool isWishlisted;
  final VoidCallback onAddToCart;
  final VoidCallback onToggleWishlist;

  @override
  Widget build(BuildContext context) {
    final imageUrl = product.primaryImageUrl;
    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(productId: product.id),
          ),
        );
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: JcTimberTheme.gray200),
          boxShadow: [
            BoxShadow(
              color: JcTimberTheme.darkBrown.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
            BoxShadow(
              color: JcTimberTheme.darkBrown.withOpacity(0.08),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 1,
                  child: ClipRRect(
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(20)),
                    child: Container(
                      color: Colors.grey.shade100,
                      child: imageUrl == null
                          ? Icon(
                              Icons.chair_outlined,
                              size: 48,
                              color: Colors.brown.shade300,
                            )
                          : Image.network(
                              imageUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Icon(
                                Icons.chair_outlined,
                                size: 48,
                                color: Colors.brown.shade300,
                              ),
                            ),
                    ),
                  ),
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Material(
                    color: Colors.white.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(20),
                    child: InkWell(
                      onTap: onToggleWishlist,
                      borderRadius: BorderRadius.circular(20),
                      child: Padding(
                        padding: const EdgeInsets.all(8),
                        child: Icon(
                          isWishlisted ? Icons.favorite : Icons.favorite_border,
                          size: 20,
                          color: isWishlisted ? Colors.red : Colors.redAccent,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: JcTimberTheme.paragraphStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '₹${product.price.toStringAsFixed(0)}',
                    style: JcTimberTheme.paragraphStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: JcTimberTheme.accentRed,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: onAddToCart,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        minimumSize: const Size(0, 32),
                        side: BorderSide(
                          color: JcTimberTheme.darkBrown.withOpacity(0.7),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Add to cart',
                        style: TextStyle(fontSize: 11),
                      ),
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

