import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../pages/home_page.dart';
import '../theme/jc_timber_theme.dart';
import 'login_screen.dart';

/// Splash screen with JC Timbers logo and slogan.
/// Shown on app launch, then navigates to Home or Login.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  static const String _slogan = 'Crafted Wood, Complete Comfort.';
  static const Duration _duration = Duration(milliseconds: 2200);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _goNext());
  }

  void _goNext() async {
    await Future.delayed(_duration);
    if (!mounted) return;
    final auth = context.read<AuthService>();
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => auth.isLoggedIn ? const HomePage() : const LoginScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Match native splash background (same as logo)
    const bgColor = Color(0xFFF5F5F5);
    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Image.asset(
                    'assets/logo.png',
                    height: 120,
                    width: 120,
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => Icon(
                      Icons.forest,
                      size: 80,
                      color: JcTimberTheme.darkBrown,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Brand name
                Text(
                  'JC Timbers & Furniture',
                  textAlign: TextAlign.center,
                  style: JcTimberTheme.headingStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: JcTimberTheme.darkBrown,
                  ),
                ),
                const SizedBox(height: 8),
                // Slogan
                Text(
                  _slogan,
                  textAlign: TextAlign.center,
                  style: JcTimberTheme.paragraphStyle(
                    fontSize: 15,
                    color: JcTimberTheme.darkBrown.withOpacity(0.85),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
