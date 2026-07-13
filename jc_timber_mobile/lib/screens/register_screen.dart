import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../theme/jc_timber_theme.dart';
import 'login_screen.dart';

/// Register Screen - exact UI/UX match to MERN RegisterPage.
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _agreeToTerms = false;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String? _validateFirstName(String? v) {
    if (v == null || v.trim().isEmpty) return 'First name is required';
    if (v != v.trim()) return 'First name cannot have leading or trailing spaces';
    if (v.contains(' ')) return 'First name cannot contain spaces';
    if (v.length < 2) return 'First name must be at least 2 characters';
    if (!RegExp(r'^[a-zA-Z]+$').hasMatch(v)) return 'First name should only contain letters';
    return null;
  }

  String? _validateLastName(String? v) {
    if (v == null || v.trim().isEmpty) return 'Last name is required';
    if (v != v.trim()) return 'Last name cannot have leading or trailing spaces';
    if (v.contains(' ')) return 'Last name cannot contain spaces';
    if (v.length < 2) return 'Last name must be at least 2 characters';
    if (!RegExp(r'^[a-zA-Z]+$').hasMatch(v)) return 'Last name should only contain letters';
    return null;
  }

  String? _validateEmail(String? v) {
    if (v == null || v.trim().isEmpty) return 'Email address is required';
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.com$', caseSensitive: false).hasMatch(v.trim())) {
      return 'Invalid email format';
    }
    return null;
  }

  String? _validatePhone(String? v) {
    if (v == null || v.trim().isEmpty) return 'Phone number is required';
    final digits = v.replaceAll(RegExp(r'\D'), '');
    if (digits.length != 10) return 'Phone number must be exactly 10 digits';
    if (!RegExp(r'^[6-9]').hasMatch(digits)) return 'Phone number not in proper format';
    return null;
  }

  String? _validatePassword(String? v) {
    if (v == null || v.isEmpty) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    if (!RegExp(r'[a-z]').hasMatch(v)) return 'Password must contain at least one lowercase letter';
    if (!RegExp(r'[A-Z]').hasMatch(v)) return 'Password must contain at least one uppercase letter';
    if (!RegExp(r'\d').hasMatch(v)) return 'Password must contain at least one number';
    if (!RegExp(r'[@$!%*?&]').hasMatch(v)) return 'Password must contain at least one special character (@\$!%*?&)';
    return null;
  }

  String? _validateConfirmPassword(String? v) {
    if (v == null || v.isEmpty) return 'Please confirm your password';
    if (v != _passwordController.text) return 'Passwords do not match';
    return null;
  }

  Future<void> _submit() async {
    if (!_agreeToTerms) {
      setState(() => _error = 'You must agree to the terms & policy');
      return;
    }
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _error = null;
      _loading = true;
    });
    final auth = context.read<AuthService>();
    final name = '${_firstNameController.text.trim()} ${_lastNameController.text.trim()}';
    final phone = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    final result = await auth.register(
      name: name,
      email: _emailController.text.trim(),
      password: _passwordController.text,
      phone: phone.isEmpty ? null : phone,
    );
    if (!mounted) return;
    setState(() => _loading = false);
    if (result.success) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (r) => false,
      );
    } else {
      setState(() => _error = result.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: JcTimberTheme.darkBrown,
        title: Text(
          'Sign Up',
          style: JcTimberTheme.headingStyle(fontSize: 20),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
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
                  child: const Icon(Icons.person_add_outlined, color: JcTimberTheme.cream, size: 36),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Get Started Now',
                style: JcTimberTheme.headingStyle(fontSize: 26),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                'Create your JC Timbers account',
                style: JcTimberTheme.paragraphStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: JcTimberTheme.darkBrown70,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              // Form card
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
                      _buildLabel('First Name'),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _firstNameController,
                        decoration: InputDecoration(
                          hintText: 'Enter your first name',
                          prefixIcon: Icon(Icons.person_outline, color: JcTimberTheme.darkBrown60),
                          errorStyle: const TextStyle(color: JcTimberTheme.errorText),
                        ),
                        validator: _validateFirstName,
                      ),
                      const SizedBox(height: 16),
                      _buildLabel('Last Name'),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _lastNameController,
                        decoration: InputDecoration(
                          hintText: 'Enter your last name',
                          prefixIcon: Icon(Icons.person_outline, color: JcTimberTheme.darkBrown60),
                          errorStyle: const TextStyle(color: JcTimberTheme.errorText),
                        ),
                        validator: _validateLastName,
                      ),
                      const SizedBox(height: 16),
                      _buildLabel('Email Address'),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          hintText: 'Enter your email',
                          prefixIcon: Icon(Icons.email_outlined, color: JcTimberTheme.darkBrown60),
                          errorStyle: const TextStyle(color: JcTimberTheme.errorText),
                        ),
                        validator: _validateEmail,
                      ),
                      const SizedBox(height: 16),
                      _buildLabel('Phone Number'),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        decoration: InputDecoration(
                          hintText: 'Enter your phone number',
                          prefixIcon: Icon(Icons.phone_outlined, color: JcTimberTheme.darkBrown60),
                          errorStyle: const TextStyle(color: JcTimberTheme.errorText),
                        ),
                        validator: _validatePhone,
                        onChanged: (value) {
                          final digits = value.replaceAll(RegExp(r'\D'), '');
                          if (digits != value && digits.length <= 10) {
                            _phoneController.value = TextEditingValue(
                              text: digits,
                              selection: TextSelection.collapsed(offset: digits.length),
                            );
                          }
                        },
                      ),
                      const SizedBox(height: 16),
                      _buildLabel('Password'),
                      const SizedBox(height: 6),
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
                      const SizedBox(height: 16),
                      _buildLabel('Confirm Password'),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _confirmPasswordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          hintText: 'Confirm your password',
                          prefixIcon: Icon(Icons.lock_outline, color: JcTimberTheme.darkBrown60),
                          errorStyle: const TextStyle(color: JcTimberTheme.errorText),
                        ),
                        validator: _validateConfirmPassword,
                      ),
                      const SizedBox(height: 16),
                      // Terms checkbox
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            width: 24,
                            height: 24,
                            child: Checkbox(
                              value: _agreeToTerms,
                              onChanged: (v) => setState(() => _agreeToTerms = v ?? false),
                              activeColor: JcTimberTheme.accentRed,
                              fillColor: WidgetStateProperty.resolveWith((states) {
                                if (states.contains(WidgetState.selected)) return JcTimberTheme.accentRed;
                                return JcTimberTheme.darkBrown20;
                              }),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _agreeToTerms = !_agreeToTerms),
                              child: Text(
                                'I agree to the terms & policy',
                                style: JcTimberTheme.paragraphStyle(fontSize: 14),
                              ),
                            ),
                          ),
                        ],
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
                      // Sign Up button
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
                                      'Sign Up',
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
                      Center(
                        child: TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: RichText(
                            text: TextSpan(
                              style: JcTimberTheme.paragraphStyle(
                                fontSize: 14,
                                color: JcTimberTheme.darkBrown70,
                              ),
                              children: [
                                const TextSpan(text: 'Have an account? '),
                                TextSpan(
                                  text: 'Sign In',
                                  style: JcTimberTheme.paragraphStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: JcTimberTheme.darkBrown,
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

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: JcTimberTheme.paragraphStyle(fontSize: 14, fontWeight: FontWeight.w600),
    );
  }
}
