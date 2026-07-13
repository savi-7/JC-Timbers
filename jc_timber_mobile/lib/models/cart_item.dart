import 'product.dart';

class CartItem {
  final String productId;
  final String name;
  final double price;
  final int quantity;
  final double subtotal;
  final Product? product;

  const CartItem({
    required this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.subtotal,
    this.product,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    final productJson = json['product'] as Map<String, dynamic>?;
    return CartItem(
      productId: (json['productId'] ?? productJson?['_id'] ?? '').toString(),
      name: json['name'] as String? ??
          productJson?['name'] as String? ??
          'Product',
      price: (json['price'] as num? ??
              productJson?['price'] as num? ??
              0)
          .toDouble(),
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      subtotal:
          (json['subtotal'] as num? ?? 0).toDouble(),
      product: productJson != null ? Product.fromJson(productJson) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'name': name,
      'price': price,
      'quantity': quantity,
      'subtotal': subtotal,
      if (product != null) 'product': product!.toJson(),
    };
  }
}

