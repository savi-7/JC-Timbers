/// Marketplace listing - matches backend MarketplaceListing schema.
class MarketplaceListing {
  final String id;
  final String title;
  final double price;
  final String category;
  final String condition;
  final String description;
  final String location;
  final LocationCoords? locationCoords;
  final String? imageUrl;
  final String status;
  final String? userId;
  final String? userName;
  final String? userEmail;
  final DateTime? createdAt;

  const MarketplaceListing({
    required this.id,
    required this.title,
    required this.price,
    required this.category,
    required this.condition,
    required this.description,
    required this.location,
    this.locationCoords,
    this.imageUrl,
    required this.status,
    this.userId,
    this.userName,
    this.userEmail,
    this.createdAt,
  });

  factory MarketplaceListing.fromJson(Map<String, dynamic> json) {
    final user = json['user'];
    String? userId;
    String? userName;
    String? userEmail;
    if (user is Map<String, dynamic>) {
      userId = user['_id']?.toString() ?? user['id']?.toString();
      userName = user['name'] as String?;
      userEmail = user['email'] as String?;
    }

    LocationCoords? coords;
    final lc = json['locationCoords'];
    if (lc is Map<String, dynamic>) {
      final lat = (lc['lat'] as num?)?.toDouble();
      final lon = (lc['lon'] as num?)?.toDouble();
      if (lat != null && lon != null) {
        coords = LocationCoords(lat: lat, lon: lon);
      }
    }

    return MarketplaceListing(
      id: (json['_id'] ?? json['id']).toString(),
      title: json['title'] as String? ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      category: json['category'] as String? ?? '',
      condition: json['condition'] as String? ?? '',
      description: json['description'] as String? ?? '',
      location: json['location'] as String? ?? '',
      locationCoords: coords,
      imageUrl: json['imageUrl'] as String?,
      status: json['status'] as String? ?? 'active',
      userId: userId,
      userName: userName,
      userEmail: userEmail,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  static const conditionLabels = {
    'new': 'New',
    'used-like-new': 'Used - Like New',
    'used-good': 'Used - Good',
    'fair': 'Fair',
  };

  String get conditionLabel =>
      conditionLabels[condition] ?? condition;
}

class LocationCoords {
  final double lat;
  final double lon;

  const LocationCoords({required this.lat, required this.lon});
}
