import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../services/timber_service.dart';
import '../models/service_enquiry.dart';
import '../models/availability_result.dart';
import '../theme/jc_timber_theme.dart';
import 'my_enquiries_screen.dart';

const _workTypes = ['Planing', 'Resawing', 'Debarking', 'Sawing', 'Other'];
const _woodTypes = [
  'Teak', 'Rosewood', 'Mahogany', 'Pine', 'Oak', 'Maple',
  'Cedar', 'Birch', 'Walnut', 'Cherry', 'Other'
];
const _ratePerCubicFoot = 120.0; // ₹120 per cubic foot (matches MERN)
const _ratePerHour = 1200.0;

/// Timber Processing Booking - exact UI/UX match to MERN TimberProcessingForm.
/// Uses same backend APIs: /api/services/enquiries, /api/services/schedule/available/:date
class TimberBookingScreen extends StatefulWidget {
  const TimberBookingScreen({super.key});

  @override
  State<TimberBookingScreen> createState() => _TimberBookingScreenState();
}

class _TimberBookingScreenState extends State<TimberBookingScreen> {
  final _formKey = GlobalKey<FormState>();
  String _workType = _workTypes[0];
  final _logItems = <_LogItemState>[];
  String _requestedDate = '';
  String _requestedTime = '09:00';
  String _name = '';
  String _phoneNumber = '';
  String _notes = '';
  bool _loading = false;
  bool _checkingAvailability = false;
  String? _error;
  AvailabilityResult? _availability;

  @override
  void initState() {
    super.initState();
    _logItems.add(_LogItemState(woodType: '', numberOfLogs: 1, thickness: 0, width: 0, length: 0, cubicFeet: 0));
  }

  double _calculateCubicFeet(double t, double w, double l) {
    if (t > 0 && w > 0 && l > 0) return (t * w * l) / 144;
    return 0;
  }

  double get _totalCubicFeet => _logItems.fold(0.0, (s, i) => s + i.cubicFeet);
  double get _estimatedCost => _totalCubicFeet * _ratePerCubicFoot;

