import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../theme/jc_timber_theme.dart';
import 'register_screen.dart';
import '../pages/home_page.dart';

/// Login Screen - exact UI/UX match to MERN LoginPage.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Email address is required';
    }
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.com$', caseSensitive: false).hasMatch(value.trim())) {
      return 'Invalid email format';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!RegExp(r'[a-z]').hasMatch(value)) return 'Password must contain at least one lowercase letter';
    if (!RegExp(r'[A-Z]').hasMatch(value)) return 'Password must contain at least one uppercase letter';
    if (!RegExp(r'\d').hasMatch(value)) return 'Password must contain at least one number';
    if (!RegExp(r'[@$!%*?&]').hasMatch(value)) return 'Password must contain at least one special character (@\$!%*?&)';
    return null;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _error = null;
      _loading = true;
    });
    final auth = context.read<AuthService>();
    final result = await auth.login(
      _emailController.text.trim(),
      _passwordController.text,
    );
    if (!mounted) return;
    setState(() => _loading = false);
    if (result.success) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomePage()),
      );
    } else {
      setState(() => _error = result.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header - matches MERN
              const SizedBox(height: 24),
              Center(
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [JcTimberTheme.darkBrown, JcTimberTheme.accentRed],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: JcTimberTheme.accentRed20, width: 4),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.lock_outline, color: JcTimberTheme.cream, size: 36),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Welcome Back',
                style: JcTimberTheme.headingStyle(fontSize: 28),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Sign in to your JC Timbers account',
                style: JcTimberTheme.paragraphStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: JcTimberTheme.darkBrown70,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              // Form card - bg-white/90, rounded-2xl, shadow
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: JcTimberTheme.gray200.withOpacity(0.5)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Email
                      Text(
                        'Email Address',
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          hintText: 'Enter your email address',
                          prefixIcon: Icon(Icons.email_outlined, color: JcTimberTheme.darkBrown60),
                          errorStyle: const TextStyle(color: JcTimberTheme.errorText),
                        ),
                        validator: _validateEmail,
                      ),
                      const SizedBox(height: 20),
                      // Password
                      Text(
                        'Password',
                        style: JcTimberTheme.paragraphStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          hintText: 'Enter your password',
                          prefixIcon: Icon(Icons.lock_outline, color: JcTimberTheme.darkBrown60),
                          errorStyle: const TextStyle(color: JcTimberTheme.errorText),
                        ),
                        validator: _validatePassword,
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: JcTimberTheme.errorBg,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline, color: JcTimberTheme.errorText, size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _error!,
                                  style: const TextStyle(color: JcTimberTheme.errorText, fontSize: 14),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      // Sign In button - gradient accent-red to dark-brown
                      Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [JcTimberTheme.accentRed, JcTimberTheme.darkBrown],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: JcTimberTheme.accentRed.withOpacity(0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: _loading ? null : _submit,
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              alignment: Alignment.center,
                              child: _loading
                                  ? const SizedBox(
                                      height: 24,
                                      width: 24,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: JcTimberTheme.cream,
                                      ),
                                    )
                                  : Text(
                                      'Sign In',
                                      style: JcTimberTheme.paragraphStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: JcTimberTheme.cream,
                                      ),
                                    ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Register link
                      Center(
                        child: TextButton(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const RegisterScreen()),
                            );
                          },
                          child: RichText(
                            text: TextSpan(
                              style: JcTimberTheme.paragraphStyle(
                                fontSize: 14,
                                color: JcTimberTheme.darkBrown70,
                              ),
                              children: [
                                const TextSpan(text: "Don't have an account? "),
                                TextSpan(
                                  text: 'Sign up',
                                  style: JcTimberTheme.paragraphStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: JcTimberTheme.accentRed,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
