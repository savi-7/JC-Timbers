import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_service.dart';
import '../theme/jc_timber_theme.dart';

/// Login & Security screen - edit profile (name, email, phone) and change password.
/// Matches MERN "Login & Security" / login-security page.
class LoginSecurityScreen extends StatefulWidget {
  const LoginSecurityScreen({super.key});

  @override
  State<LoginSecurityScreen> createState() => _LoginSecurityScreenState();
}

class _LoginSecurityScreenState extends State<LoginSecurityScreen> {
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _currentPasswordController;
  late TextEditingController _newPasswordController;
  late TextEditingController _confirmPasswordController;

  bool _savingProfile = false;
  bool _savingPassword = false;
  String? _profileError;
  String? _profileSuccess;
  String? _passwordError;
  String? _passwordSuccess;

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthService>(context, listen: false);
    final user = auth.user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
    _currentPasswordController = TextEditingController();
    _newPasswordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    final auth = context.read<AuthService>();
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    if (name.isEmpty || email.isEmpty) {
      setState(() {
        _profileError = 'Name and email are required.';
        _profileSuccess = null;
      });
      return;
    }
    setState(() {
      _savingProfile = true;
      _profileError = null;
      _profileSuccess = null;
    });
    final result = await auth.updateProfile(
      name: name,
      email: email,
      phone: phone.isEmpty ? null : phone,
    );
    if (!mounted) return;
    setState(() {
      _savingProfile = false;
      if (result.success) {
        _profileSuccess = 'Profile updated successfully.';
        _profileError = null;
      } else {
        _profileError = result.error ?? 'Failed to update profile.';
        _profileSuccess = null;
      }
    });
  }

  Future<void> _changePassword() async {
    final auth = context.read<AuthService>();
    final current = _currentPasswordController.text;
    final newP = _newPasswordController.text;
    final confirm = _confirmPasswordController.text;
    if (current.isEmpty || newP.isEmpty) {
      setState(() {
        _passwordError = 'Current and new password are required.';
        _passwordSuccess = null;
      });
      return;
    }
    if (newP.length < 8) {
      setState(() {
        _passwordError = 'New password must be at least 8 characters.';
        _passwordSuccess = null;
      });
      return;
    }
    if (newP != confirm) {
      setState(() {
        _passwordError = 'New password and confirmation do not match.';
        _passwordSuccess = null;
      });
      return;
    }
    setState(() {
      _savingPassword = true;
      _passwordError = null;
      _passwordSuccess = null;
    });
    final result = await auth.changePassword(
      currentPassword: current,
      newPassword: newP,
    );
    if (!mounted) return;
    setState(() {
      _savingPassword = false;
      if (result.success) {
        _passwordSuccess = 'Password changed successfully.';
        _passwordError = null;
        _currentPasswordController.clear();
        _newPasswordController.clear();
        _confirmPasswordController.clear();
      } else {
        _passwordError = result.error ?? 'Failed to change password.';
        _passwordSuccess = null;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        backgroundColor: JcTimberTheme.darkBrown,
        foregroundColor: JcTimberTheme.cream,
        title: const Text('Login & Security'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _sectionTitle('Personal information'),
              const SizedBox(height: 12),
              _label('Name'),
              const SizedBox(height: 6),
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(hintText: 'Your full name'),
              ),
              const SizedBox(height: 16),
              _label('Email'),
              const SizedBox(height: 6),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(hintText: 'you@example.com'),
              ),
              const SizedBox(height: 16),
              _label('Phone'),
              const SizedBox(height: 6),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(hintText: 'Optional'),
              ),
              if (_profileError != null) ...[
                const SizedBox(height: 12),
                _messageBox(_profileError!, isError: true),
              ],
              if (_profileSuccess != null) ...[
                const SizedBox(height: 12),
                _messageBox(_profileSuccess!, isError: false),
              ],
              const SizedBox(height: 12),
              FilledButton(
                onPressed: _savingProfile ? null : _saveProfile,
                style: FilledButton.styleFrom(
                  backgroundColor: JcTimberTheme.darkBrown,
                  foregroundColor: JcTimberTheme.cream,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _savingProfile
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: JcTimberTheme.cream,
                        ),
                      )
                    : const Text('Save profile'),
              ),
              const SizedBox(height: 32),
              _sectionTitle('Change password'),
              const SizedBox(height: 12),
              _label('Current password'),
              const SizedBox(height: 6),
              TextField(
                controller: _currentPasswordController,
                obscureText: true,
                decoration: const InputDecoration(hintText: 'Enter current password'),
              ),
              const SizedBox(height: 16),
              _label('New password'),
              const SizedBox(height: 6),
              TextField(
                controller: _newPasswordController,
                obscureText: true,
                decoration: const InputDecoration(hintText: 'Enter new password'),
              ),
              const SizedBox(height: 16),
              _label('Confirm new password'),
              const SizedBox(height: 6),
              TextField(
                controller: _confirmPasswordController,
                obscureText: true,
                decoration: const InputDecoration(hintText: 'Confirm new password'),
              ),
              if (_passwordError != null) ...[
                const SizedBox(height: 12),
                _messageBox(_passwordError!, isError: true),
              ],
              if (_passwordSuccess != null) ...[
                const SizedBox(height: 12),
                _messageBox(_passwordSuccess!, isError: false),
              ],
              const SizedBox(height: 12),
              FilledButton(
                onPressed: _savingPassword ? null : _changePassword,
                style: FilledButton.styleFrom(
                  backgroundColor: JcTimberTheme.darkBrown,
                  foregroundColor: JcTimberTheme.cream,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _savingPassword
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: JcTimberTheme.cream,
                        ),
                      )
                    : const Text('Change password'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Text(
      text,
      style: JcTimberTheme.paragraphStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _label(String text) {
    return Text(
      text,
      style: JcTimberTheme.paragraphStyle(
        fontSize: 13,
        color: JcTimberTheme.darkBrown70,
      ),
    );
  }

  Widget _messageBox(String text, {required bool isError}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isError ? JcTimberTheme.errorBg : Colors.green.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isError ? JcTimberTheme.errorBorder : Colors.green.shade200,
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: isError ? JcTimberTheme.errorText : Colors.green.shade800,
          fontSize: 14,
        ),
      ),
    );
  }
}
