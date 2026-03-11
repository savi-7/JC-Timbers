import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../auth/auth_service.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import '../theme/jc_timber_theme.dart';

class RequestQuoteScreen extends StatefulWidget {
  final Product product;

  const RequestQuoteScreen({super.key, required this.product});

  @override
  State<RequestQuoteScreen> createState() => _RequestQuoteScreenState();
}

class _RequestQuoteScreenState extends State<RequestQuoteScreen> {
  final _messageController = TextEditingController();
  final _dimensionsController = TextEditingController();
  String? _selectedWoodType;
  bool _isSubmitting = false;

  late final ApiService _apiService;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthService>();
    _apiService = ApiService(auth);
  }

  @override
  void dispose() {
    _messageController.dispose();
    _dimensionsController.dispose();
    super.dispose();
  }

  Future<void> _submitRequest() async {
    if (_messageController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please provide details about your request.')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final payload = {
        'productId': widget.product.id,
        'message': _messageController.text.trim(),
        'selectedOptions': {
          if (_selectedWoodType != null) 'woodType': _selectedWoodType,
          if (_dimensionsController.text.trim().isNotEmpty) 'dimensions': _dimensionsController.text.trim(),
        }
      };

      await _apiService.post('/enquiries', payload);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Custom request submitted successfully!'),
          backgroundColor: Colors.green,
        ),
      );

      // Navigate back
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to submit request: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final woodTypes = widget.product.customizationOptions?['woodTypes'] as List<dynamic>?;
    final List<String> availableWoods = woodTypes?.map((e) => e.toString()).toList() ?? [];

    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('Request Custom Quote'),
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Info Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: JcTimberTheme.gray200),
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: widget.product.primaryImageUrl != null
                        ? Image.network(
                            widget.product.primaryImageUrl!,
                            width: 80,
                            height: 80,
                            fit: BoxFit.cover,
                          )
                        : Container(
                            width: 80,
                            height: 80,
                            color: Colors.grey.shade200,
                            child: const Icon(Icons.chair_outlined),
                          ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.product.name,
                          style: JcTimberTheme.headingStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Base Price: ₹${widget.product.price.toStringAsFixed(0)}',
                          style: JcTimberTheme.paragraphStyle(
                            fontSize: 14,
                            color: JcTimberTheme.accentRed,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 32),

            if (availableWoods.isNotEmpty) ...[
              Text(
                'Preferred Wood Type',
                style: JcTimberTheme.headingStyle(fontSize: 16),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: JcTimberTheme.gray200),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedWoodType,
                    hint: const Text('Select Wood Type'),
                    items: availableWoods.map((wood) {
                      return DropdownMenuItem<String>(
                        value: wood,
                        child: Text(wood),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedWoodType = value;
                      });
                    },
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],

            Text(
              'Custom Dimensions (Optional)',
              style: JcTimberTheme.headingStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _dimensionsController,
              decoration: InputDecoration(
                hintText: 'e.g. 120cm length x 60cm width',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: JcTimberTheme.gray200),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: JcTimberTheme.gray200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: JcTimberTheme.darkBrown),
                ),
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'Details & Specific Requirements *',
              style: JcTimberTheme.headingStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _messageController,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: 'Describe any specific design changes, finishes, or details...',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: JcTimberTheme.gray200),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: JcTimberTheme.gray200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: JcTimberTheme.darkBrown),
                ),
              ),
            ),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitRequest,
                style: ElevatedButton.styleFrom(
                  backgroundColor: JcTimberTheme.darkBrown,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'SUBMIT REQUEST',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
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
