import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../services/timber_service.dart';
import '../models/service_enquiry.dart';
import '../theme/jc_timber_theme.dart';
import 'timber_booking_screen.dart';

/// My Service Enquiries - matches MERN MyServiceEnquiries.
class MyEnquiriesScreen extends StatefulWidget {
  const MyEnquiriesScreen({super.key});

  @override
  State<MyEnquiriesScreen> createState() => _MyEnquiriesScreenState();
}

class _MyEnquiriesScreenState extends State<MyEnquiriesScreen> {
  List<ServiceEnquiry> _enquiries = [];
  bool _loading = true;
  String? _filterStatus;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final auth = context.read<AuthService>();
      final timber = TimberService(auth);
      setState(() {
        _loading = true;
        _error = null;
      });
      final list = await timber.getMyEnquiries(status: _filterStatus ?? '');
      if (!mounted) return;
      setState(() {
        _enquiries = list;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Failed to load enquiries';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
        title: const Text('My Service Enquiries'),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header - always stacked to avoid horizontal overflow
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'My Service Enquiries',
                    style: JcTimberTheme.headingStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Track your service requests',
                    style: JcTimberTheme.paragraphStyle(
                      fontSize: 14,
                      color: JcTimberTheme.darkBrown70,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: FilledButton(
                      onPressed: () => Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => const TimberBookingScreen()),
                      ),
                      style: FilledButton.styleFrom(
                        backgroundColor: JcTimberTheme.darkBrown,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        '+ New Enquiry',
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: JcTimberTheme.cream,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Filter
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: JcTimberTheme.gray200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Filter by Status:',
                      style: JcTimberTheme.paragraphStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _filterStatus ?? '',
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      items: const [
                        DropdownMenuItem(value: '', child: Text('All')),
                        DropdownMenuItem(value: 'ENQUIRY_RECEIVED', child: Text('Enquiry Received')),
                        DropdownMenuItem(value: 'UNDER_REVIEW', child: Text('Under Review')),
                        DropdownMenuItem(value: 'TIME_ACCEPTED', child: Text('Time Accepted')),
                        DropdownMenuItem(value: 'ALTERNATE_TIME_PROPOSED', child: Text('Alternate Time Proposed')),
                        DropdownMenuItem(value: 'SCHEDULED', child: Text('Scheduled')),
                        DropdownMenuItem(value: 'IN_PROGRESS', child: Text('In Progress')),
                        DropdownMenuItem(value: 'COMPLETED', child: Text('Completed')),
                        DropdownMenuItem(value: 'CANCELLED', child: Text('Cancelled')),
                        DropdownMenuItem(value: 'REJECTED', child: Text('Rejected')),
                      ],
                      onChanged: (v) => setState(() {
                        _filterStatus = v?.isEmpty == true ? null : v;
                        _load();
                      }),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              if (_error != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(
                    _error!,
                    style: JcTimberTheme.paragraphStyle(fontSize: 13, color: JcTimberTheme.errorText),
                  ),
                ),
              if (_loading)
                Container(
                  padding: const EdgeInsets.all(48),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: JcTimberTheme.gray200),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(
                        height: 32,
                        width: 32,
                        child: CircularProgressIndicator(),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Loading enquiries...',
                        style: JcTimberTheme.paragraphStyle(fontSize: 13, color: JcTimberTheme.darkBrown70),
                      ),
                    ],
                  ),
                )
              else if (_enquiries.isEmpty)
                Container(
                  padding: const EdgeInsets.all(48),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: JcTimberTheme.gray200)),
                  child: Column(
                    children: [
                      Icon(Icons.insert_drive_file_outlined, size: 64, color: Colors.grey.shade400),
                      const SizedBox(height: 16),
                      Text('No enquiries found', style: JcTimberTheme.paragraphStyle(fontSize: 15, color: JcTimberTheme.darkBrown70)),
                      const SizedBox(height: 16),
                      TextButton(
                        onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const TimberBookingScreen())),
                        child: Text('Submit your first enquiry →', style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w500, color: JcTimberTheme.accentRed)),
                      ),
                    ],
                  ),
                )
              else
                ..._enquiries.map((e) => _EnquiryCard(
                      enquiry: e,
                      onCancel: () async {
                        final auth = context.read<AuthService>();
                        await TimberService(auth).cancelEnquiry(e.id);
                        _load();
                      },
                    )),
            ],
          ),
        ),
      ),
    );
  }
}

