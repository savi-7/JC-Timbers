import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../models/address.dart';
import '../services/address_service.dart';
import '../theme/jc_timber_theme.dart';

/// Add or edit address form. Matches backend address fields.
class AddEditAddressScreen extends StatefulWidget {
  final Address? address;

  const AddEditAddressScreen({super.key, this.address});

  @override
  State<AddEditAddressScreen> createState() => _AddEditAddressScreenState();
}

class _AddEditAddressScreenState extends State<AddEditAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _fullNameController;
  late TextEditingController _mobileController;
  late TextEditingController _pincodeController;
  late TextEditingController _stateController;
  late TextEditingController _addressController;
  late TextEditingController _flatHouseController;
  late TextEditingController _cityController;
  late TextEditingController _landmarkController;
  bool _isDefault = false;
  String _addressType = 'Home';
  bool _saving = false;
  String? _error;

  bool get _isEdit => widget.address != null;

  @override
  void initState() {
    super.initState();
    final a = widget.address;
    _fullNameController = TextEditingController(text: a?.fullName ?? '');
    _mobileController = TextEditingController(text: a?.mobileNumber ?? '');
    _pincodeController = TextEditingController(text: a?.pincode ?? '');
    _stateController = TextEditingController(text: a?.state ?? '');
    _addressController = TextEditingController(text: a?.address ?? '');
    _flatHouseController = TextEditingController(text: a?.flatHouseCompany ?? '');
    _cityController = TextEditingController(text: a?.city ?? '');
    _landmarkController = TextEditingController(text: a?.landmark ?? '');
    _isDefault = a?.isDefault ?? false;
    _addressType = a?.addressType ?? 'Home';
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _mobileController.dispose();
    _pincodeController.dispose();
    _stateController.dispose();
    _addressController.dispose();
    _flatHouseController.dispose();
    _cityController.dispose();
    _landmarkController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    final fullName = _fullNameController.text.trim();
    final mobile = _mobileController.text.trim().replaceAll(RegExp(r'\D'), '');
    final pincode = _pincodeController.text.trim().replaceAll(RegExp(r'\D'), '');
    final state = _stateController.text.trim();
    final address = _addressController.text.trim();
    final flatHouse = _flatHouseController.text.trim();
    final city = _cityController.text.trim();
    final landmark = _landmarkController.text.trim();

    if (mobile.length != 10) {
      setState(() => _error = 'Mobile number must be 10 digits');
      return;
    }
    if (pincode.length != 6) {
      setState(() => _error = 'Pincode must be 6 digits');
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    final addr = Address(
      id: widget.address?.id ?? '',
      fullName: fullName,
      mobileNumber: mobile,
      pincode: pincode,
      state: state,
      address: address,
      flatHouseCompany: flatHouse,
      city: city,
      landmark: landmark,
      isDefault: _isDefault,
      addressType: _addressType,
    );

    try {
      final service = AddressService(context.read<AuthService>());
      if (_isEdit) {
        await service.updateAddress(widget.address!.id, addr);
      } else {
        await service.addAddress(addr);
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isEdit ? 'Address updated' : 'Address added'),
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        setState(() {
          _saving = false;
          _error = e.toString();
        });
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
        title: Text(_isEdit ? 'Edit address' : 'Add address'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _field('Full name', _fullNameController, required: true),
                const SizedBox(height: 16),
                _field('Mobile number (10 digits)', _mobileController,
                    keyboardType: TextInputType.phone, required: true),
                const SizedBox(height: 16),
                _field('Pincode (6 digits)', _pincodeController,
                    keyboardType: TextInputType.number, required: true),
                const SizedBox(height: 16),
                _field('State', _stateController, required: true),
                const SizedBox(height: 16),
                _field('Address (street, area)', _addressController,
                    maxLines: 2, required: true),
                const SizedBox(height: 16),
                _field('Flat / House no. / Building', _flatHouseController,
                    required: true),
                const SizedBox(height: 16),
                _field('City', _cityController, required: true),
                const SizedBox(height: 16),
                _field('Landmark (optional)', _landmarkController),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: _addressType,
                  decoration: const InputDecoration(
                    labelText: 'Address type',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'Home', child: Text('Home')),
                    DropdownMenuItem(value: 'Office', child: Text('Office')),
                    DropdownMenuItem(value: 'Other', child: Text('Other')),
                  ],
                  onChanged: (v) => setState(() => _addressType = v ?? 'Home'),
                ),
                const SizedBox(height: 16),
                CheckboxListTile(
                  value: _isDefault,
                  onChanged: (v) => setState(() => _isDefault = v ?? false),
                  title: Text(
                    'Set as default address',
                    style: JcTimberTheme.paragraphStyle(fontSize: 14),
                  ),
                  controlAffinity: ListTileControlAffinity.leading,
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: JcTimberTheme.errorBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: JcTimberTheme.errorBorder),
                    ),
                    child: Text(
                      _error!,
                      style: const TextStyle(
                        color: JcTimberTheme.errorText,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _saving ? null : _save,
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
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: JcTimberTheme.cream,
                          ),
                        )
                      : Text(_isEdit ? 'Update address' : 'Add address'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _field(String label, TextEditingController controller,
      {bool required = false,
      TextInputType? keyboardType,
      int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label + (required ? ' *' : ''),
          style: JcTimberTheme.paragraphStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: JcTimberTheme.darkBrown70,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: label,
            border: const OutlineInputBorder(),
            filled: true,
            fillColor: Colors.white,
          ),
          validator: required
              ? (v) {
                  if (v == null || v.trim().isEmpty) return 'Required';
                  return null;
                }
              : null,
        ),
      ],
    );
  }
}
