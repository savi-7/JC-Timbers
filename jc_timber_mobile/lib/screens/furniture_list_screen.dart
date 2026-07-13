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
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: JcTimberTheme.darkBrown,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9),
              shape: BoxShape.circle,
            ),
            child: IconButton(
              tooltip: 'Wishlist',
              icon: Icon(Icons.favorite_border, color: JcTimberTheme.darkBrown),
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const WishlistScreen()),
                );
              },
            ),
          ),
          Container(
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9),
              shape: BoxShape.circle,
            ),
            child: IconButton(
              tooltip: 'Cart',
              icon: Icon(Icons.shopping_cart_outlined, color: JcTimberTheme.darkBrown),
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const CartScreen()),
                );
              },
            ),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null && _products.isEmpty
              ? _buildErrorEmptyState()
              : RefreshIndicator(
                  onRefresh: _load,
                  color: JcTimberTheme.accentRed,
                  child: CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(
                        child: _buildHeaderSection(),
                      ),
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                        sliver: SliverToBoxAdapter(
                          child: Text(
                            filtered.isEmpty
                                ? 'No results found'
                                : '${filtered.length} ${filtered.length == 1 ? 'item' : 'items'} available',
                            style: JcTimberTheme.paragraphStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: JcTimberTheme.gray500,
                            ),
                          ),
                        ),
                      ),
                      SliverPadding(
                        padding: const EdgeInsets.fromLTRB(20, 12, 20, 40),
                        sliver: SliverGrid(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 16,
                            mainAxisSpacing: 24,
                            childAspectRatio: 0.60,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final p = filtered[index];
                              return _FurnitureCard(
                                product: p,
                                isWishlisted: _wishlistIds.contains(p.id),
                                onAddToCart: () => _addToCart(p),
                                onToggleWishlist: () => _toggleWishlist(p),
                              );
                            },
                            childCount: filtered.length,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildErrorEmptyState() {
    return Center(
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
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: JcTimberTheme.lightCream,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.chair_alt_outlined,
                  size: 64,
                  color: JcTimberTheme.darkBrown20,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'No Furniture Available',
                style: JcTimberTheme.headingStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                _error!,
                style: JcTimberTheme.paragraphStyle(
                  fontSize: 15,
                  color: JcTimberTheme.gray500,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderSection() {
    return Container(
      decoration: BoxDecoration(
        color: JcTimberTheme.darkBrown,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
        boxShadow: [
          BoxShadow(
            color: JcTimberTheme.darkBrown.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: EdgeInsets.fromLTRB(24, MediaQuery.of(context).padding.top + 60, 24, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Curated Collection',
            style: JcTimberTheme.paragraphStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: JcTimberTheme.accentRed,
            ).copyWith(letterSpacing: 2.0),
          ),
          const SizedBox(height: 12),
          Text(
            'Modern Furniture\nFor Elegant Homes',
            style: JcTimberTheme.headingStyle(
              fontSize: 32,
              color: Colors.white,
            ).copyWith(height: 1.15),
          ),
          const SizedBox(height: 24),
          _buildSearchBar(),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: TextField(
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          prefixIcon: const Icon(Icons.search_rounded, color: Colors.white70),
          hintText: 'Search furniture...',
          hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
          border: InputBorder.none,
          focusedBorder: InputBorder.none,
          enabledBorder: InputBorder.none,
          errorBorder: InputBorder.none,
          disabledBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          filled: false,
        ),
        onChanged: (v) {
          setState(() {
            _search = v.trim();
          });
        },
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
    
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(productId: product.id),
          ),
        );
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image Container
          Expanded(
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: JcTimberTheme.gray200, width: 0.5),
                    boxShadow: [
                      BoxShadow(
                        color: JcTimberTheme.darkBrown.withOpacity(0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: imageUrl == null
                          ? Icon(
                              Icons.chair_outlined,
                              size: 48,
                              color: Colors.brown.shade200,
                            )
                          : Image.network(
                              imageUrl,
                              fit: BoxFit.contain, // Show entire piece of furniture without cropping
                              errorBuilder: (_, __, ___) => Icon(
                                Icons.chair_outlined,
                                size: 48,
                                color: Colors.brown.shade200,
                              ),
                            ),
                    ),
                  ),
                ),
                // Wishlist Badge
                Positioned(
                  top: 10,
                  right: 10,
                  child: GestureDetector(
                    onTap: onToggleWishlist,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Icon(
                        isWishlisted ? Icons.favorite : Icons.favorite_border,
                        size: 20,
                        color: isWishlisted ? Colors.red : JcTimberTheme.gray500,
                      ),
                    ),
                  ),
                ),
                // Floating Add to Cart Button
                Positioned(
                  bottom: -12,
                  right: 16,
                  child: GestureDetector(
                    onTap: onAddToCart,
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: JcTimberTheme.darkBrown,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: JcTimberTheme.darkBrown.withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.add_shopping_cart_rounded,
                        size: 18,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Product Info
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: JcTimberTheme.paragraphStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ).copyWith(height: 1.3),
                ),
                const SizedBox(height: 6),
                Text(
                  '₹${product.price.toStringAsFixed(0)}',
                  style: JcTimberTheme.paragraphStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: JcTimberTheme.accentRed,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

