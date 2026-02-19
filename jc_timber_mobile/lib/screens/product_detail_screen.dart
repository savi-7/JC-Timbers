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
  bool _showSpecifications = false;
  bool _isWishlisted = false;
  bool _addingToCart = false;
  bool _buyingNow = false;
  bool _updatingWishlist = false;

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
                ? 'Added ${_quantity} ${_product!.name} to cart'
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

  Future<void> _buyNow() async {
    if (_product == null || _buyingNow) return;
    final auth = context.read<AuthService>();
    if (!auth.isLoggedIn) {
      await PendingActionsStorage.setPendingCartItem(
        productId: _product!.id,
        productName: _product!.name,
        quantity: _quantity,
      );
      await PendingActionsStorage.setLoginRedirect('checkout');
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      return;
    }
    setState(() {
      _buyingNow = true;
    });
    try {
      final result = await _cartService.addToCart(
        productId: _product!.id,
        quantity: _quantity,
      );
      if (!mounted) return;
      if (!result.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.errorMessage ?? 'Failed to add to cart'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const CartScreen()),
      );
    } finally {
      if (mounted) {
        setState(() {
          _buyingNow = false;
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
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('Product Details'),
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
        actions: [
          if (_product != null)
            IconButton(
              icon: Icon(
                _isWishlisted ? Icons.favorite : Icons.favorite_border,
                color: _isWishlisted ? Colors.red : JcTimberTheme.cream,
              ),
              onPressed: _toggleWishlist,
            ),
          IconButton(
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
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null || _product == null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 64,
                            color: Colors.red.shade300,
                          ),
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
                  )
                : RefreshIndicator(
                    onRefresh: _load,
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Image Gallery
                          _buildImageGallery(),
                          const SizedBox(height: 24),

                          // Product Info
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Category Badges
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.blue.shade100,
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        _product!.category.toUpperCase(),
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.blue.shade800,
                                        ),
                                      ),
                                    ),
                                    if (_product!.subcategory != null)
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 6,
                                        ),
                                      ),
                                    if (_product!.featuredType != null &&
                                        _product!.featuredType != 'none')
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 6,
                                        ),
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
                                            fontWeight: FontWeight.w600,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 16),

                                // Product Name
                                Text(
                                  _product!.name,
                                  style: JcTimberTheme.headingStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 10),

                                // Price
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.baseline,
                                  textBaseline: TextBaseline.alphabetic,
                                  children: [
                                    Text(
                                      '₹${_product!.price.toStringAsFixed(0)}',
                                      style: JcTimberTheme.headingStyle(
                                        fontSize: 28,
                                        fontWeight: FontWeight.w700,
                                        color: JcTimberTheme.accentRed,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'per ${_product!.unit}',
                                      style: JcTimberTheme.paragraphStyle(
                                        fontSize: 14,
                                        color: JcTimberTheme.darkBrown70,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 20),

                                // Rating (if available)
                                if (_product!.rating > 0)
                                  Row(
                                    children: [
                                      ...List.generate(5, (index) {
                                        return Icon(
                                          index < _product!.rating.round()
                                              ? Icons.star
                                              : Icons.star_border,
                                          size: 20,
                                          color: Colors.amber,
                                        );
                                      }),
                                      const SizedBox(width: 8),
                                      Text(
                                        '${_product!.rating.toStringAsFixed(1)} (${_product!.reviewCount} ${_product!.reviewCount == 1 ? 'review' : 'reviews'})',
                                        style: JcTimberTheme.paragraphStyle(
                                          fontSize: 13,
                                          color: JcTimberTheme.darkBrown70,
                                        ),
                                      ),
                                    ],
                                  ),
                                const SizedBox(height: 24),

                                // Description
                                if (_product!.description != null &&
                                    _product!.description!.isNotEmpty) ...[
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(20),
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
                                          'Description',
                                          style: JcTimberTheme.headingStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        const SizedBox(height: 10),
                                        Text(
                                          _product!.description!,
                                          style: JcTimberTheme.paragraphStyle(
                                            fontSize: 14,
                                            color: JcTimberTheme.darkBrown70,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 24),
                                ],

                                // Specifications
                                _buildSpecifications(),
                                const SizedBox(height: 24),

                                // Purchase Section
                                _buildPurchaseSection(),
                                const SizedBox(height: 32),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }

  Widget _buildImageGallery() {
    if (_product == null || _product!.images.isEmpty) {
      return Container(
        height: 300,
        margin: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Center(
          child: Icon(
            Icons.chair_outlined,
            size: 64,
            color: Colors.brown.shade300,
          ),
        ),
      );
    }

    final selectedImage = _product!.images[_selectedImageIndex];
    final imageUrl = _product!.getImageUrl(selectedImage);

    return Column(
      children: [
        // Main Image
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(
            height: 360,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: JcTimberTheme.darkBrown.withOpacity(0.06),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: imageUrl == null
                  ? Icon(
                      Icons.chair_outlined,
                      size: 64,
                      color: Colors.brown.shade300,
                    )
                  : Image.network(
                      imageUrl,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => Icon(
                        Icons.chair_outlined,
                        size: 64,
                        color: Colors.brown.shade300,
                      ),
                    ),
            ),
          ),
        ),

        // Thumbnails
        if (_product!.images.length > 1) ...[
          const SizedBox(height: 20),
          SizedBox(
            height: 84,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: _product!.images.length,
              itemBuilder: (context, index) {
                final thumb = _product!.images[index];
                final thumbUrl = _product!.getImageUrl(thumb);
                final isSelected = index == _selectedImageIndex;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedImageIndex = index;
                    });
                  },
                  child: Container(
                    width: 84,
                    height: 84,
                    margin: const EdgeInsets.only(right: 14),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? JcTimberTheme.darkBrown
                            : JcTimberTheme.gray200,
                        width: isSelected ? 2 : 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: JcTimberTheme.darkBrown.withOpacity(0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: thumbUrl == null
                          ? Container(
                              color: Colors.grey.shade200,
                              child: Icon(
                                Icons.image_outlined,
                                size: 32,
                                color: Colors.grey.shade400,
                              ),
                            )
                          : Image.network(
                              thumbUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                color: Colors.grey.shade200,
                                child: Icon(
                                  Icons.image_outlined,
                                  size: 32,
                                  color: Colors.grey.shade400,
                                ),
                              ),
                            ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildSpecifications() {
    final specs = <MapEntry<String, String>>[];
    if (_product!.size != null) {
      specs.add(MapEntry('Size', _product!.size!));
    }
    if (_product!.unit.isNotEmpty) {
      specs.add(MapEntry('Unit', _product!.unit));
    }
    if (_product!.material != null) {
      specs.add(MapEntry('Material', _product!.material!));
    }
    if (_product!.color != null) {
      specs.add(MapEntry('Color', _product!.color!));
    }
    if (_product!.brand != null) {
      specs.add(MapEntry('Brand', _product!.brand!));
    }
    if (_product!.weight != null) {
      specs.add(MapEntry('Weight', _product!.weight!));
    }
    if (_product!.quantity > 0) {
      specs.add(MapEntry('Stock Available', '${_product!.quantity} units'));
    }
    if (_product!.attributes.isNotEmpty) {
      _product!.attributes.forEach((key, value) {
        specs.add(MapEntry(
          key.replaceAllMapped(
            RegExp(r'([A-Z])'),
            (match) => ' ${match.group(1)}',
          ).trim(),
          value.toString(),
        ));
      });
    }

    if (specs.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(20),
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
          InkWell(
            onTap: () {
              setState(() {
                _showSpecifications = !_showSpecifications;
              });
            },
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Specifications',
                    style: JcTimberTheme.headingStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Icon(
                    _showSpecifications
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    color: JcTimberTheme.darkBrown,
                  ),
                ],
              ),
            ),
          ),
          if (_showSpecifications) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: specs.map((spec) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          spec.key,
                          style: JcTimberTheme.paragraphStyle(
                            fontSize: 13,
                            color: JcTimberTheme.darkBrown70,
                          ),
                        ),
                        Text(
                          spec.value,
                          style: JcTimberTheme.paragraphStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPurchaseSection() {
    final total = _product!.price * _quantity;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: JcTimberTheme.gray200),
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
          // Quantity Selector
          Text(
            'Quantity',
            style: JcTimberTheme.paragraphStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              IconButton(
                onPressed: _quantity > 1
                    ? () {
                        setState(() {
                          _quantity--;
                        });
                      }
                    : null,
                icon: const Icon(Icons.remove_circle_outline),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.grey.shade100,
                ),
              ),
              const SizedBox(width: 16),
              Text(
                '$_quantity',
                style: JcTimberTheme.headingStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 16),
              IconButton(
                onPressed: () {
                  setState(() {
                    _quantity++;
                  });
                },
                icon: const Icon(Icons.add_circle_outline),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.grey.shade100,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Total Price
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
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
                  '₹${total.toStringAsFixed(0)}',
                  style: JcTimberTheme.headingStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: JcTimberTheme.accentRed,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Action Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _addingToCart ? null : _addToCart,
                  icon: _addingToCart
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.shopping_cart_outlined),
                  label: Text(_addingToCart ? 'Adding...' : 'Add to Cart'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: BorderSide(
                      color: JcTimberTheme.darkBrown.withOpacity(0.7),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _buyingNow ? null : _buyNow,
                  icon: _buyingNow
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.flash_on),
                  label: Text(_buyingNow ? 'Processing...' : 'Buy Now'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange.shade600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _updatingWishlist ? null : _toggleWishlist,
              icon: _updatingWishlist
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Icon(
                      _isWishlisted ? Icons.favorite : Icons.favorite_border,
                      color: _isWishlisted ? Colors.red : JcTimberTheme.darkBrown,
                    ),
              label: Text(
                _updatingWishlist
                    ? 'Updating...'
                    : (_isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'),
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: BorderSide(
                  color: _isWishlisted
                      ? Colors.red
                      : JcTimberTheme.darkBrown.withOpacity(0.7),
                ),
                foregroundColor: _isWishlisted
                    ? Colors.red
                    : JcTimberTheme.darkBrown,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
