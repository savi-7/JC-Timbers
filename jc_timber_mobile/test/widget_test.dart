// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:jc_timber_mobile/main.dart';
import 'package:jc_timber_mobile/auth/auth_service.dart';

void main() {
  testWidgets('App loads smoke test', (WidgetTester tester) async {
    final auth = AuthService();
    await tester.pumpWidget(MyApp(auth: auth));

    // Wait for splash screen or any initial widget
    await tester.pumpAndSettle();
    
    // Test passes if no exception is thrown
    expect(auth, isNotNull);
  });
}
