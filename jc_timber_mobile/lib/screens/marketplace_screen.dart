import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../auth/auth_service.dart';
import '../models/marketplace_listing.dart';
import '../services/marketplace_service.dart';
import '../config/api_config.dart';
import '../theme/jc_timber_theme.dart';
import 'marketplace_listing_detail_screen.dart';
import 'create_marketplace_listing_screen.dart';
import 'marketplace_location_filter_screen.dart';
import 'login_screen.dart';

/// Marketplace list - same backend as MERN. Browse, filter by category/condition/location, open detail, create listing.
class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  late final MarketplaceService _marketplaceService;
  List<MarketplaceListing> _listings = [];
  List<MarketplaceListing> _filtered = [];
  bool _loading = true;
  String? _error;
  String _search = '';
  String _category = '';
  String _condition = '';
  String _sortBy = 'createdAt';
  String _sortOrder = 'desc';
  String? _locationFilter;
  int _page = 1;
  int _totalPages = 1;
  final _scrollController = ScrollController();

  static const _categories = [
    '',
    'Sofa',
    'Study Table',
    'Dining Table',
    'Bed',
    'Wardrobe',
    'Chair',
    'Coffee Table',
    'TV Unit',
    'Bookshelf',
    'Custom Furniture',
  ];
  static const _conditions = ['', 'new', 'used-like-new', 'used-good', 'fair'];

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthService>();
    _marketplaceService = MarketplaceService(auth);
    _load();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent - 200 &&
        !_loading &&
        _page < _totalPages) {
      _loadMore();
    }
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
      _page = 1;
    });
    final result = await _marketplaceService.getListings(
      page: 1,
      limit: 20,
      category: _category.isEmpty ? null : _category,
      condition: _condition.isEmpty ? null : _condition,
      sortBy: _sortBy,
      sortOrder: _sortOrder,
    );
    if (!mounted) return;
    setState(() {
      _listings = result.listings;
      _totalPages = result.totalPages;
      _loading = false;
    });
    _applyFilters();
  }

  Future<void> _loadMore() async {
    if (_loading || _page >= _totalPages) return;
    setState(() => _loading = true);
    final nextPage = _page + 1;
    final result = await _marketplaceService.getListings(
      page: nextPage,
      limit: 20,
      category: _category.isEmpty ? null : _category,
      condition: _condition.isEmpty ? null : _condition,
      sortBy: _sortBy,
      sortOrder: _sortOrder,
    );
    if (!mounted) return;
    setState(() {
      _listings = [..._listings, ...result.listings];
      _page = nextPage;
      _totalPages = result.totalPages;
      _loading = false;
    });
    _applyFilters();
  }

  void _applyFilters() {
    var list = _listings;
    if (_search.trim().isNotEmpty) {
      final q = _search.toLowerCase();
      list = list.where((l) {
        return l.title.toLowerCase().contains(q) ||
            l.description.toLowerCase().contains(q) ||
            l.category.toLowerCase().contains(q) ||
            l.location.toLowerCase().contains(q);
      }).toList();
    }
    if (_locationFilter != null && _locationFilter!.trim().isNotEmpty) {
      final loc = _locationFilter!.toLowerCase();
      list = list.where((l) => l.location.toLowerCase().contains(loc)).toList();
    }
    setState(() => _filtered = list);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('Marketplace'),
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            tooltip: 'Sell / Create listing',
            onPressed: () {
              final auth = context.read<AuthService>();
              if (!auth.isLoggedIn) {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
                return;
              }
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const CreateMarketplaceListingScreen(),
                ),
              ).then((_) => _load());
            },
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildFilters(),
              Expanded(
                child: _loading && _listings.isEmpty
                    ? const Center(child: CircularProgressIndicator())
                    : _error != null
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(_error!, textAlign: TextAlign.center),
                                  const SizedBox(height: 16),
                                  TextButton(
                                    onPressed: _load,
                                    child: const Text('Retry'),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : _filtered.isEmpty
                            ? Center(
                                child: Padding(
                                  padding: const EdgeInsets.all(24),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.store_outlined,
                                          size: 64, color: Colors.brown.shade300),
                                      const SizedBox(height: 16),
                                      Text(
                                        _search.isNotEmpty ||
                                                _category.isNotEmpty ||
                                                _condition.isNotEmpty ||
                                                (_locationFilter != null &&
                                                    _locationFilter!.isNotEmpty)
                                            ? 'No listings match your filters'
                                            : 'No listings yet',
                                        style: JcTimberTheme.headingStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.w600),
                                        textAlign: TextAlign.center,
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            : ListView.builder(
                                controller: _scrollController,
                                padding: const EdgeInsets.all(16),
                                itemCount: _filtered.length + (_loading ? 1 : 0),
                                itemBuilder: (context, index) {
                                  if (index >= _filtered.length) {
                                    return const Padding(
                                      padding: EdgeInsets.all(16),
                                      child: Center(
                                          child: CircularProgressIndicator()),
                                    );
                                  }
                                  final listing = _filtered[index];
                                  return _ListingCard(
                                    listing: listing,
                                    onTap: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) =>
                                              MarketplaceListingDetailScreen(
                                            listingId: listing.id,
                                          ),
                                        ),
                                      ).then((_) => _applyFilters());
                                    },
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

  Widget _buildFilters() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            decoration: InputDecoration(
              hintText: 'Search listings...',
              prefixIcon: const Icon(Icons.search),
              filled: true,
              fillColor: Colors.grey.shade50,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
            ),
            onChanged: (v) {
              setState(() {
                _search = v.trim();
                _applyFilters();
              });
            },
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _filterChip(
                  label: _category.isEmpty ? 'Category' : _category,
                  onTap: () async {
                    final chosen = await showModalBottomSheet<String>(
                      context: context,
                      builder: (ctx) => SafeArea(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            ..._categories.map((c) => ListTile(
                                  title: Text(c.isEmpty ? 'All' : c),
                                  onTap: () => Navigator.pop(ctx, c),
                                )),
                          ],
                        ),
                      ),
                    );
                    if (chosen != null) {
                      setState(() {
                        _category = chosen;
                        _load();
                      });
                    }
                  },
                ),
                const SizedBox(width: 8),
                _filterChip(
                  label: _condition.isEmpty
                      ? 'Condition'
                      : MarketplaceListing.conditionLabels[_condition] ?? _condition,
                  onTap: () async {
                    final chosen = await showModalBottomSheet<String>(
                      context: context,
                      builder: (ctx) => SafeArea(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            ..._conditions.map((c) => ListTile(
                                  title: Text(c.isEmpty
                                      ? 'All'
                                      : MarketplaceListing.conditionLabels[c] ?? c),
                                  onTap: () => Navigator.pop(ctx, c),
                                )),
                          ],
                        ),
                      ),
                    );
                    if (chosen != null) {
                      setState(() {
                        _condition = chosen;
                        _load();
                      });
                    }
                  },
                ),
                const SizedBox(width: 8),
                _filterChip(
                  label: _locationFilter?.isNotEmpty == true
                      ? 'Location ✓'
                      : 'Location',
                  onTap: () async {
                    final result = await Navigator.of(context).push<Map<String, dynamic>>(
                      MaterialPageRoute(
                        builder: (_) => MarketplaceLocationFilterScreen(
                          initialAddress: _locationFilter,
                        ),
                      ),
                    );
                    if (result != null && result['address'] != null) {
                      setState(() {
                        _locationFilter = result['address'] as String?;
                        _applyFilters();
                      });
                    }
                  },
                ),
                const SizedBox(width: 8),
                _filterChip(
                  label: _sortOrder == 'desc' ? 'Newest' : 'Oldest',
                  onTap: () {
                    setState(() {
                      _sortOrder = _sortOrder == 'desc' ? 'asc' : 'desc';
                      _load();
                    });
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip({required String label, required VoidCallback onTap}) {
    return Material(
      color: JcTimberTheme.darkBrown.withOpacity(0.08),
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: Text(
            label,
            style: JcTimberTheme.paragraphStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: JcTimberTheme.darkBrown,
            ),
          ),
        ),
      ),
    );
  }
}