class _EnquiryCard extends StatelessWidget {
  final ServiceEnquiry enquiry;
  final VoidCallback onCancel;

  const _EnquiryCard({required this.enquiry, required this.onCancel});

  @override
  Widget build(BuildContext context) {
    final canCancel = enquiry.status == 'ENQUIRY_RECEIVED' || enquiry.status == 'UNDER_REVIEW';
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: JcTimberTheme.gray200),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Status + submitted date
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        _StatusChip(status: enquiry.status),
                        if (enquiry.createdAt != null)
                          Text(
                            'Submitted on ${_formatDate(enquiry.createdAt!)}',
                            style: JcTimberTheme.paragraphStyle(
                              fontSize: 12,
                              color: JcTimberTheme.darkBrown70,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${enquiry.workType} Service',
                      style: JcTimberTheme.paragraphStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    // Log items (if present)
                    if (enquiry.logItems.isNotEmpty) ...[
                      Text('Wood Log Entries:', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.darkBrown70)),
                      const SizedBox(height: 6),
                      Column(
                        children: enquiry.logItems.map((item) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: JcTimberTheme.gray200),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Wood Type', style: JcTimberTheme.paragraphStyle(fontSize: 11, color: JcTimberTheme.darkBrown70)),
                                      Text(item.woodType, style: JcTimberTheme.paragraphStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                                    ],
                                  ),
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Number of Logs', style: JcTimberTheme.paragraphStyle(fontSize: 11, color: JcTimberTheme.darkBrown70)),
                                      Text('${item.numberOfLogs}', style: JcTimberTheme.paragraphStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                      Container(
                        margin: const EdgeInsets.only(top: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        decoration: BoxDecoration(
                          color: JcTimberTheme.darkBrown.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: JcTimberTheme.darkBrown20),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Total Cubic Feet:', style: JcTimberTheme.paragraphStyle(fontSize: 12)),
                            Text('${enquiry.cubicFeet.toStringAsFixed(1)} cu ft', style: JcTimberTheme.paragraphStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ] else ...[
                      // Legacy single-entry display
                      Text('Total: ${enquiry.cubicFeet.toStringAsFixed(1)} cu ft', style: JcTimberTheme.paragraphStyle(fontSize: 14, color: JcTimberTheme.darkBrown70)),
                    ],
                    const SizedBox(height: 8),
                    // Requested date/time & processing time
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Requested Date', style: JcTimberTheme.paragraphStyle(fontSize: 11, color: JcTimberTheme.darkBrown70)),
                              Text(enquiry.requestedDate, style: JcTimberTheme.paragraphStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Requested Time', style: JcTimberTheme.paragraphStyle(fontSize: 11, color: JcTimberTheme.darkBrown70)),
                              Text(enquiry.requestedTime, style: JcTimberTheme.paragraphStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (enquiry.processingHours != null && enquiry.processingHours! > 0) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Estimated Processing Time: ${enquiry.processingHours} hour${enquiry.processingHours == 1 ? '' : 's'}',
                        style: JcTimberTheme.paragraphStyle(fontSize: 12, color: JcTimberTheme.darkBrown70),
                      ),
                    ],
                    // Status-specific info blocks (accepted / proposed / scheduled)
                    if (enquiry.status == 'TIME_ACCEPTED' && enquiry.acceptedDate != null) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.green.shade200),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('✓ Your Requested Time Accepted!', style: JcTimberTheme.paragraphStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.green.shade900)),
                            const SizedBox(height: 4),
                            if (enquiry.acceptedStartTime != null && enquiry.acceptedEndTime != null)
                              Text(
                                'Time: ${enquiry.acceptedStartTime} - ${enquiry.acceptedEndTime}',
                                style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.green.shade800),
                              ),
                          ],
                        ),
                      ),
                    ],
                    if (enquiry.status == 'ALTERNATE_TIME_PROPOSED' && enquiry.proposedDate != null) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.orange.shade200),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('⚠ Alternate Time Proposed', style: JcTimberTheme.paragraphStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.orange.shade900)),
                            const SizedBox(height: 4),
                            if (enquiry.proposedStartTime != null && enquiry.proposedEndTime != null)
                              Text(
                                'Time: ${enquiry.proposedStartTime} - ${enquiry.proposedEndTime}',
                                style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.orange.shade800),
                              ),
                          ],
                        ),
                      ),
                    ],
                    if (enquiry.status == 'SCHEDULED' && enquiry.scheduledDate != null) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.purple.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.purple.shade200),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Scheduled For', style: JcTimberTheme.paragraphStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.purple.shade900)),
                            const SizedBox(height: 4),
                            Text(
                              _formatDate(enquiry.scheduledDate!),
                              style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.purple.shade800),
                            ),
                          ],
                        ),
                      ),
                    ],
                    // Cost & payment status
                    if (enquiry.estimatedCost != null || enquiry.paymentStatus != null) ...[
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          if (enquiry.estimatedCost != null)
                            Text(
                              'Estimated Cost: ₹${enquiry.estimatedCost!.toStringAsFixed(0)}',
                              style: JcTimberTheme.paragraphStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          if (enquiry.paymentStatus != null)
                            Text(
                              'Payment: ${enquiry.paymentStatus}',
                              style: JcTimberTheme.paragraphStyle(
                                fontSize: 12,
                                color: JcTimberTheme.darkBrown70,
                              ),
                            ),
                        ],
                      ),
                    ],
                    // Notes & admin notes
                    if (enquiry.notes != null && enquiry.notes!.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text('Your Notes:', style: JcTimberTheme.paragraphStyle(fontSize: 11, color: JcTimberTheme.darkBrown70)),
                      Text(enquiry.notes!, style: JcTimberTheme.paragraphStyle(fontSize: 13, color: JcTimberTheme.darkBrown70)),
                    ],
                    if (enquiry.adminNotes != null && enquiry.adminNotes!.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.yellow.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.yellow.shade200),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Message from Admin:', style: JcTimberTheme.paragraphStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.yellow.shade900)),
                            const SizedBox(height: 2),
                            Text(enquiry.adminNotes!, style: JcTimberTheme.paragraphStyle(fontSize: 13, color: Colors.yellow.shade800)),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 12),
              // Actions column
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (canCancel)
                    TextButton(
                      onPressed: onCancel,
                      style: TextButton.styleFrom(
                        foregroundColor: JcTimberTheme.accentRed,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Cancel'),
                    ),
                  if (enquiry.estimatedCost != null &&
                      enquiry.paymentStatus != 'PAID' &&
                      (enquiry.status == 'TIME_ACCEPTED' || enquiry.status == 'SCHEDULED')) ...[
                    const SizedBox(height: 4),
                    FilledButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Online payment is currently available on the web portal.'),
                          ),
                        );
                      },
                      style: FilledButton.styleFrom(
                        backgroundColor: JcTimberTheme.darkBrown,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Pay Online'),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime d) {
    return '${d.day.toString().padLeft(2, '0')}-${d.month.toString().padLeft(2, '0')}-${d.year}';
  }
}

