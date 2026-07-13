import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../services/timber_service.dart';
import '../models/service_enquiry.dart';
import '../theme/jc_timber_theme.dart';

const _workTypes = ['Planing', 'Resawing', 'Debarking', 'Sawing', 'Other'];

class TimberBookingPage extends StatefulWidget {
  const TimberBookingPage({super.key});

  @override
  State<TimberBookingPage> createState() => _TimberBookingPageState();
}

class _TimberBookingPageState extends State<TimberBookingPage> {
  String _workType = _workTypes[0];
  final _logItems = <LogItem>[];
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  String? _notes;
  bool _loading = false;
  String? _error;

  void _addLogItem() {
    setState(() {
      _logItems.add(LogItem(
        woodType: 'Teak',
        numberOfLogs: 1,
        cubicFeet: 1.0,
      ));
    });
  }

  void _removeLogItem(int i) {
    setState(() => _logItems.removeAt(i));
  }

  void _updateLogItem(int i, LogItem item) {
    setState(() => _logItems[i] = item);
  }

  double get _totalCubicFeet =>
      _logItems.fold(0.0, (s, i) => s + i.cubicFeet);

  Future<void> _submit() async {
    if (_logItems.isEmpty) {
      setState(() => _error = 'Add at least one log entry');
      return;
    }
    if (_selectedDate == null || _selectedTime == null) {
      setState(() => _error = 'Select date and time');
      return;
    }
    setState(() {
      _error = null;
      _loading = true;
    });
    final auth = context.read<AuthService>();
    final timber = TimberService(auth);
    final dateStr =
        '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';
    final timeStr =
        '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}';
    final result = await timber.createEnquiry(
      workType: _workType,
      logItems: _logItems,
      requestedDate: dateStr,
      requestedTime: timeStr,
      phoneNumber: auth.user?.phone,
      name: auth.user?.name,
      notes: _notes,
    );
    if (!mounted) return;
    setState(() => _loading = false);
    if (result.success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Booking submitted successfully')),
      );
      Navigator.of(context).pop();
    } else {
      setState(() => _error = result.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Timber Processing Booking'),
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            DropdownButtonFormField<String>(
              value: _workType,
              decoration: const InputDecoration(
                labelText: 'Work Type',
                border: OutlineInputBorder(),
              ),
              items: _workTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
              onChanged: (v) => setState(() => _workType = v ?? _workTypes[0]),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Log entries'),
                TextButton.icon(
                  onPressed: _addLogItem,
                  icon: const Icon(Icons.add),
                  label: const Text('Add'),
                ),
              ],
            ),
            ...List.generate(_logItems.length, (i) {
              final item = _logItems[i];
              return _LogItemTile(
                item: item,
                onChanged: (n) => _updateLogItem(i, n),
                onRemove: () => _removeLogItem(i),
              );
            }),
            if (_logItems.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  'Total: ${_totalCubicFeet.toStringAsFixed(1)} cubic feet',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            const SizedBox(height: 24),
            ListTile(
              title: Text(
                _selectedDate == null
                    ? 'Select date'
                    : '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}',
              ),
              trailing: const Icon(Icons.calendar_today),
              onTap: () async {
                final d = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 365)),
                );
                if (d != null) setState(() => _selectedDate = d);
              },
            ),
            ListTile(
              title: Text(
                _selectedTime == null
                    ? 'Select time'
                    : '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}',
              ),
              trailing: const Icon(Icons.access_time),
              onTap: () async {
                final t = await showTimePicker(
                  context: context,
                  initialTime: TimeOfDay(hour: 9, minute: 0),
                );
                if (t != null) setState(() => _selectedTime = t);
              },
            ),
            const SizedBox(height: 16),
            TextField(
              decoration: const InputDecoration(
                labelText: 'Notes (optional)',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
              onChanged: (v) => _notes = v.isEmpty ? null : v,
            ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: JcTimberTheme.errorBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_error!, style: const TextStyle(color: JcTimberTheme.errorText)),
              ),
            ],
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _loading ? null : _submit,
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: JcTimberTheme.darkBrown,
              ),
              child: _loading
                  ? const SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Submit Booking'),
            ),
          ],
        ),
      ),
    );
  }
}

class _LogItemTile extends StatefulWidget {
  final LogItem item;
  final ValueChanged<LogItem> onChanged;
  final VoidCallback onRemove;

  const _LogItemTile({
    required this.item,
    required this.onChanged,
    required this.onRemove,
  });

  @override
  State<_LogItemTile> createState() => _LogItemTileState();
}

class _LogItemTileState extends State<_LogItemTile> {
  late TextEditingController _woodType;
  late TextEditingController _logs;
  late TextEditingController _cubicFeet;

  @override
  void initState() {
    super.initState();
    _woodType = TextEditingController(text: widget.item.woodType);
    _logs = TextEditingController(text: widget.item.numberOfLogs.toString());
    _cubicFeet = TextEditingController(text: widget.item.cubicFeet.toString());
  }

  @override
  void dispose() {
    _woodType.dispose();
    _logs.dispose();
    _cubicFeet.dispose();
    super.dispose();
  }

  void _emit() {
    final logs = int.tryParse(_logs.text) ?? 1;
    final cf = double.tryParse(_cubicFeet.text) ?? 1.0;
    widget.onChanged(LogItem(
      woodType: _woodType.text.trim().isEmpty ? 'Teak' : _woodType.text.trim(),
      numberOfLogs: logs < 1 ? 1 : logs,
      cubicFeet: cf < 0.1 ? 0.1 : cf,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _woodType,
                    decoration: const InputDecoration(
                      labelText: 'Wood type',
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) => _emit(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline),
                  onPressed: widget.onRemove,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _logs,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Logs',
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) => _emit(),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _cubicFeet,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      labelText: 'Cubic ft',
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) => _emit(),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
