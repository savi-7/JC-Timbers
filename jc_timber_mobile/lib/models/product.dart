import 'dart:convert';

class Product {
  final String id;
  final String name;
  final String category;
  final String? subcategory;
  final int quantity;
  final String unit;
  final double price;
  final String? size;
  final String? description;
  final List<ProductImage> images;
  final Map<String, dynamic> attributes;
  final double rating;
  final int reviewCount;
  final String? featuredType;
  final String? material;
  final String? color;
  final String? brand;
  final String? weight;

  const Product({
    required this.id,
    required this.name,
    required this.category,
    this.subcategory,
    required this.quantity,
    required this.unit,
    required this.price,
    this.size,
    this.description,
    required this.images,
    required this.attributes,
    this.rating = 0,
    this.reviewCount = 0,
    this.featuredType,
    this.material,
    this.color,
    this.brand,
    this.weight,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: (json['_id'] ?? json['id']).toString(),
      name: json['name'] as String? ?? '',
      category: json['category'] as String? ?? '',
      subcategory: json['subcategory'] as String?,
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      unit: json['unit'] as String? ?? 'pieces',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      size: json['size'] as String?,
      description: json['description'] as String?,
      images: (json['images'] as List<dynamic>? ?? [])
          .map((e) => ProductImage.fromJson(e as Map<String, dynamic>))
          .toList(),
      attributes:
          (json['attributes'] as Map<String, dynamic>? ?? <String, dynamic>{}),
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      featuredType: json['featuredType'] as String?,
      material: json['material'] as String?,
      color: json['color'] as String?,
      brand: json['brand'] as String?,
      weight: json['weight'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'subcategory': subcategory,
      'quantity': quantity,
      'unit': unit,
      'price': price,
      'size': size,
      'description': description,
      'images': images.map((e) => e.toJson()).toList(),
      'attributes': attributes,
      'rating': rating,
      'reviewCount': reviewCount,
      'featuredType': featuredType,
      'material': material,
      'color': color,
      'brand': brand,
      'weight': weight,
    };
  }

  String? get primaryImageUrl {
    if (images.isEmpty) return null;
    final img = images.first;
    if (img.url != null && img.url!.isNotEmpty) return img.url;
    if (img.data != null && img.data!.isNotEmpty) {
      // Already a full data URL?
      if (img.data!.startsWith('data:')) return img.data;
      // Fallback: assume base64 jpeg
      return 'data:image/jpeg;base64,${img.data}';
    }
    return null;
  }

  String? getImageUrl(ProductImage image) {
    if (image.url != null && image.url!.isNotEmpty) return image.url;
    if (image.data != null && image.data!.isNotEmpty) {
      if (image.data!.startsWith('data:')) return image.data;
      if (image.data!.startsWith('http')) return image.data;
      return 'data:${image.contentType};base64,${image.data}';
    }
    return null;
  }
}

class ProductImage {
  final String? data;
  final String? url;
  final String contentType;
  final String filename;

  const ProductImage({
    this.data,
    this.url,
    required this.contentType,
    required this.filename,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      data: json['data'] as String?,
      url: json['url'] as String?,
      contentType: json['contentType'] as String? ?? 'image/jpeg',
      filename: json['filename'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'data': data,
      'url': url,
      'contentType': contentType,
      'filename': filename,
    };
  }
}