class _ListingCard extends StatelessWidget {
  const _ListingCard({
    required this.listing,
    required this.onTap,
  });

  final MarketplaceListing listing;
  final VoidCallback onTap;

  Widget _listingImage(MarketplaceListing listing) {
    final url = ApiConfig.marketplaceListingImageUrl(listing.id, listing.imageUrl);
    return Image.network(
      url,
      fit: BoxFit.cover,
      loadingBuilder: (_, child, progress) {
        if (progress == null) return child;
        return Container(
          color: Colors.grey.shade200,
          child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
        );
      },
      errorBuilder: (_, __, ___) => _placeholder(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: _listingImage(listing),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          listing.title,
                          style: JcTimberTheme.headingStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: JcTimberTheme.darkBrown.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          listing.conditionLabel,
                          style: JcTimberTheme.paragraphStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    listing.category,
                    style: JcTimberTheme.paragraphStyle(
                      fontSize: 12,
                      color: JcTimberTheme.darkBrown70,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '₹${listing.price.toStringAsFixed(0)}',
                    style: JcTimberTheme.paragraphStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: JcTimberTheme.accentRed,
                    ),
                  ),
                  if (listing.location.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.location_on_outlined,
                            size: 14, color: JcTimberTheme.darkBrown70),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            listing.location,
                            style: JcTimberTheme.paragraphStyle(
                              fontSize: 12,
                              color: JcTimberTheme.darkBrown70,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholder() {
    return Container(
      color: Colors.grey.shade200,
      child: Center(
        child: Icon(Icons.image_outlined,
            size: 48, color: Colors.grey.shade400),
      ),
    );
  }
}