  Future<void> _checkAvailability(String date) async {
    if (date.isEmpty) {
      setState(() => _availability = null);
      return;
    }
    setState(() => _checkingAvailability = true);
    final auth = context.read<AuthService>();
    final result = await TimberService(auth).checkAvailability(date, duration: 120);
    if (mounted) {
      setState(() {
        _availability = result;
        _checkingAvailability = false;
        if (result.isHoliday) _requestedTime = '';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    _name = auth.user?.name ?? _name;
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Timber Processing Request',
          style: JcTimberTheme.paragraphStyle(
            fontSize: 18,
            fontWeight: FontWeight.w500,
            color: JcTimberTheme.cream,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header - MERN: text-center mb-8
            Text(
              'Timber Cutting & Processing Request',
              style: JcTimberTheme.headingStyle(fontSize: 28),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Submit your wood processing service request with details',
              style: JcTimberTheme.paragraphStyle(fontSize: 14, color: JcTimberTheme.gray600),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            // Form - MERN: bg-white rounded-xl shadow-sm border border-gray-200
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: JcTimberTheme.gray200),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Processing Category - MERN: label + select
                    _mernLabel('Processing Category', required: true),
                    const SizedBox(height: 8),
                    _buildDropdown(
                      value: _workType,
                      items: _workTypes,
                      onChanged: (v) => setState(() => _workType = v ?? _workTypes[0]),
                    ),
                    const SizedBox(height: 24),
                    // Wood Log Entries - MERN: border-t border-gray-200 pt-6
                    _sectionDivider(),
                    const SizedBox(height: 24),
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final isNarrow = constraints.maxWidth < 360;
                        final title = Text(
                          'Wood Log Entries',
                          style: JcTimberTheme.paragraphStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w500,
                          ),
                        );
                        final addButton = _addLogButton();

                        if (isNarrow) {
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              title,
                              const SizedBox(height: 8),
                              Align(
                                alignment: Alignment.centerLeft,
                                child: addButton,
                              ),
                            ],
                          );
                        }

                        return Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Expanded(child: title),
                            const SizedBox(width: 12),
                            addButton,
                          ],
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    ...List.generate(_logItems.length, (i) => _LogEntryCard(
                      item: _logItems[i],
                      index: i,
                      onChanged: (item) => setState(() => _logItems[i] = item),
                      onRemove: _logItems.length > 1 ? () => setState(() => _logItems.removeAt(i)) : null,
                      calculateCubicFeet: _calculateCubicFeet,
                    )),
                    // Total Cubic Feet - MERN: bg-dark-brown/5 border-dark-brown/20
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: JcTimberTheme.darkBrown.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: JcTimberTheme.darkBrown20),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              'Total Cubic Feet:',
                              style: JcTimberTheme.paragraphStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          Text(
                            '${_totalCubicFeet.toStringAsFixed(2)} cu ft',
                            style: JcTimberTheme.paragraphStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Estimated Cost - MERN: bg-accent-red/10 border-accent-red/30
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: JcTimberTheme.accentRed.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: JcTimberTheme.accentRed30),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Estimated Service Cost', style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                          const SizedBox(height: 4),
                          Text('₹${_formatIndian(_estimatedCost)}', style: JcTimberTheme.paragraphStyle(fontSize: 24, fontWeight: FontWeight.bold, color: JcTimberTheme.accentRed)),
                          const SizedBox(height: 4),
                          Text('Pricing is ₹${_formatIndian(_ratePerCubicFoot)} per cubic foot (10 cubic feet = ₹${_formatIndian(_ratePerHour)}).', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.gray600)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Personal Details - MERN: border-t pt-6
                    _sectionDivider(),
                    const SizedBox(height: 24),
                    Text('Personal Details', style: JcTimberTheme.paragraphStyle(fontSize: 18, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 16),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _mernLabel('Full Name', required: true),
                              const SizedBox(height: 8),
                              _buildTextInput(
                                value: _name,
                                hint: 'Enter your full name',
                                onChanged: (v) => _name = v ?? '',
                                validator: (v) => (v == null || v.trim().length < 2) ? 'Please enter your name' : null,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _mernLabel('Phone Number', required: true),
                              const SizedBox(height: 8),
                              _buildTextInput(
                                value: _phoneNumber,
                                hint: 'e.g., 9876543210',
                                keyboardType: TextInputType.phone,
                                onChanged: (v) => _phoneNumber = (v ?? '').replaceAll(RegExp(r'\D'), '').substring(0, 10.clamp(0, 10)),
                                validator: (v) => (v == null || v.length < 10) ? 'Please enter a valid phone number' : null,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    // Preferred Schedule - MERN: border-t pt-6
                    _sectionDivider(),
                    const SizedBox(height: 24),
                    Text('Preferred Schedule', style: JcTimberTheme.paragraphStyle(fontSize: 18, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 16),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _mernLabel('Requested Date', required: true),
                              const SizedBox(height: 8),
                              _buildDatePicker(),
                              if (_availability?.isHoliday == true && _availability?.holidayName != null) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.orange.shade50,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: Colors.orange.shade200),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('🎉 Holiday: ${_availability!.holidayName}', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.orange.shade800)),
                                      const SizedBox(height: 4),
                                      Text('No services are available on this date. Please select another date.', style: TextStyle(fontSize: 12, color: Colors.orange.shade700)),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  _mernLabel('Preferred Time', required: true),
                                  if (_checkingAvailability) Text(' (Checking availability...)', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.gray500)),
                                ],
                              ),
                              const SizedBox(height: 8),
                              _buildTimePicker(),
                              if (_availability != null && _availability!.bookedSlots.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Text('Booked time slots:', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.gray600)),
                                const SizedBox(height: 4),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 4,
                                  children: _availability!.bookedSlots.map((s) => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(color: Colors.red.shade100, borderRadius: BorderRadius.circular(4)),
                                    child: Text('${s.startTime} - ${s.endTime}', style: TextStyle(fontSize: 12, color: Colors.red.shade800)),
                                  )).toList(),
                                ),
                              ],
                              if (_availability != null && !_availability!.isHoliday && _availability!.availableSlots.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Text('Available time slots:', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.gray600)),
                                const SizedBox(height: 4),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 4,
                                  children: _availability!.availableSlots.map((s) => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(4)),
                                    child: Text('${s.startTime} - ${s.endTime}', style: TextStyle(fontSize: 12, color: Colors.green.shade800)),
                                  )).toList(),
                                ),
                              ],
                              if (_availability != null && !_availability!.isHoliday && _availability!.bookedSlots.isNotEmpty && _availability!.availableSlots.isEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Text('No available slots for this date. All time slots are booked.', style: TextStyle(fontSize: 12, color: Colors.orange.shade800)),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    // Image Upload - MERN: border-t pt-6 (optional)
                    _sectionDivider(),
                    const SizedBox(height: 24),
                    Text('Upload Images of Wood (Optional)', style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 8),
                    Text('Maximum 5 images, 5MB each (PNG, JPG, WebP)', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.gray500)),
                    const SizedBox(height: 24),
                    // Additional Notes
                    _mernLabel('Additional Notes (Optional)'),
                    const SizedBox(height: 8),
                    _buildTextInput(
                      value: _notes,
                      hint: 'Any special requirements or additional information...',
                      maxLines: 4,
                      onChanged: (v) => _notes = v ?? '',
                    ),
                    const SizedBox(height: 24),
                    // Info Box - MERN: p-4 bg-accent-red/10 border-accent-red/30
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: JcTimberTheme.accentRed.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: JcTimberTheme.accentRed30),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.info_outline, color: JcTimberTheme.accentRed, size: 20),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Important Information:', style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 8),
                                Text('• This is a service request, not a confirmed booking\n• Our team will review and contact you within 24 hours\n• Working hours: 09:00 AM to 05:00 PM\n• If your requested slot is available, we\'ll confirm it\n• If unavailable, we\'ll propose an alternative time', style: JcTimberTheme.paragraphStyle(fontSize: 12)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: JcTimberTheme.errorBg, borderRadius: BorderRadius.circular(8), border: Border.all(color: JcTimberTheme.errorBorder)),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: JcTimberTheme.errorText, size: 20),
                            const SizedBox(width: 8),
                            Expanded(child: Text(_error!, style: const TextStyle(color: JcTimberTheme.errorText, fontSize: 14))),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    // Buttons - MERN: Cancel (bg-gray-100 border-gray-300), Submit (bg-dark-brown)
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _loading ? null : () => Navigator.pop(context),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              side: BorderSide(color: JcTimberTheme.gray300),
                              backgroundColor: Colors.grey.shade100,
                              foregroundColor: JcTimberTheme.darkBrown,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: const Text('Cancel'),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: FilledButton(
                            onPressed: _loading ? null : _submit,
                            style: FilledButton.styleFrom(
                              backgroundColor: JcTimberTheme.darkBrown,
                              foregroundColor: JcTimberTheme.cream,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: _loading ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(strokeWidth: 2, color: JcTimberTheme.cream)) : const Text('Submit Request'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // View My Previous Requests - MERN: text-accent-red text-center
            Center(
              child: TextButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const MyEnquiriesScreen()),
                ),
                child: Text(
                  'View My Previous Requests →',
                  style: JcTimberTheme.paragraphStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: JcTimberTheme.accentRed,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionDivider() => Container(height: 1, color: JcTimberTheme.gray200);

  Widget _mernLabel(String text, {bool required = false}) => RichText(
    text: TextSpan(
      style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w500),
      children: [
        TextSpan(text: text),
        if (required) const TextSpan(text: ' ', style: TextStyle(color: Colors.red)),
        if (required) const TextSpan(text: '*', style: TextStyle(color: Colors.red)),
      ],
    ),
  );

  Widget _addLogButton() => Material(
    color: JcTimberTheme.accentRed.withOpacity(0.1),
    borderRadius: BorderRadius.circular(8),
    child: InkWell(
      onTap: () => setState(() => _logItems.add(_LogItemState(woodType: '', numberOfLogs: 1, thickness: 0, width: 0, length: 0, cubicFeet: 0))),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: JcTimberTheme.accentRed30),
        ),
        child: Text('+ Add Another Log', style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w500, color: JcTimberTheme.accentRed)),
      ),
    ),
  );

  Widget _buildDropdown({required String value, required List<String> items, required ValueChanged<String?> onChanged}) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: _inputDecoration(false),
      items: items.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
      onChanged: onChanged,
    );
  }

  Widget _buildTextInput({
    required String value,
    required String hint,
    String? Function(String?)? validator,
    String? Function(String?)? onChanged,
    TextInputType? keyboardType,
    int maxLines = 1,
  }) {
    return TextFormField(
      initialValue: value,
      onChanged: onChanged,
      validator: validator,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: JcTimberTheme.gray300)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: JcTimberTheme.accentRed, width: 2)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: JcTimberTheme.errorBorder)),
      ),
    );
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: () async {
        final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
        if (d != null) {
          final dateStr = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
          setState(() => _requestedDate = dateStr);
          _checkAvailability(dateStr);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border.all(color: JcTimberTheme.gray300),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(_requestedDate.isEmpty ? 'Select date' : _requestedDate, style: JcTimberTheme.paragraphStyle(fontSize: 14)),
      ),
    );
  }

  Widget _buildTimePicker() {
    return InkWell(
      onTap: _availability?.isHoliday == true ? null : () async {
        final t = await showTimePicker(context: context, initialTime: const TimeOfDay(hour: 9, minute: 0));
        if (t != null) setState(() => _requestedTime = '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}');
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border.all(color: JcTimberTheme.gray300),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(_requestedTime, style: JcTimberTheme.paragraphStyle(fontSize: 14)),
      ),
    );
  }

  InputDecoration _inputDecoration(bool hasError) => InputDecoration(
    filled: true,
    fillColor: Colors.white,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: hasError ? JcTimberTheme.errorBorder : JcTimberTheme.gray300)),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: JcTimberTheme.accentRed, width: 2)),
    errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: JcTimberTheme.errorBorder)),
  );

  String _formatIndian(double n) {
    final s = n.toStringAsFixed(0);
    if (s.length <= 3) return s;
    final parts = <String>[];
    var i = s.length;
    while (i > 0) {
      final start = (i - 3).clamp(0, i);
      parts.insert(0, s.substring(start, i));
      i = start;
    }
    return parts.join(',');
  }

  Future<void> _submit() async {
    setState(() => _error = null);
    if (!_formKey.currentState!.validate()) return;
    if (_logItems.isEmpty || _logItems.any((i) => i.woodType.isEmpty || i.cubicFeet < 0.1)) {
      setState(() => _error = 'Please fill all log entries with wood type and cubic feet');
      return;
    }
    if (_totalCubicFeet < 0.1) {
      setState(() => _error = 'Total cubic feet must be at least 0.1');
      return;
    }
    if (_requestedDate.isEmpty) {
      setState(() => _error = 'Please select a date');
      return;
    }
    if (_requestedTime.isEmpty) {
      setState(() => _error = 'Please select a time');
      return;
    }
    if (_availability?.isHoliday == true) {
      setState(() => _error = 'This date is a holiday. Please select another date.');
      return;
    }
    final auth = context.read<AuthService>();
    final timber = TimberService(auth);
    if (_availability != null && !timber.isTimeAvailable(_requestedTime, _availability!.bookedSlots)) {
      setState(() => _error = 'This time slot is already booked. Please select another time.');
      return;
    }
    setState(() => _loading = true);
    final logItems = _logItems.map((i) => LogItem(woodType: i.woodType, numberOfLogs: i.numberOfLogs, thickness: i.thickness, width: i.width, length: i.length, cubicFeet: i.cubicFeet)).toList();
    final result = await timber.createEnquiry(
      workType: _workType,
      logItems: logItems,
      requestedDate: _requestedDate,
      requestedTime: _requestedTime,
      name: _name.trim(),
      phoneNumber: _phoneNumber,
      notes: _notes.isEmpty ? null : _notes,
    );
    if (!mounted) return;
    setState(() => _loading = false);
    if (result.success) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Service request submitted successfully! Our team will contact you soon.')));
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const MyEnquiriesScreen()));
    } else {
      setState(() => _error = result.error);
    }
  }
}

