/// Result from GET /api/services/schedule/available/:date?duration=120
class AvailabilityResult {
  final bool isHoliday;
  final String? holidayName;
  final String? holidayDescription;
  final String? message;
  final List<TimeSlot> availableSlots;
  final List<TimeSlot> bookedSlots;

  AvailabilityResult({
    required this.isHoliday,
    this.holidayName,
    this.holidayDescription,
    this.message,
    required this.availableSlots,
    required this.bookedSlots,
  });

  factory AvailabilityResult.fromJson(Map<String, dynamic> json) {
    final avail = json['availableSlots'] as List<dynamic>? ?? [];
    final booked = json['bookedSlots'] as List<dynamic>? ?? [];
    return AvailabilityResult(
      isHoliday: json['isHoliday'] == true,
      holidayName: json['holidayName'] as String?,
      holidayDescription: json['holidayDescription'] as String?,
      message: json['message'] as String?,
      availableSlots: avail.map((e) => TimeSlot.fromJson(e as Map<String, dynamic>)).toList(),
      bookedSlots: booked.map((e) => TimeSlot.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }
}

class TimeSlot {
  final String startTime;
  final String endTime;

  TimeSlot({required this.startTime, required this.endTime});

  factory TimeSlot.fromJson(Map<String, dynamic> json) => TimeSlot(
        startTime: json['startTime'] ?? '',
        endTime: json['endTime'] ?? '',
      );

  @override
  String toString() => '$startTime - $endTime';
}
