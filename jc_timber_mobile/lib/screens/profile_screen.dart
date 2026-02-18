import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../theme/jc_timber_theme.dart';
import 'login_security_screen.dart';
import 'addresses_screen.dart';
import 'my_enquiries_screen.dart';

/// My Profile screen - matches MERN CustomerProfile: header + option cards.
/// Options: Login & Security, Address Management, My Service Requests.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  String _initials(String? name) {
    final trimmed = name?.trim();
    if (trimmed == null || trimmed.isEmpty) return 'JT';
    final parts = trimmed.split(RegExp(r'\s+'));
    final initials = parts.take(2).map((p) => p[0]).join();
    return initials.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final user = auth.user;

    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
        title: const Text('My Profile'),
      ),
      body: SafeArea(
        child: user == null
            ? const Center(
                child: Text('No user info available. Please log in again.'),
              )
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Profile header - matches MERN CustomerProfile
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: JcTimberTheme.gray200),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 32,
                            backgroundColor: JcTimberTheme.darkBrown,
                            child: Text(
                              _initials(user.name),
                              style: const TextStyle(
                                color: JcTimberTheme.cream,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user.name,
                                  style: JcTimberTheme.headingStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  user.email,
                                  style: JcTimberTheme.paragraphStyle(
                                    fontSize: 14,
                                    color: JcTimberTheme.darkBrown70,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.green.shade100,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    'Customer',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.green.shade800,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Profile options - matches MERN grid of cards
                    _ProfileOptionCard(
                      icon: Icons.lock_outline,
                      iconColor: Colors.blue,
                      title: 'Login & Security',
                      subtitle: 'Manage your account settings',
                      description:
                          'Update your personal information, email, mobile number, and password settings.',
                      buttonLabel: 'Manage Login & Security',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const LoginSecurityScreen(),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    _ProfileOptionCard(
                      icon: Icons.location_on_outlined,
                      iconColor: Colors.green,
                      title: 'Address Management',
                      subtitle: 'Manage your delivery addresses',
                      description:
                          'Add, edit, or remove your delivery addresses. Set default address for quick checkout.',
                      buttonLabel: 'Manage Addresses',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const AddressesScreen(),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    _ProfileOptionCard(
                      icon: Icons.event_note,
                      iconColor: Colors.purple,
                      title: 'My Service Requests',
                      subtitle: 'View your timber service enquiries',
                      description:
                          'Track your timber processing requests and view their status.',
                      buttonLabel: 'View My Service Requests',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const MyEnquiriesScreen(),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}

class _ProfileOptionCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final String description;
  final String buttonLabel;
  final VoidCallback onTap;

  const _ProfileOptionCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.buttonLabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, size: 24, color: iconColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: JcTimberTheme.paragraphStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: JcTimberTheme.paragraphStyle(
                        fontSize: 13,
                        color: JcTimberTheme.darkBrown70,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            description,
            style: JcTimberTheme.paragraphStyle(
              fontSize: 14,
              color: JcTimberTheme.darkBrown70,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: onTap,
              style: FilledButton.styleFrom(
                backgroundColor: JcTimberTheme.darkBrown,
                foregroundColor: JcTimberTheme.cream,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(buttonLabel),
            ),
          ),
        ],
      ),
    );
  }
}