class _LogItemState {
  String woodType;
  int numberOfLogs;
  double thickness, width, length, cubicFeet;
  _LogItemState({required this.woodType, required this.numberOfLogs, required this.thickness, required this.width, required this.length, required this.cubicFeet});
}

class _LogEntryCard extends StatefulWidget {
  final _LogItemState item;
  final int index;
  final ValueChanged<_LogItemState> onChanged;
  final VoidCallback? onRemove;
  final double Function(double, double, double) calculateCubicFeet;

  const _LogEntryCard({required this.item, required this.index, required this.onChanged, this.onRemove, required this.calculateCubicFeet});

  @override
  State<_LogEntryCard> createState() => _LogEntryCardState();
}

class _LogEntryCardState extends State<_LogEntryCard> {
  late TextEditingController _logs;
  late TextEditingController _thickness;
  late TextEditingController _width;
  late TextEditingController _length;
  late TextEditingController _cubicFeet;

  @override
  void initState() {
    super.initState();
    _logs = TextEditingController(text: widget.item.numberOfLogs.toString());
    _thickness = TextEditingController(text: widget.item.thickness > 0 ? widget.item.thickness.toString() : '');
    _width = TextEditingController(text: widget.item.width > 0 ? widget.item.width.toString() : '');
    _length = TextEditingController(text: widget.item.length > 0 ? widget.item.length.toString() : '');
    _cubicFeet = TextEditingController(text: widget.item.cubicFeet > 0 ? widget.item.cubicFeet.toString() : '');
  }

