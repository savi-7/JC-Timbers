import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../services/timber_service.dart';
import '../models/service_enquiry.dart';
import '../screens/login_screen.dart';
import '../screens/timber_booking_screen.dart';
import '../screens/my_enquiries_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/furniture_list_screen.dart';
import '../screens/cart_screen.dart';
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

  String _greeting() {
    final hour = TimeOfDay.now().hour;
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
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
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : ListView(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                  children: [
                    // HERO: greeting + main actions
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            JcTimberTheme.darkBrown,
                            const Color(0xFF8C5B4A),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Good ${_greeting()},',
                                      style: JcTimberTheme.paragraphStyle(
                                        fontSize: 14,
                                        color: JcTimberTheme.cream
                                            .withOpacity(0.8),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      auth.user?.name ?? 'JC Timbers customer',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: JcTimberTheme.headingStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w600,
                                      ).copyWith(color: JcTimberTheme.cream),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              GestureDetector(
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => const ProfileScreen(),
                                    ),
                                  );
                                },
                                child: CircleAvatar(
                                  radius: 22,
                                  backgroundColor:
                                      JcTimberTheme.cream.withOpacity(0.2),
                                  child: Text(
                                    (() {
                                      final name = auth.user?.name.trim();
                                      if (name == null || name.isEmpty) {
                                        return 'JT';
                                      }
                                      final parts =
                                          name.split(RegExp(r'\s+'));
                                      final initials = parts
                                          .take(2)
                                          .map((p) => p[0])
                                          .join();
                                      return initials.toUpperCase();
                                    })(),
                                    style: const TextStyle(
                                      color: JcTimberTheme.cream,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Manage timber processing and shop curated furniture in one place.',
                            style: JcTimberTheme.paragraphStyle(
                              fontSize: 13,
                              color:
                                  JcTimberTheme.cream.withOpacity(0.85),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: FilledButton(
                                  onPressed: () async {
                                    await Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) =>
                                            const TimberBookingScreen(),
                                      ),
                                    );
                                    _load();
                                  },
                                  style: FilledButton.styleFrom(
                                    backgroundColor: JcTimberTheme.cream,
                                    foregroundColor: JcTimberTheme.darkBrown,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: const Text('Book timber'),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) =>
                                            const FurnitureListScreen(),
                                      ),
                                    );
                                  },
                                  style: OutlinedButton.styleFrom(
                                    side: BorderSide(
                                      color: JcTimberTheme.cream
                                          .withOpacity(0.9),
                                    ),
                                    foregroundColor: JcTimberTheme.cream,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: const Text('Shop furniture'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // HIGHLIGHTED CATEGORIES
                    SizedBox(
                      height: 110,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          _CategoryChip(
                            label: 'Timber services',
                            icon: Icons.forest_outlined,
                            onTap: () async {
                              await Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) =>
                                      const TimberBookingScreen(),
                                ),
                              );
                              _load();
                            },
                          ),
                          _CategoryChip(
                            label: 'Furniture store',
                            icon: Icons.chair_outlined,
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) =>
                                      const FurnitureListScreen(),
                                ),
                              );
                            },
                          ),
                          _CategoryChip(
                            label: 'My enquiries',
                            icon: Icons.list_alt_outlined,
                            onTap: () async {
                              await Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) =>
                                      const MyEnquiriesScreen(),
                                ),
                              );
                              _load();
                            },
                          ),
                          _CategoryChip(
                            label: 'My cart',
                            icon: Icons.shopping_cart_outlined,
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => const CartScreen(),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // OVERVIEW CARD
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: JcTimberTheme.gray200),
                        boxShadow: [
                          BoxShadow(
                            color: JcTimberTheme.darkBrown.withOpacity(0.06),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: JcTimberTheme.accentRed
                                  .withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.event_note,
                              color: JcTimberTheme.accentRed,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Your timber bookings',
                                  style: JcTimberTheme.paragraphStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _enquiries.isEmpty
                                      ? 'You have no active requests yet.'
                                      : 'You have ${_enquiries.length} request${_enquiries.length == 1 ? '' : 's'} in the system.',
                                  style: JcTimberTheme.paragraphStyle(
                                    fontSize: 13,
                                    color:
                                        JcTimberTheme.darkBrown70,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.arrow_forward_ios,
                                size: 16),
                            onPressed: () async {
                              await Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) =>
                                      const MyEnquiriesScreen(),
                                ),
                              );
                              _load();
                            },
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Services Section (Timber overview)
                    Text(
                      'Timber services',
                      style: JcTimberTheme.headingStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Professional timber processing and woodworking services tailored to your needs.',
                      style: JcTimberTheme.paragraphStyle(
                        fontSize: 14,
                        color: JcTimberTheme.darkBrown70,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Timber Processing Card
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
                              child: Icon(
                                Icons.forest,
                                size: 48,
                                color: JcTimberTheme.accentRed,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Timber Cutting & Processing',
                              style: JcTimberTheme.headingStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w600,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Planing, resawing, debarking and sawing — handled with industrial precision.',
                              style: JcTimberTheme.paragraphStyle(
                                fontSize: 14,
                                color: JcTimberTheme.darkBrown70,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            _buildFeatureItem('Planing – smooth, accurate finishes'),
                            _buildFeatureItem('Resawing – break down large logs efficiently'),
                            _buildFeatureItem('Debarking – clean logs for further processing'),
                            _buildFeatureItem('Sawing – cut to your exact specifications'),
                            const SizedBox(height: 16),
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
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: const Text('Send a Request'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // How it works
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
                              Text(
                                'How it works',
                                style: JcTimberTheme.paragraphStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.blue.shade900,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '• Submit your service request with timber details.',
                            style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.blue.shade800),
                          ),
                          Text(
                            '• Our team reviews and confirms an available slot.',
                            style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.blue.shade800),
                          ),
                          Text(
                            '• Your wood is processed on the scheduled date.',
                            style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.blue.shade800),
                          ),
                          Text(
                            '• You pick up the finished timber from our yard.',
                            style: JcTimberTheme.paragraphStyle(fontSize: 12, color: Colors.blue.shade800),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Working hours pill
                    Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: JcTimberTheme.gray200),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            Icon(Icons.access_time, size: 20, color: Colors.grey.shade700),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Working hours: Mon–Sat, 9:00 AM – 5:00 PM',
                                style: JcTimberTheme.paragraphStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade800,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Bookings list
                    Text(
                      'My bookings',
                      style: JcTimberTheme.headingStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (_enquiries.isEmpty)
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Center(
                          child: Text(
                            'No bookings yet. Start by sending your first timber request.',
                            style: JcTimberTheme.paragraphStyle(
                              fontSize: 14,
                              color: JcTimberTheme.darkBrown70,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      )
                    else
                      ..._enquiries.map(
                        (e) => _EnquiryCard(
                          enquiry: e,
                          onCancel: () async {
                            final timber = TimberService(auth);
                            await timber.cancelEnquiry(e.id);
                            _load();
                          },
                        ),
                      ),
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

class _CategoryChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: 150,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: JcTimberTheme.gray200),
            boxShadow: [
              BoxShadow(
                color: JcTimberTheme.darkBrown.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: JcTimberTheme.accentRed.withOpacity(0.08),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  size: 20,
                  color: JcTimberTheme.accentRed,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: JcTimberTheme.paragraphStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: JcTimberTheme.darkBrown,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
