import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../../auth/auth_service.dart';
import '../../config/api_config.dart';
import '../../theme/jc_timber_theme.dart';

class MachineMonitoringScreen extends StatefulWidget {
  const MachineMonitoringScreen({super.key});

  @override
  State<MachineMonitoringScreen> createState() => _MachineMonitoringScreenState();
}

class _MachineMonitoringScreenState extends State<MachineMonitoringScreen> {
  List<dynamic> _machines = [];
  bool _isLoading = true;
  String? _error;
  Timer? _pollingTimer;

  // Track expanded state for historical data
  final Set<String> _expandedMachines = {};
  // Cache for historical reading data per machine id
  final Map<String, List<dynamic>> _historicalReadings = {};

  @override
  void initState() {
    super.initState();
    _fetchMachines();
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (_) => _fetchMachines(isPolling: true));
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchMachines({bool isPolling = false}) async {
    if (!isPolling && _machines.isEmpty) {
      if (mounted) setState(() { _isLoading = true; _error = null; });
    }

    try {
      final auth = context.read<AuthService>();
      final res = await http.get(
        Uri.parse(ApiConfig.machineryMachines),
        headers: auth.authHeaders,
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (mounted) {
          setState(() {
            _machines = data['machines'] ?? [];
            _isLoading = false;
          });
        }
        
        // Fetch history for expanded machines
        for (var m in _machines) {
          final mId = m['machineId'];
          if (_expandedMachines.contains(mId)) {
            _fetchHistory(mId);
          }
        }
      } else {
        if (!isPolling && mounted) setState(() => _error = 'Failed to fetch machines');
      }
    } catch (e) {
      if (!isPolling && mounted) setState(() => _error = e.toString());
    }
  }

  Future<void> _fetchHistory(String machineId) async {
    try {
      final auth = context.read<AuthService>();
      final res = await http.get(
        Uri.parse('${ApiConfig.machineReadings(machineId)}?limit=10'),
        headers: auth.authHeaders,
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (mounted) {
          setState(() {
            _historicalReadings[machineId] = data['readings'] ?? [];
          });
        }
      }
    } catch (_) {}
  }

  bool _isOverThreshold(Map<String, dynamic> m) {
    num temp = m['lastTemperature'] ?? 0;
    num vib = m['lastVibration'] ?? 0;
    num tempThr = m['tempThreshold'] ?? 80;
    num vibThr = m['vibrationThreshold'] ?? 10;
    return temp > tempThr || vib > vibThr;
  }

