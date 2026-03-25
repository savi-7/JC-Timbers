import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/auth_service.dart';
import '../../theme/jc_timber_theme.dart';
import '../login_screen.dart';
import 'machine_monitoring_screen.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthService>();
    final user = auth.user;

    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('Admin Dashboard', style: TextStyle(color: JcTimberTheme.cream)),
        backgroundColor: JcTimberTheme.darkBrown,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: JcTimberTheme.cream),
            onPressed: () async {
              await auth.logout();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome, ${user?.name ?? "Admin"}!',
              style: JcTimberTheme.headingStyle(fontSize: 24, color: JcTimberTheme.darkBrown),
            ),
            const SizedBox(height: 8),
            Text(
              'Select a management module below to view live data and control settings.',
              style: JcTimberTheme.paragraphStyle(fontSize: 16, color: JcTimberTheme.darkBrown70),
            ),
            const SizedBox(height: 32),
            _buildModuleCard(
              context,
              title: 'Machinery Monitoring',
              icon: Icons.precision_manufacturing,
              description: 'View live telemetry (temp, vibration) and historical readings.',
              onTap: () {
                Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => const MachineMonitoringScreen(),
                ));
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModuleCard(BuildContext context, {required String title, required IconData icon, required String description, required VoidCallback onTap}) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: const LinearGradient(
              colors: [Colors.white, Color(0xFFFAF9F6)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: JcTimberTheme.accentRed.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: JcTimberTheme.accentRed, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: JcTimberTheme.headingStyle(fontSize: 18, color: JcTimberTheme.darkBrown)),
                    const SizedBox(height: 4),
                    Text(description, style: JcTimberTheme.paragraphStyle(fontSize: 14, color: JcTimberTheme.darkBrown60)),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios, size: 16, color: JcTimberTheme.darkBrown60),
            ],
          ),
        ),
      ),
    );
  }
}
