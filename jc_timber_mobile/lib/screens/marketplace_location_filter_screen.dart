import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../services/nominatim_service.dart';
import '../theme/jc_timber_theme.dart';

/// Location filter: map + Nominatim search; returns selected address for client-side filter.
class MarketplaceLocationFilterScreen extends StatefulWidget {
  const MarketplaceLocationFilterScreen({
    super.key,
    this.initialAddress,
  });

  final String? initialAddress;

  @override
  State<MarketplaceLocationFilterScreen> createState() =>
      _MarketplaceLocationFilterScreenState();
}

class _MarketplaceLocationFilterScreenState
    extends State<MarketplaceLocationFilterScreen> {
  final _searchController = TextEditingController();
  double _lat = 12.9716;
  double _lon = 77.5946;
  String _selectedAddress = '';
  bool _searching = false;
  List<({String displayName, double lat, double lon})> _results = [];
  bool _showResults = false;
  final _mapController = MapController();

  @override
  void initState() {
    super.initState();
    if (widget.initialAddress != null && widget.initialAddress!.isNotEmpty) {
      _selectedAddress = widget.initialAddress ?? '';
      _searchController.text = widget.initialAddress ?? '';
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final q = _searchController.text.trim();
    if (q.isEmpty) return;
    setState(() {
      _searching = true;
      _showResults = true;
      _results = [];
    });
    final list = await NominatimService.search(q);
    if (!mounted) return;
    setState(() {
      _results = list;
      _searching = false;
    });
  }

  void _select(String displayName, double lat, double lon) {
    setState(() {
      _selectedAddress = displayName;
      _lat = lat;
      _lon = lon;
      _showResults = false;
    });
    _mapController.move(LatLng(lat, lon), 14);
  }

  void _apply() {
    Navigator.of(context).pop(<String, dynamic>{
      'address': _selectedAddress.isEmpty ? null : _selectedAddress,
      'lat': _lat,
      'lon': _lon,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('Filter by location'),
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
        actions: [
          TextButton(
            onPressed: _selectedAddress.isNotEmpty ? _apply : null,
            child: const Text('Apply'),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search area (e.g. city name)',
                  prefixIcon: const Icon(Icons.search),
                  border: const OutlineInputBorder(),
                  suffixIcon: _searching
                      ? const Padding(
                          padding: EdgeInsets.all(12),
                          child: SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      : IconButton(
                          icon: const Icon(Icons.search),
                          onPressed: _search,
                        ),
                ),
                onSubmitted: (_) => _search(),
              ),
            ),
            if (_showResults && _results.isNotEmpty)
              Expanded(
                flex: 0,
                child: Container(
                  margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  constraints: const BoxConstraints(maxHeight: 200),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: JcTimberTheme.gray200),
                  ),
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _results.length,
                    itemBuilder: (context, i) {
                      final r = _results[i];
                      return ListTile(
                        title: Text(
                          r.displayName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: JcTimberTheme.paragraphStyle(fontSize: 13),
                        ),
                        onTap: () => _select(r.displayName, r.lat, r.lon),
                      );
                    },
                  ),
                ),
              ),
            if (_selectedAddress.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Icon(Icons.location_on, size: 18, color: JcTimberTheme.accentRed),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _selectedAddress,
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 13,
                          color: JcTimberTheme.darkBrown70,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 8),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
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
                        setState(() => _selectedAddress = addr);
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
            ),
          ],
        ),
      ),
    );
  }
}
