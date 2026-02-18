import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../models/address.dart';
import '../services/address_service.dart';
import '../theme/jc_timber_theme.dart';
import 'add_edit_address_screen.dart';

/// Address Management screen - list addresses, add/edit/delete/set default.
/// Matches MERN "Address Management" / addresses page.
class AddressesScreen extends StatefulWidget {
  const AddressesScreen({super.key});

  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  List<Address> _addresses = [];
  bool _loading = true;
  String? _error;

  AddressService get _addressService =>
      AddressService(context.read<AuthService>());

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await _addressService.getAddresses();
      if (mounted) {
        setState(() {
          _addresses = list;
          _loading = false;
          _error = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = e.toString();
        });
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _deleteAddress(Address address) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete address'),
        content: Text(
          'Delete ${address.flatHouseCompany}, ${address.city}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirm != true || !mounted) return;
    try {
      await _addressService.deleteAddress(address.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Address deleted')),
        );
        _load();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
        title: const Text('Manage Addresses'),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _error!,
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: JcTimberTheme.errorText),
                            ),
                            const SizedBox(height: 16),
                            TextButton(
                              onPressed: _load,
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : _addresses.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.location_off,
                                  size: 64,
                                  color: Colors.grey.shade400,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'No addresses yet',
                                  style: JcTimberTheme.paragraphStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Add a delivery address',
                                  style: JcTimberTheme.paragraphStyle(
                                    fontSize: 14,
                                    color: JcTimberTheme.darkBrown70,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _addresses.length,
                          itemBuilder: (context, index) {
                            final a = _addresses[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        if (a.isDefault)
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 8, vertical: 4),
                                            margin: const EdgeInsets.only(right: 8),
                                            decoration: BoxDecoration(
                                              color: Colors.green.shade100,
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              'Default',
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                                color: Colors.green.shade800,
                                              ),
                                            ),
                                          ),
                                        Expanded(
                                          child: Text(
                                            a.flatHouseCompany,
                                            style: JcTimberTheme.paragraphStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.edit_outlined),
                                          onPressed: () async {
                                            await Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (_) =>
                                                    AddEditAddressScreen(
                                                  address: a,
                                                ),
                                              ),
                                            );
                                            _load();
                                          },
                                        ),
                                        IconButton(
                                          icon: Icon(
                                            Icons.delete_outline,
                                            color: Colors.red.shade400,
                                          ),
                                          onPressed: () => _deleteAddress(a),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      '${a.address}, ${a.city}, ${a.state} - ${a.pincode}',
                                      style: JcTimberTheme.paragraphStyle(
                                        fontSize: 14,
                                        color: JcTimberTheme.darkBrown70,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${a.fullName} • ${a.mobileNumber}',
                                      style: JcTimberTheme.paragraphStyle(
                                        fontSize: 13,
                                        color: JcTimberTheme.darkBrown70,
                                      ),
                                    ),
                                    if (!a.isDefault) ...[
                                      const SizedBox(height: 8),
                                      TextButton(
                                        onPressed: () async {
                                          try {
                                            await _addressService
                                                .setDefaultAddress(a.id);
                                            if (mounted) {
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(
                                                const SnackBar(
                                                    content: Text(
                                                        'Default address updated')),
                                              );
                                              _load();
                                            }
                                          } catch (e) {
                                            if (mounted) {
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(
                                                SnackBar(
                                                    content: Text(e.toString())),
                                              );
                                            }
                                          }
                                        },
                                        child: const Text('Set as default'),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
      ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => const AddEditAddressScreen(),
            ),
          );
          _load();
        },
        backgroundColor: JcTimberTheme.darkBrown,
        icon: const Icon(Icons.add),
        label: const Text('Add address'),
      ),
    );
  }
}