class _StatusChip extends StatelessWidget {
  final String status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final style = _styleForStatus(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: style.bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: style.border),
      ),
      child: Text(
        status.replaceAll('_', ' '),
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: style.text),
      ),
    );
  }

  _StatusStyle _styleForStatus(String s) {
    switch (s) {
      case 'ENQUIRY_RECEIVED':
        return _StatusStyle(Colors.blue.shade100, Colors.blue.shade800, Colors.blue.shade300);
      case 'UNDER_REVIEW':
        return _StatusStyle(Colors.yellow.shade100, Colors.yellow.shade800, Colors.yellow.shade300);
      case 'TIME_ACCEPTED':
        return _StatusStyle(Colors.green.shade100, Colors.green.shade800, Colors.green.shade300);
      case 'ALTERNATE_TIME_PROPOSED':
        return _StatusStyle(Colors.orange.shade100, Colors.orange.shade800, Colors.orange.shade300);
      case 'SCHEDULED':
        return _StatusStyle(Colors.purple.shade100, Colors.purple.shade800, Colors.purple.shade300);
      case 'IN_PROGRESS':
        return _StatusStyle(Colors.indigo.shade100, Colors.indigo.shade800, Colors.indigo.shade300);
      case 'COMPLETED':
        return _StatusStyle(Colors.green.shade100, Colors.green.shade800, Colors.green.shade300);
      case 'CANCELLED':
        return _StatusStyle(Colors.grey.shade100, Colors.grey.shade800, Colors.grey.shade300);
      case 'REJECTED':
        return _StatusStyle(Colors.red.shade100, Colors.red.shade800, Colors.red.shade300);
      default:
        return _StatusStyle(Colors.grey.shade100, Colors.grey.shade800, Colors.grey.shade300);
    }
  }
}

class _StatusStyle {
  final Color bg;
  final Color text;
  final Color border;
  _StatusStyle(this.bg, this.text, this.border);
}
