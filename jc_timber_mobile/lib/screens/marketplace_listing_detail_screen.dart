import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../auth/auth_service.dart';
import '../models/marketplace_listing.dart';
import '../services/marketplace_service.dart';
import '../config/api_config.dart';
import '../theme/jc_timber_theme.dart';

/// Listing detail: image, fields, map (flutter_map), seller info, Contact seller.
class MarketplaceListingDetailScreen extends StatefulWidget {
  const MarketplaceListingDetailScreen({
    super.key,
    required this.listingId,
  });

  final String listingId;

  @override
  State<MarketplaceListingDetailScreen> createState() =>
      _MarketplaceListingDetailScreenState();
}

class _MarketplaceListingDetailScreenState
    extends State<MarketplaceListingDetailScreen> {
  MarketplaceListing? _listing;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final auth = context.read<AuthService>();
    final service = MarketplaceService(auth);
    final listing = await service.getListingById(widget.listingId);
    if (!mounted) return;
    setState(() {
      _listing = listing;
      _loading = false;
      _error = listing == null ? 'Listing not found' : null;
    });
  }

  String get _imageUrl {
    if (_listing == null) return '';
    return ApiConfig.marketplaceListingImageUrl(
      _listing!.id,
      _listing!.imageUrl,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('Listing'),
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
      ),
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _listing == null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _error ?? 'Listing not found',
                            style: JcTimberTheme.paragraphStyle(fontSize: 16),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(),
                            child: const Text('Back'),
                          ),
                        ],
                      ),
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _load,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildImage(),
                          _buildDetails(),
                          if (_listing!.locationCoords != null ||
                              _listing!.location.isNotEmpty)
                            _buildMapSection(),
                          _buildSeller(),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }

  Widget _buildImage() {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: _imageUrl.isEmpty
          ? Container(
              color: Colors.grey.shade200,
              child: Center(
                child: Icon(
                  Icons.image_outlined,
                  size: 64,
                  color: Colors.grey.shade400,
                ),
              ),
            )
          : Image.network(
              _imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: Colors.grey.shade200,
                child: Center(
                  child: Icon(
                    Icons.broken_image_outlined,
                    size: 48,
                    color: Colors.grey.shade400,
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildDetails() {
    final l = _listing!;
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: JcTimberTheme.darkBrown.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  l.conditionLabel,
                  style: JcTimberTheme.paragraphStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                l.category,
                style: JcTimberTheme.paragraphStyle(
                  fontSize: 13,
                  color: JcTimberTheme.darkBrown70,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            l.title,
            style: JcTimberTheme.headingStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '₹${l.price.toStringAsFixed(0)}',
            style: JcTimberTheme.paragraphStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: JcTimberTheme.accentRed,
            ),
          ),
          if (l.location.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.location_on_outlined,
                    size: 18, color: JcTimberTheme.darkBrown70),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    l.location,
                    style: JcTimberTheme.paragraphStyle(
                      fontSize: 14,
                      color: JcTimberTheme.darkBrown70,
                    ),
                  ),
                ),
              ],
            ),
          ],
          if (l.description.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              'Description',
              style: JcTimberTheme.headingStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              l.description,
              style: JcTimberTheme.paragraphStyle(
                fontSize: 14,
                color: JcTimberTheme.darkBrown70,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMapSection() {
    final l = _listing!;
    LatLng? center;
    if (l.locationCoords != null) {
      center = LatLng(l.locationCoords!.lat, l.locationCoords!.lon);
    }
    if (center == null) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Location',
            style: JcTimberTheme.headingStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              height: 200,
              child: FlutterMap(
                options: MapOptions(
                  initialCenter: center,
                  initialZoom: 14,
                  interactionOptions: const InteractionOptions(
                    flags: InteractiveFlag.pinchZoom | InteractiveFlag.drag,
                  ),
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.example.jc_timber_mobile',
                  ),
                  MarkerLayer(
                    markers: [
                      Marker(
                        point: center,
                        width: 40,
                        height: 40,
                        child: Icon(
                          Icons.location_on,
                          color: JcTimberTheme.accentRed,
                          size: 40,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSeller() {
    final l = _listing!;
    final hasContact = (l.userEmail != null && l.userEmail!.isNotEmpty) ||
        (l.userName != null && l.userName!.isNotEmpty);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: JcTimberTheme.gray200),
          boxShadow: [
            BoxShadow(
              color: JcTimberTheme.darkBrown.withOpacity(0.06),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Seller',
              style: JcTimberTheme.headingStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            if (l.userName != null && l.userName!.isNotEmpty)
              Text(
                l.userName!,
                style: JcTimberTheme.paragraphStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
            if (l.userEmail != null && l.userEmail!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                l.userEmail!,
                style: JcTimberTheme.paragraphStyle(
                  fontSize: 14,
                  color: JcTimberTheme.darkBrown70,
                ),
              ),
            ],
            if (hasContact) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: () => _contactSeller(),
                  icon: const Icon(Icons.email_outlined, size: 20),
                  label: const Text('Contact seller'),
                  style: FilledButton.styleFrom(
                    backgroundColor: JcTimberTheme.darkBrown,
                    foregroundColor: JcTimberTheme.cream,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _contactSeller() async {
    final email = _listing?.userEmail;
    if (email == null || email.isEmpty) return;
    final uri = Uri.parse('mailto:$email');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open email app')),
      );
    }
  }
}