  bool _isMachineOn(Map<String, dynamic> m) {
    if (m['lastReadingAt'] == null) return false;
    final lastTime = DateTime.parse(m['lastReadingAt']);
    return DateTime.now().difference(lastTime).inSeconds < 120; // 2 minutes
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JcTimberTheme.cream,
      appBar: AppBar(
        title: const Text('Live Telemetry & Alerts', style: TextStyle(color: JcTimberTheme.cream)),
        backgroundColor: JcTimberTheme.darkBrown,
        iconTheme: const IconThemeData(color: JcTimberTheme.cream),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _fetchMachines(),
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: JcTimberTheme.accentRed));
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: JcTimberTheme.accentRed, size: 48),
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: JcTimberTheme.darkBrown)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => _fetchMachines(),
              style: ElevatedButton.styleFrom(backgroundColor: JcTimberTheme.accentRed),
              child: const Text('Retry', style: TextStyle(color: Colors.white)),
            )
          ],
        ),
      );
    }
    if (_machines.isEmpty) {
      return Center(
        child: Text('No operational nodes detected.', style: JcTimberTheme.paragraphStyle(color: JcTimberTheme.darkBrown70)),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _machines.length,
      itemBuilder: (context, index) {
        final m = _machines[index];
        final bool over = _isOverThreshold(m);
        final bool isOn = _isMachineOn(m);
        final String mId = m['machineId'];
        final bool isExpanded = _expandedMachines.contains(mId);

        return Card(
          elevation: over ? 8 : 2,
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(
              color: over ? JcTimberTheme.accentRed.withOpacity(0.5) : Colors.transparent,
              width: 2,
            ),
          ),
          child: Column(
            children: [
              // Card Header
              ListTile(
                contentPadding: const EdgeInsets.all(16),
                title: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        m['name'] ?? mId,
                        style: JcTimberTheme.headingStyle(fontSize: 18, color: JcTimberTheme.darkBrown),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: over ? JcTimberTheme.errorBg : (isOn ? Colors.green.shade50 : Colors.grey.shade100),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: over ? JcTimberTheme.errorText : (isOn ? Colors.green.shade200 : Colors.grey.shade300),
                        )
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            over ? Icons.warning_amber_rounded : (isOn ? Icons.check_circle_outline : Icons.power_settings_new),
                            size: 14,
                            color: over ? JcTimberTheme.errorText : (isOn ? Colors.green.shade700 : Colors.grey.shade600),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            over ? 'ALERT' : (isOn ? 'ONLINE' : 'OFFLINE'),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: over ? JcTimberTheme.errorText : (isOn ? Colors.green.shade700 : Colors.grey.shade600),
                            ),
                          )
                        ],
                      ),
                    ),
                  ],
                ),
                subtitle: Padding(
                  padding: const EdgeInsets.only(top: 16.0),
                  child: Column(
                    children: [
                      _buildMetricBar(
                        icon: Icons.thermostat,
                        label: 'Temperature',
                        value: m['lastTemperature'] ?? 0,
                        max: m['tempThreshold'] ?? 80,
                        unit: '°C',
                        color: Colors.blue,
                        alertColor: JcTimberTheme.errorText,
                      ),
                      const SizedBox(height: 16),
                      _buildMetricBar(
                        icon: Icons.vibration,
                        label: 'Vibration',
                        value: m['lastVibration'] ?? 0,
                        max: m['vibrationThreshold'] ?? 10,
                        unit: '',
                        color: Colors.amber.shade700,
                        alertColor: JcTimberTheme.errorText,
                      ),
                    ],
                  ),
                ),
              ),
              // Expand Historical Data Button
              InkWell(
                onTap: () {
                  setState(() {
                    if (isExpanded) {
                      _expandedMachines.remove(mId);
                    } else {
                      _expandedMachines.add(mId);
                      _fetchHistory(mId);
                    }
                  });
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(16),
                      bottomRight: Radius.circular(16),
                    ),
                    border: Border(top: BorderSide(color: Colors.grey.shade200)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        isExpanded ? 'Hide Recent Logs' : 'View Recent Logs',
                        style: TextStyle(color: JcTimberTheme.darkBrown60, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, size: 16, color: JcTimberTheme.darkBrown60),
                    ],
                  ),
                ),
              ),
              // Expanded Logs View
              if (isExpanded) _buildHistoricalData(mId),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMetricBar({
    required IconData icon,
    required String label,
    required num value,
    required num max,
    required String unit,
    required Color color,
    required Color alertColor,
  }) {
    final bool isAlert = value > max;
    final double percent = (value / max).clamp(0.0, 1.0).toDouble();
    
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(icon, size: 16, color: Colors.grey.shade600),
                const SizedBox(width: 8),
                Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
              ],
            ),
            Row(
              children: [
                Text('${value.toStringAsFixed(1)}$unit', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isAlert ? alertColor : JcTimberTheme.darkBrown)),
                Text(' / ${max.toStringAsFixed(0)} max', style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: percent,
            minHeight: 8,
            backgroundColor: Colors.grey.shade200,
            valueColor: AlwaysStoppedAnimation<Color>(isAlert ? alertColor : color),
          ),
        ),
      ],
    );
  }

  Widget _buildHistoricalData(String machineId) {
    if (!_historicalReadings.containsKey(machineId)) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Center(child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))),
      );
    }
    
    final reads = _historicalReadings[machineId]!;
    if (reads.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Center(child: Text('No history found', style: TextStyle(color: Colors.grey, fontSize: 12))),
      );
    }

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 8),
      height: 150,
      child: ListView.separated(
        shrinkWrap: true,
        itemCount: reads.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final r = reads[index];
          final date = DateTime.parse(r['timestamp']).toLocal();
          final timeStr = '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}:${date.second.toString().padLeft(2, '0')}';
          
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(timeStr, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                Row(
                  children: [
                    Text('T: ${r['temperature'] ?? '-'}°', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blue)),
                    const SizedBox(width: 12),
                    Text('V: ${r['vibration'] ?? '-'}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.amber.shade700)),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
