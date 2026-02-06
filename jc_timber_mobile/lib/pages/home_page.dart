import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../services/timber_service.dart';
import '../models/service_enquiry.dart';
import '../screens/login_screen.dart';
import '../screens/timber_booking_screen.dart';
import '../screens/my_enquiries_screen.dart';
import '../theme/jc_timber_theme.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<ServiceEnquiry> _enquiries = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final auth = context.read<AuthService>();
    final timber = TimberService(auth);
    setState(() => _loading = true);
    final list = await timber.getMyEnquiries();
    if (mounted) setState(() {
      _enquiries = list;
      _loading = false;
    });
  }

  Widget _buildFeatureItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.check_circle, size: 18, color: Colors.green.shade600),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: JcTimberTheme.paragraphStyle(fontSize: 13, color: JcTimberTheme.darkBrown70),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    if (!auth.isLoggedIn) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('JC Timbers'),
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await auth.logout();
              if (!context.mounted) return;
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text(
                    'Hello, ${auth.user?.name ?? "User"}',
                    style: JcTimberTheme.headingStyle(fontSize: 24, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 24),
                  // Services Section - matches MERN ServicePage
                  Text(
                    'Our Services',
                    style: JcTimberTheme.headingStyle(fontSize: 22, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Professional timber processing and woodworking services tailored to your needs',
                    style: JcTimberTheme.paragraphStyle(fontSize: 14, color: JcTimberTheme.darkBrown70),
                  ),
                  const SizedBox(height: 20),
                  // Timber Processing Card - MERN styling
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: JcTimberTheme.darkBrown.withOpacity(0.08),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                      border: Border.all(color: JcTimberTheme.gray200),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Center(
                            child: Icon(Icons.forest, size: 48, color: JcTimberTheme.accentRed),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Timber Cutting & Processing',
                            style: JcTimberTheme.headingStyle(fontSize: 20, fontWeight: FontWeight.w600),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Professional timber cutting, planing, resawing, and debarking services. Get your wood processed exactly as you need it.',
                            style: JcTimberTheme.paragraphStyle(fontSize: 14, color: JcTimberTheme.darkBrown70),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          _buildFeatureItem('Planing - Smooth and finish wood surfaces'),
                          _buildFeatureItem('Resawing - Cut large logs into smaller pieces'),
                          _buildFeatureItem('Debarking - Remove bark from logs'),
                          _buildFeatureItem('Sawing - Custom cutting to your specifications'),
                          _buildFeatureItem('Other processing services as needed'),
                          const SizedBox(height: 20),
                          SizedBox(
                            width: double.infinity,
                            child: FilledButton(
                              onPressed: () async {
                                await Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const TimberBookingScreen(),
                                  ),
                                );
                                _load();
                              },
                              style: FilledButton.styleFrom(
                                backgroundColor: JcTimberTheme.darkBrown,
                                foregroundColor: JcTimberTheme.cream,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Send a Request'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: TextButton(
                      onPressed: () async {
                        await Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const MyEnquiriesScreen()),
                        );
                        _load();
                      },
                      child: Text(
                        'View My Previous Requests →',
                        style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w500, color: JcTimberTheme.accentRed),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  // How It Works - matches MERN
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.blue.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.info_outline, size: 22, color: Colors.blue.shade700),
                            const SizedBox(width: 8),
                            Text('How It Works', style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.blue.shade900)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('• Fill out the service request form with your requirements', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.blue.shade800)),
                        Text('• Our team reviews your request within 24 hours', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.blue.shade800)),
                        Text('• We confirm your preferred time slot or propose an alternative', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.blue.shade800)),
                        Text('• Your wood is processed on the scheduled date', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.blue.shade800)),
                        Text('• Service completed and ready for pickup', style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.blue.shade800)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Working Hours - matches MERN
                  Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: JcTimberTheme.gray200),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.access_time, size: 20, color: Colors.grey.shade700),
                          const SizedBox(width: 8),
                          Text(
                            'Working Hours: Monday - Saturday, 9:00 AM - 5:00 PM',
                            style: JcTimberTheme.paragraphStyle(fontSize: 13, color: Colors.grey.shade800),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'My Bookings',
                    style: JcTimberTheme.headingStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  if (_enquiries.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Center(
                        child: Text(
                          'No bookings yet',
                          style: JcTimberTheme.paragraphStyle(fontSize: 14, color: JcTimberTheme.darkBrown70),
                        ),
                      ),
                    )
                  else
                    ..._enquiries.map((e) => _EnquiryCard(
                          enquiry: e,
                          onCancel: () async {
                            final timber = TimberService(auth);
                            await timber.cancelEnquiry(e.id);
                            _load();
                          },
                        )),
                ],
              ),
      ),
    );
  }
}

class _EnquiryCard extends StatelessWidget {
  final ServiceEnquiry enquiry;
  final VoidCallback onCancel;

  const _EnquiryCard({
    required this.enquiry,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final canCancel = enquiry.status != 'COMPLETED' &&
        enquiry.status != 'CANCELLED' &&
        enquiry.status != 'IN_PROGRESS';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: JcTimberTheme.gray200),
        boxShadow: [
          BoxShadow(
            color: JcTimberTheme.darkBrown.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  enquiry.workType,
                  style: JcTimberTheme.paragraphStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor(enquiry.status).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    enquiry.status.replaceAll('_', ' '),
                    style: TextStyle(
                      fontSize: 12,
                      color: _statusColor(enquiry.status),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('Date: ${enquiry.requestedDate} ${enquiry.requestedTime}', style: JcTimberTheme.paragraphStyle(fontSize: 14)),
            Text('Cubic feet: ${enquiry.cubicFeet.toStringAsFixed(1)}', style: JcTimberTheme.paragraphStyle(fontSize: 14)),
            if (enquiry.estimatedCost != null)
              Text('Est. cost: ₹${enquiry.estimatedCost!.toStringAsFixed(0)}', style: JcTimberTheme.paragraphStyle(fontSize: 14)),
            if (canCancel) ...[
              const SizedBox(height: 8),
              TextButton(
                onPressed: onCancel,
                style: TextButton.styleFrom(foregroundColor: JcTimberTheme.accentRed),
                child: const Text('Cancel'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'COMPLETED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.grey;
      case 'SCHEDULED':
      case 'TIME_ACCEPTED':
        return Colors.blue;
      case 'ENQUIRY_RECEIVED':
      case 'UNDER_REVIEW':
        return Colors.orange;
      default:
        return JcTimberTheme.accentRed;
    }
  }
}