  @override
  void dispose() {
    _logs.dispose();
    _thickness.dispose();
    _width.dispose();
    _length.dispose();
    _cubicFeet.dispose();
    super.dispose();
  }

  void _emit() {
    final t = double.tryParse(_thickness.text) ?? 0;
    final w = double.tryParse(_width.text) ?? 0;
    final l = double.tryParse(_length.text) ?? 0;
    var cf = double.tryParse(_cubicFeet.text) ?? 0;
    if (t > 0 && w > 0 && l > 0) cf = widget.calculateCubicFeet(t, w, l);
    widget.onChanged(_LogItemState(
      woodType: widget.item.woodType,
      numberOfLogs: int.tryParse(_logs.text) ?? 1,
      thickness: t,
      width: w,
      length: l,
      cubicFeet: cf > 0 ? cf : double.tryParse(_cubicFeet.text) ?? 0,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: JcTimberTheme.gray200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Log Entry ${widget.index + 1}', style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w500)),
              if (widget.onRemove != null)
                TextButton(
                  onPressed: widget.onRemove,
                  style: TextButton.styleFrom(foregroundColor: JcTimberTheme.errorText, padding: EdgeInsets.zero, minimumSize: Size.zero),
                  child: Text('Remove', style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w500, color: JcTimberTheme.errorText)),
                ),
            ],
          ),
          const SizedBox(height: 16),
          // Wood Type & Number of Logs - stacked vertically to avoid horizontal overflow
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _label('Wood Type', required: true),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: widget.item.woodType.isEmpty ? '' : widget.item.woodType,
                decoration: _inputDec(),
                items: [
                  const DropdownMenuItem(value: '', child: Text('Select Wood Type')),
                  ..._woodTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))),
                ],
                onChanged: (v) {
                  widget.onChanged(
                    _LogItemState(
                      woodType: v ?? '',
                      numberOfLogs: widget.item.numberOfLogs,
                      thickness: widget.item.thickness,
                      width: widget.item.width,
                      length: widget.item.length,
                      cubicFeet: widget.item.cubicFeet,
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
              _label('Number of Logs', required: true),
              const SizedBox(height: 8),
              TextFormField(
                controller: _logs,
                keyboardType: TextInputType.number,
                decoration: _inputDec(hint: 'e.g., 10'),
                onChanged: (_) => _emit(),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Dimensions - MERN: grid-cols-3
          Text('Dimensions (for Cubic Feet calculation)', style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w500)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Thickness (in)', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.gray500)),
                    const SizedBox(height: 4),
                    TextFormField(
                      controller: _thickness,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: _inputDec(hint: 'Thickness'),
                      onChanged: (_) => _emit(),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Width (in)', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.gray500)),
                    const SizedBox(height: 4),
                    TextFormField(
                      controller: _width,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: _inputDec(hint: 'Width'),
                      onChanged: (_) => _emit(),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Length (in)', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.gray500)),
                    const SizedBox(height: 4),
                    TextFormField(
                      controller: _length,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: _inputDec(hint: 'Length'),
                      onChanged: (_) => _emit(),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('Cubic feet: (Thickness × Width × Length) ÷ 144', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.gray500)),
          const SizedBox(height: 16),
          // Cubic Feet - MERN: "Cubic Feet (Auto-calculated)"
          Text('Cubic Feet (Auto-calculated)', style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w500)),
          const SizedBox(height: 8),
          TextFormField(
            controller: _cubicFeet,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: _inputDec(hint: 'Auto-calculated or enter manually'),
            onChanged: (_) => _emit(),
          ),
          if (widget.item.cubicFeet > 0)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text('Calculated: ${widget.item.cubicFeet} cubic feet', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.gray500)),
            ),
        ],
      ),
    );
  }

  Widget _label(String text, {bool required = false}) => RichText(
    text: TextSpan(
      style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w500),
      children: [
        TextSpan(text: text),
        if (required) const TextSpan(text: ' ', style: TextStyle(color: Colors.red)),
        if (required) const TextSpan(text: '*', style: TextStyle(color: Colors.red)),
      ],
    ),
  );

  InputDecoration _inputDec({String? hint}) => InputDecoration(
    hintText: hint,
    filled: true,
    fillColor: Colors.white,
    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: JcTimberTheme.gray300)),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: JcTimberTheme.accentRed, width: 2)),
  );
}
