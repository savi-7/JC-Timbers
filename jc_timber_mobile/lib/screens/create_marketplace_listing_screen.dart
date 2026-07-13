import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';

import '../auth/auth_service.dart';
import '../models/marketplace_listing.dart';
import '../services/marketplace_service.dart';
import '../services/nominatim_service.dart';
import '../theme/jc_timber_theme.dart';

/// Create listing: form (title, price, category, condition, description), location + map + Nominatim, single image; POST to backend.
class CreateMarketplaceListingScreen extends StatefulWidget {
  const CreateMarketplaceListingScreen({super.key});

  @override
  State<CreateMarketplaceListingScreen> createState() =>
      _CreateMarketplaceListingScreenState();
}

class _CreateMarketplaceListingScreenState
    extends State<CreateMarketplaceListingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _locationSearchController = TextEditingController();

  String _category = 'Sofa';
  String _condition = 'used-good';
  double _lat = 12.9716;
  double _lon = 77.5946;
  String? _imagePath;
  bool _saving = false;
  String? _saveError;
  bool _searchingLocation = false;
  List<({String displayName, double lat, double lon})> _searchResults = [];
  bool _showSearchResults = false;
  final _mapController = MapController();

  static const _categories = [
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
  static const _conditions = ['new', 'used-like-new', 'used-good', 'fair'];

  @override
  void dispose() {
    _titleController.dispose();
    _priceController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    _locationSearchController.dispose();
    super.dispose();
  }

  Future<void> _searchLocation() async {
    final q = _locationSearchController.text.trim();
    if (q.isEmpty) return;
    setState(() {
      _searchingLocation = true;
      _showSearchResults = true;
      _searchResults = [];
    });
    final results = await NominatimService.search(q);
    if (!mounted) return;
    setState(() {
      _searchResults = results;
      _searchingLocation = false;
    });
  }

  void _pickSearchResult(String displayName, double lat, double lon) {
    _locationController.text = displayName;
    setState(() {
      _lat = lat;
      _lon = lon;
      _showSearchResults = false;
      _searchResults = [];
      _locationSearchController.clear();
    });
    _mapController.move(LatLng(lat, lon), 14);
  }

  Future<void> _pickImage() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Camera'),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Gallery'),
              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;
    final picker = ImagePicker();
    final x = await picker.pickImage(
      source: source,
      maxWidth: 1920,
      imageQuality: 85,
    );
    if (x != null && mounted) {
      setState(() => _imagePath = x.path);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final title = _titleController.text.trim();
    final price = double.tryParse(_priceController.text.trim());
    if (price == null || price <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid price')),
      );
      return;
    }
    if (_imagePath == null || _imagePath!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add a photo')),
      );
      return;
    }
    final location = _locationController.text.trim();
    if (location.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please set a location (search or move map)')),
      );
      return;
    }

    setState(() {
      _saving = true;
      _saveError = null;
    });
    final auth = context.read<AuthService>();
    final service = MarketplaceService(auth);
    final result = await service.createListing(
      title: title,
      price: price,
      category: _category,
      condition: _condition,
      description: _descriptionController.text.trim(),
      location: location,
      lat: _lat,
      lon: _lon,
      imagePath: _imagePath!,
    );
    if (!mounted) return;
    setState(() => _saving = false);
    if (result.success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result.message ?? 'Listing created')),
      );
      Navigator.of(context).pop();
    } else {
      setState(() => _saveError = result.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('Sell item'),
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  hintText: 'e.g. Solid wood study table',
                  border: OutlineInputBorder(),
                ),
                validator: (v) =>
                    v?.trim().isEmpty ?? true ? 'Title required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _priceController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Price (₹)',
                  hintText: '0',
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  final n = double.tryParse(v?.trim() ?? '');
                  if (n == null || n <= 0) return 'Enter a valid price';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _category,
                decoration: const InputDecoration(
                  labelText: 'Category',
                  border: OutlineInputBorder(),
                ),
                items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) => setState(() => _category = v ?? _category),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _condition,
                decoration: const InputDecoration(
                  labelText: 'Condition',
                  border: OutlineInputBorder(),
                ),
                items: _conditions
                    .map((c) => DropdownMenuItem(
                          value: c,
                          child: Text(MarketplaceListing.conditionLabels[c] ?? c),
                        ))
                    .toList(),
                onChanged: (v) => setState(() => _condition = v ?? _condition),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  hintText: 'Describe your item...',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Location',
                style: JcTimberTheme.headingStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _locationSearchController,
                decoration: InputDecoration(
                  hintText: 'Search area (e.g. Bangalore, India)',
                  prefixIcon: const Icon(Icons.search),
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    icon: _searchingLocation
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.search),
                    onPressed: _searchingLocation ? null : _searchLocation,
                  ),
                ),
                onFieldSubmitted: (_) => _searchLocation(),
              ),
              if (_showSearchResults && _searchResults.isNotEmpty) ...[
                const SizedBox(height: 8),
                ..._searchResults.map((r) => ListTile(
                      title: Text(
                        r.displayName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: JcTimberTheme.paragraphStyle(fontSize: 13),
                      ),
                      onTap: () => _pickSearchResult(
                        r.displayName,
                        r.lat,
                        r.lon,
                      ),
                    )),
              ],
              const SizedBox(height: 8),
              TextFormField(
                controller: _locationController,
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: 'Selected address',
                  hintText: 'Search above or move map marker',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  height: 220,
                  child: FlutterMap(
                    mapController: _mapController,
                    options: MapOptions(
                      initialCenter: LatLng(_lat, _lon),
                      initialZoom: 14,
                      onTap: (_, point) async {
                        setState(() {
                          _lat = point.latitude;
                          _lon = point.longitude;
                        });
                        final addr =
                            await NominatimService.reverse(_lat, _lon);
                        if (mounted && addr != null) {
                          setState(() => _locationController.text = addr);
                        }
                      },
                      interactionOptions: const InteractionOptions(
                        flags: InteractiveFlag.pinchZoom | InteractiveFlag.drag,
                      ),
                    ),
                    children: [
                      TileLayer(
                        urlTemplate:
                            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.example.jc_timber_mobile',
                      ),
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: LatLng(_lat, _lon),
                            width: 40,
                            height: 40,
                            child: GestureDetector(
                              onLongPress: () {
                                // Optional: make marker draggable via drag event if needed
                              },
                              child: Icon(
                                Icons.location_on,
                                color: JcTimberTheme.accentRed,
                                size: 40,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Photo',
                style: JcTimberTheme.headingStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              InkWell(
                onTap: _pickImage,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  height: 140,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: JcTimberTheme.gray300),
                  ),
                  child: _imagePath != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.file(
                            File(_imagePath!),
                            fit: BoxFit.cover,
                            width: double.infinity,
                          ),
                        )
                      : Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.add_photo_alternate_outlined,
                                size: 48,
                                color: Colors.grey.shade600,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Tap to add photo',
                                style: JcTimberTheme.paragraphStyle(
                                  fontSize: 14,
                                  color: JcTimberTheme.darkBrown70,
                                ),
                              ),
                            ],
                          ),
                        ),
                ),
              ),
              if (_saveError != null) ...[
                const SizedBox(height: 12),
                Text(
                  _saveError!,
                  style: JcTimberTheme.paragraphStyle(
                    fontSize: 13,
                    color: JcTimberTheme.errorText,
                  ),
                ),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _saving ? null : _submit,
                style: FilledButton.styleFrom(
                  backgroundColor: JcTimberTheme.darkBrown,
                  foregroundColor: JcTimberTheme.cream,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _saving
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Create listing'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
