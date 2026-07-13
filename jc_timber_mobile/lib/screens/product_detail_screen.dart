import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../auth/auth_service.dart';
import '../models/product.dart';
import '../services/cart_service.dart';
import '../services/product_service.dart';
import '../services/wishlist_service.dart';
import '../theme/jc_timber_theme.dart';
import '../services/pending_actions_storage.dart';
import 'cart_screen.dart';
import 'login_screen.dart';
import 'request_quote_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({
    super.key,
    required this.productId,
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late final ProductService _productService;
  late final CartService _cartService;
  late final WishlistService _wishlistService;

  Product? _product;
  bool _loading = true;
  String? _error;
  int _selectedImageIndex = 0;
  int _quantity = 1;
  bool _isWishlisted = false;
  bool _addingToCart = false;
  bool _updatingWishlist = false;

  late PageController _imagePageController;

  @override
  void initState() {
    super.initState();
    _imagePageController = PageController();
    final auth = context.read<AuthService>();
    _productService = ProductService(auth);
    _cartService = CartService(auth);
    _wishlistService = WishlistService(auth);
    _load();
  }

  @override
  void dispose() {
    _imagePageController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final product = await _productService.getProductById(widget.productId);
    if (!mounted) return;
    setState(() {
      _product = product;
      _loading = false;
      if (product == null) {
        _error = 'Product not found';
      }
    });
    if (product != null) {
      _checkWishlistStatus();
    }
  }

  Future<void> _checkWishlistStatus() async {
    final auth = context.read<AuthService>();
    if (!auth.isLoggedIn) {
      setState(() {
        _isWishlisted = false;
      });
      return;
    }
    try {
      final wishlist = await _wishlistService.getWishlist();
      if (!mounted) return;
      setState(() {
        _isWishlisted = wishlist.any((item) => item.productId == _product?.id);
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isWishlisted = false;
      });
    }
  }

  Future<void> _addToCart() async {
    if (_product == null || _addingToCart) return;
    final auth = context.read<AuthService>();
    if (!auth.isLoggedIn) {
      await PendingActionsStorage.setPendingCartItem(
        productId: _product!.id,
        productName: _product!.name,
        quantity: _quantity,
      );
      await PendingActionsStorage.setLoginRedirect('cart');
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      return;
    }
    setState(() {
      _addingToCart = true;
    });
    try {
      final result = await _cartService.addToCart(
        productId: _product!.id,
        quantity: _quantity,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result.success
                ? 'Added $_quantity ${_product!.name} to cart'
                : (result.errorMessage ?? 'Failed to add to cart'),
          ),
          backgroundColor: result.success ? Colors.green : Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _addingToCart = false;
        });
      }
    }
  }

  Future<void> _toggleWishlist() async {
    if (_product == null || _updatingWishlist) return;
    final auth = context.read<AuthService>();
    if (!auth.isLoggedIn) {
      await PendingActionsStorage.setPendingWishlistItem(
        productId: _product!.id,
        productName: _product!.name,
      );
      await PendingActionsStorage.setLoginRedirect('wishlist');
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      return;
    }
    setState(() {
      _updatingWishlist = true;
    });
    try {
      final result = await _wishlistService.toggleWishlist(
        _product!.id,
        add: !_isWishlisted,
      );
      if (!mounted) return;
      if (result.success) {
        setState(() {
          _isWishlisted = result.wasAdded == true;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              result.wasAdded == true
                  ? 'Added ${_product!.name} to wishlist'
                  : result.wasAdded == false
                      ? 'Removed from wishlist'
                      : (result.errorMessage ?? 'Updated wishlist'),
            ),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.errorMessage ?? 'Failed to update wishlist'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _updatingWishlist = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: JcTimberTheme.cream,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null || _product == null) {
      return Scaffold(
        backgroundColor: JcTimberTheme.cream,
        appBar: AppBar(
          backgroundColor: JcTimberTheme.darkBrown,
          foregroundColor: JcTimberTheme.cream,
          title: const Text('Product Details'),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 64, color: Colors.red.shade300),
                const SizedBox(height: 16),
                Text(
                  _error ?? 'Product not found',
                  style: JcTimberTheme.headingStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: JcTimberTheme.darkBrown,
                    foregroundColor: JcTimberTheme.cream,
                  ),
                  child: const Text('Go Back'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      body: CustomScrollView(
        slivers: [
          // Immersive Image Gallery Header
          SliverAppBar(
            expandedHeight: 450,
            pinned: true,
            backgroundColor: JcTimberTheme.darkBrown,
            foregroundColor: JcTimberTheme.cream,
            elevation: 0,
            actions: [
              Container(
                margin: const EdgeInsets.only(right: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: Icon(
                    _isWishlisted ? Icons.favorite : Icons.favorite_border,
                    color: _isWishlisted ? Colors.redAccent : Colors.white,
                  ),
                  onPressed: _updatingWishlist ? null : _toggleWishlist,
                ),
              ),
              Container(
                margin: const EdgeInsets.only(right: 16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const CartScreen()),
                    );
                  },
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: _buildImageGallery(),
            ),
          ),

          // Content Body
          SliverToBoxAdapter(
            child: Container(
              decoration: BoxDecoration(
                color: JcTimberTheme.cream,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(32),
                  topRight: Radius.circular(32),
                ),
              ),
              transform: Matrix4.translationValues(0, -32, 0), // Pull up slightly over the image
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 100), // extra bottom padding for persistent bar
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Badges
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: JcTimberTheme.darkBrown.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            _product!.category.toUpperCase(),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: JcTimberTheme.darkBrown,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ),
                        if (_product!.featuredType != null && _product!.featuredType != 'none')
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: JcTimberTheme.accentRed,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _product!.featuredType == 'best'
                                  ? 'BEST SELLER'
                                  : _product!.featuredType == 'new'
                                      ? 'NEW ARRIVAL'
                                      : 'DISCOUNTED',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                                letterSpacing: 1.0,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Title
                    Text(
                      _product!.name,
                      style: JcTimberTheme.headingStyle(
                        fontSize: 28,
                        color: JcTimberTheme.darkBrown,
                      ).copyWith(height: 1.2),
                    ),
                    const SizedBox(height: 12),

                    // Price & Rating Row
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '₹${_product!.price.toStringAsFixed(0)}',
                          style: JcTimberTheme.headingStyle(
                            fontSize: 32,
                            color: JcTimberTheme.accentRed,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Text(
                            'per ${_product!.unit}',
                            style: JcTimberTheme.paragraphStyle(
                              fontSize: 14,
                              color: JcTimberTheme.gray500,
                            ),
                          ),
                        ),
                        const Spacer(),
                        if (_product!.rating > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.amber.shade50,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.amber.shade200),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.star_rounded, size: 18, color: Colors.amber),
                                const SizedBox(width: 4),
                                Text(
                                  _product!.rating.toStringAsFixed(1),
                                  style: JcTimberTheme.paragraphStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.amber.shade900,
                                  ),
                                ),
                                Text(
                                  ' (${_product!.reviewCount})',
                                  style: JcTimberTheme.paragraphStyle(
                                    fontSize: 12,
                                    color: Colors.amber.shade900.withOpacity(0.7),
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Description
                    if (_product!.description != null && _product!.description!.isNotEmpty) ...[
                      Text(
                        'Description',
                        style: JcTimberTheme.headingStyle(
                          fontSize: 20,
                          color: JcTimberTheme.darkBrown,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _product!.description!,
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 15,
                          color: JcTimberTheme.darkBrown70,
                        ).copyWith(height: 1.6),
                      ),
                      const SizedBox(height: 32),
                    ],

                    // Specifications
                    _buildSpecifications(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      // Sticky Bottom Bar
      bottomNavigationBar: _buildStickyBottomBar(),
    );
  }

  Widget _buildImageGallery() {
    if (_product == null || _product!.images.isEmpty) {
      return Container(
        color: Colors.white,
        child: Center(
          child: Icon(
            Icons.chair_outlined,
            size: 80,
            color: Colors.brown.shade200,
          ),
        ),
      );
    }

    return Container(
      color: Colors.white,
      child: Stack(
        children: [
          PageView.builder(
            controller: _imagePageController,
            itemCount: _product!.images.length,
            onPageChanged: (index) {
              setState(() {
                _selectedImageIndex = index;
              });
            },
            itemBuilder: (context, index) {
              final imageUrl = _product!.getImageUrl(_product!.images[index]);
              return Padding(
                padding: const EdgeInsets.only(bottom: 60, top: 40),
                child: imageUrl == null
                    ? Icon(Icons.chair_outlined, size: 80, color: Colors.brown.shade200)
                    : Image.network(
                        imageUrl,
                        fit: BoxFit.contain, // maintain entire furniture view
                      ),
              );
            },
          ),
          
          if (_product!.images.length > 1)
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _product!.images.length,
                  (index) => AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: _selectedImageIndex == index ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _selectedImageIndex == index
                          ? JcTimberTheme.darkBrown
                          : JcTimberTheme.darkBrown.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSpecifications() {
    final specs = <MapEntry<String, String>>[];
    if (_product!.size != null) specs.add(MapEntry('Dimensions', _product!.size!));
    if (_product!.material != null) specs.add(MapEntry('Material', _product!.material!));
    if (_product!.color != null) specs.add(MapEntry('Color', _product!.color!));
    if (_product!.brand != null) specs.add(MapEntry('Brand', _product!.brand!));
    if (_product!.weight != null) specs.add(MapEntry('Weight', _product!.weight!));
    if (_product!.quantity > 0) specs.add(MapEntry('Availability', '${_product!.quantity} in stock'));

    if (_product!.attributes.isNotEmpty) {
      _product!.attributes.forEach((key, value) {
        specs.add(MapEntry(
          key.replaceAllMapped(RegExp(r'([A-Z])'), (match) => ' ${match.group(1)}').trim(),
          value.toString(),
        ));
      });
    }

    if (specs.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            title: Text(
              'Specifications Details',
              style: JcTimberTheme.headingStyle(
                fontSize: 20,
                color: JcTimberTheme.darkBrown,
              ),
            ),
            tilePadding: EdgeInsets.zero,
            childrenPadding: const EdgeInsets.only(top: 16),
            initiallyExpanded: true,
            iconColor: JcTimberTheme.darkBrown,
            collapsedIconColor: JcTimberTheme.darkBrown70,
            children: [
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: JcTimberTheme.gray200),
                ),
                child: ListView.separated(
                  physics: const NeverScrollableScrollPhysics(),
                  shrinkWrap: true,
                  padding: const EdgeInsets.all(0),
                  itemCount: specs.length,
                  separatorBuilder: (context, index) => Divider(
                    height: 1,
                    color: JcTimberTheme.gray200,
                  ),
                  itemBuilder: (context, index) {
                    final spec = specs[index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 2,
                            child: Text(
                              spec.key,
                              style: JcTimberTheme.paragraphStyle(
                                fontSize: 14,
                                color: JcTimberTheme.gray500,
                              ),
                            ),
                          ),
                          Expanded(
                            flex: 3,
                            child: Text(
                              spec.value,
                              style: JcTimberTheme.paragraphStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: JcTimberTheme.darkBrown,
                              ),
                              textAlign: TextAlign.right,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStickyBottomBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: JcTimberTheme.darkBrown.withOpacity(0.08),
            blurRadius: 24,
            offset: const Offset(0, -8),
          ),
        ],
      ),
      child: SafeArea(
        child: _product?.productType == 'made-to-order'
            ? Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => RequestQuoteScreen(product: _product!),
                          ),
                        );
                      },
                      icon: const Icon(Icons.request_quote_outlined, color: Colors.white),
                      label: const Text(
                        'REQUEST CUSTOM QUOTE',
                        style: TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1.0),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: JcTimberTheme.darkBrown,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        minimumSize: const Size(double.infinity, 56),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(28),
                        ),
                      ),
                    ),
                  ),
                ],
              )
            : Row(
                children: [
            // Quantity Selector
            Container(
              height: 56,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: JcTimberTheme.gray200),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.remove, color: _quantity > 1 ? JcTimberTheme.darkBrown : JcTimberTheme.gray500),
                    onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                  ),
                  SizedBox(
                    width: 32,
                    child: Text(
                      '$_quantity',
                      textAlign: TextAlign.center,
                      style: JcTimberTheme.paragraphStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.add, color: JcTimberTheme.darkBrown),
                    onPressed: () => setState(() => _quantity++),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            
            // Add to Cart Button
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _addingToCart ? null : _addToCart,
                icon: _addingToCart
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.shopping_bag_outlined, color: Colors.white),
                label: Text(
                  _addingToCart ? 'ADDING...' : 'ADD TO CART',
                  style: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1.0),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: JcTimberTheme.darkBrown,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(28),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
