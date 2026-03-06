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
import '../screens/marketplace_screen.dart';
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
          color: JcTimberTheme.accentRed,
          backgroundColor: JcTimberTheme.cream,
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : CustomScrollView(
                  slivers: [
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
                        child: _buildHeader(auth),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      sliver: SliverToBoxAdapter(
                        child: _buildHeroBanner(context),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      sliver: SliverToBoxAdapter(
                        child: Text(
                          'Our Services',
                          style: JcTimberTheme.headingStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      sliver: SliverGrid(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: 16,
                          crossAxisSpacing: 16,
                          childAspectRatio: 0.85,
                        ),
                        delegate: SliverChildListDelegate([
                          _buildModuleCard(
                            context: context,
                            title: 'Furniture Store',
                            subtitle: 'Shop premium curated pieces',
                            icon: Icons.chair_alt_rounded,
                            color: JcTimberTheme.darkBrown,
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                  builder: (_) => const FurnitureListScreen()),
                            ),
                          ),
                          _buildModuleCard(
                            context: context,
                            title: 'Timber Services',
                            subtitle: 'Book custom processing',
                            icon: Icons.forest_rounded,
                            color: JcTimberTheme.accentRed,
                            onTap: () async {
                              await Navigator.of(context).push(
                                MaterialPageRoute(
                                    builder: (_) => const TimberBookingScreen()),
                              );
                              _load();
                            },
                          ),
                          _buildModuleCard(
                            context: context,
                            title: 'Marketplace',
                            subtitle: 'Buy & sell timber goods',
                            icon: Icons.storefront_rounded,
                            color: const Color(0xFF6B443D), // A rich mid-brown
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                  builder: (_) => const MarketplaceScreen()),
                            ),
                          ),
                          _buildQuickActionsCard(context),
                        ]),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
                      sliver: SliverToBoxAdapter(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Recent Bookings',
                              style: JcTimberTheme.headingStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            if (_enquiries.isNotEmpty)
                              TextButton(
                                onPressed: () async {
                                  await Navigator.of(context).push(
                                    MaterialPageRoute(
                                        builder: (_) => const MyEnquiriesScreen()),
                                  );
                                  _load();
                                },
                                style: TextButton.styleFrom(
                                  foregroundColor: JcTimberTheme.accentRed,
                                  padding: EdgeInsets.zero,
                                ),
                                child: Text(
                                  'View All',
                                  style: JcTimberTheme.paragraphStyle(
                                    fontWeight: FontWeight.w600,
                                    color: JcTimberTheme.accentRed,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      sliver: _enquiries.isEmpty
                          ? SliverToBoxAdapter(
                              child: Container(
                                padding: const EdgeInsets.all(24),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: JcTimberTheme.gray200),
                                ),
                                child: Column(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: JcTimberTheme.lightCream,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        Icons.receipt_long_rounded,
                                        size: 32,
                                        color: JcTimberTheme.darkBrown20,
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'No bookings yet',
                                      style: JcTimberTheme.paragraphStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Start by booking a timber service or checking out the marketplace.',
                                      textAlign: TextAlign.center,
                                      style: JcTimberTheme.paragraphStyle(
                                        fontSize: 14,
                                        color: JcTimberTheme.gray500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : SliverList(
                              delegate: SliverChildBuilderDelegate(
                                (context, index) {
                                  // Show max 3 recent bookings
                                  if (index >= 3) return const SizedBox.shrink();
                                  final enquiry = _enquiries[index];
                                  return _EnquiryCard(
                                    enquiry: enquiry,
                                    onCancel: () async {
                                      final timber = TimberService(auth);
                                      await timber.cancelEnquiry(enquiry.id);
                                      _load();
                                    },
                                  );
                                },
                                childCount: _enquiries.length > 3 ? 3 : _enquiries.length,
                              ),
                            ),
                    ),
                    const SliverToBoxAdapter(child: SizedBox(height: 40)),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildHeader(AuthService auth) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const ProfileScreen()),
        );
      },
      behavior: HitTestBehavior.opaque,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Good ${_greeting()},',
                  style: JcTimberTheme.paragraphStyle(
                    fontSize: 14,
                    color: JcTimberTheme.darkBrown60,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  auth.user?.name ?? 'Guest',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: JcTimberTheme.headingStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: JcTimberTheme.accentRed.withOpacity(0.3), width: 2),
            ),
            child: CircleAvatar(
              radius: 26,
              backgroundColor: JcTimberTheme.darkBrown,
              child: Text(
                (() {
                  final name = auth.user?.name.trim() ?? '';
                  if (name.isEmpty) return 'JT';
                  final parts = name.split(RegExp(r'\s+'));
                  return parts.take(2).map((p) => p[0]).join().toUpperCase();
                })(),
                style: const TextStyle(
                  color: JcTimberTheme.cream,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroBanner(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: JcTimberTheme.darkBrown,
        borderRadius: BorderRadius.circular(24),
        image: const DecorationImage(
          image: AssetImage('assets/images/wood_texture_dark.png'), // Will fail gracefully if not exists, but provides logic hook
          fit: BoxFit.cover,
          opacity: 0.15,
        ),
        boxShadow: [
          BoxShadow(
            color: JcTimberTheme.darkBrown.withOpacity(0.2),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Decorative background shapes
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.05),
              ),
            ),
          ),
          Positioned(
            left: -40,
            bottom: -40,
            child: Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: JcTimberTheme.accentRed.withOpacity(0.1),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: JcTimberTheme.accentRed,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'DISCOVER',
                    style: JcTimberTheme.paragraphStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Premium Timber\n& Curated Design',
                  style: JcTimberTheme.headingStyle(
                    fontSize: 28,
                    color: Colors.white,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Your one-stop destination for fine woodworking and exotic furniture.',
                  style: JcTimberTheme.paragraphStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.8),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModuleCard({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.3),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Stack(
          children: [
            Positioned(
              right: -20,
              bottom: -20,
              child: Icon(
                icon,
                size: 140,
                color: Colors.white.withOpacity(0.1),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      icon,
                      color: Colors.white,
                      size: 28,
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 12,
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionsCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: JcTimberTheme.gray200, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: JcTimberTheme.darkBrown.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildQuickActionItem(
            context,
            icon: Icons.shopping_cart_outlined,
            label: 'My Cart',
            color: JcTimberTheme.darkBrown,
            onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CartScreen())),
          ),
          Divider(color: JcTimberTheme.gray200, height: 1, indent: 24, endIndent: 24),
          _buildQuickActionItem(
            context,
            icon: Icons.assignment_outlined,
            label: 'My Enquiries',
            color: JcTimberTheme.accentRed,
            onTap: () async {
              await Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const MyEnquiriesScreen()),
              );
              _load();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                label,
                style: JcTimberTheme.paragraphStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: JcTimberTheme.darkBrown,
                ),
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: JcTimberTheme.gray300),
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
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: JcTimberTheme.gray200),
        boxShadow: [
          BoxShadow(
            color: JcTimberTheme.darkBrown.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: JcTimberTheme.lightCream,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    _getWorkTypeIcon(enquiry.workType),
                    color: JcTimberTheme.darkBrown,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        enquiry.workType,
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${enquiry.requestedDate} at ${enquiry.requestedTime}',
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 14,
                          color: JcTimberTheme.gray500,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: _statusColor(enquiry.status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: _statusColor(enquiry.status).withOpacity(0.2),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: _statusColor(enquiry.status),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _formatStatus(enquiry.status),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: _statusColor(enquiry.status),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Divider(color: JcTimberTheme.gray200, height: 1),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Volume',
                      style: JcTimberTheme.paragraphStyle(
                        fontSize: 12,
                        color: JcTimberTheme.gray500,
                      ),
                    ),
                    Text(
                      '${enquiry.cubicFeet.toStringAsFixed(1)} cb ft',
                      style: JcTimberTheme.paragraphStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                if (enquiry.estimatedCost != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Est. Cost',
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 12,
                          color: JcTimberTheme.gray500,
                        ),
                      ),
                      Text(
                        '₹${enquiry.estimatedCost!.toStringAsFixed(0)}',
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: JcTimberTheme.darkBrown,
                        ),
                      ),
                    ],
                  ),
                if (canCancel)
                  FilledButton.tonal(
                    onPressed: onCancel,
                    style: FilledButton.styleFrom(
                      backgroundColor: JcTimberTheme.errorBg,
                      foregroundColor: JcTimberTheme.errorText,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      visualDensity: VisualDensity.compact,
                    ),
                    child: const Text('Cancel'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  IconData _getWorkTypeIcon(String workType) {
    final t = workType.toLowerCase();
    if (t.contains('cut') || t.contains('saw')) return Icons.carpenter_rounded;
    if (t.contains('plane') || t.contains('planing')) return Icons.format_paint_rounded;
    return Icons.handyman_rounded;
  }

  String _formatStatus(String status) {
    if (status == 'ENQUIRY_RECEIVED') return 'RECEIVED';
    if (status == 'TIME_ACCEPTED') return 'ACCEPTED';
    return status.replaceAll('_', ' ');
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'COMPLETED':
        return Colors.green.shade600;
      case 'CANCELLED':
        return JcTimberTheme.gray500;
      case 'SCHEDULED':
      case 'TIME_ACCEPTED':
        return Colors.blue.shade600;
      case 'ENQUIRY_RECEIVED':
      case 'UNDER_REVIEW':
        return Colors.orange.shade700;
      default:
        return JcTimberTheme.accentRed;
    }
  }
}
