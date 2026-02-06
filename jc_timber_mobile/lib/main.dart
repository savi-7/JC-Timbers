import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'auth/auth_service.dart';
import 'pages/home_page.dart';
import 'screens/login_screen.dart';
import 'theme/jc_timber_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final auth = AuthService();
  await auth.init(); // Load JWT from storage
  runApp(MyApp(auth: auth));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key, required this.auth});

  final AuthService auth;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: auth,
      child: MaterialApp(
        title: 'JC Timbers',
        debugShowCheckedModeBanner: false,
        theme: JcTimberTheme.theme,
        // Auto login: if JWT exists → Home, else → Login
        home: auth.isLoggedIn ? const HomePage() : const LoginScreen(),
      ),
    );
  }
}
