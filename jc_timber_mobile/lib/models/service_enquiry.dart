class LogItem {
  final String woodType;
  final int numberOfLogs;
  final double thickness;
  final double width;
  final double length;
  final double cubicFeet;

  LogItem({
    required this.woodType,
    required this.numberOfLogs,
    this.thickness = 0,
    this.width = 0,
    this.length = 0,
    required this.cubicFeet,
  });

  Map<String, dynamic> toJson() => {
        'woodType': woodType,
        'numberOfLogs': numberOfLogs,
        'thickness': thickness,
        'width': width,
        'length': length,
        'cubicFeet': cubicFeet,
      };

  factory LogItem.fromJson(Map<String, dynamic> json) => LogItem(
        woodType: json['woodType'] ?? '',
        numberOfLogs: (json['numberOfLogs'] ?? 0) as int,
        thickness: (json['thickness'] ?? 0).toDouble(),
        width: (json['width'] ?? 0).toDouble(),
        length: (json['length'] ?? 0).toDouble(),
        cubicFeet: (json['cubicFeet'] ?? 0).toDouble(),
      );
}

class ServiceEnquiry {
  final String id;
  final String workType;
  final List<LogItem> logItems;
  final double cubicFeet;
  final int? processingHours;
  final String requestedDate;
  final String requestedTime;
  final String status;
  final double? estimatedCost;
  final String? customerName;
  final String? phoneNumber;
  final DateTime? createdAt;
  final String? notes;
  final String? adminNotes;
  final DateTime? acceptedDate;
  final String? acceptedStartTime;
  final String? acceptedEndTime;
  final DateTime? proposedDate;
  final String? proposedStartTime;
  final String? proposedEndTime;
  final DateTime? scheduledDate;
  final String? scheduledTime;
  final String? paymentStatus;
  final String? paymentMethod;
  final String? offlinePaymentNote;

  ServiceEnquiry({
    required this.id,
    required this.workType,
    required this.logItems,
    required this.cubicFeet,
    this.processingHours,
    required this.requestedDate,
    required this.requestedTime,
    required this.status,
    this.estimatedCost,
    this.customerName,
    this.phoneNumber,
    this.createdAt,
    this.notes,
    this.adminNotes,
    this.acceptedDate,
    this.acceptedStartTime,
    this.acceptedEndTime,
    this.proposedDate,
    this.proposedStartTime,
    this.proposedEndTime,
    this.scheduledDate,
    this.scheduledTime,
    this.paymentStatus,
    this.paymentMethod,
    this.offlinePaymentNote,
  });

  factory ServiceEnquiry.fromJson(Map<String, dynamic> json) {
    final logItemsRaw = json['logItems'] as List<dynamic>? ?? [];

     DateTime? _parseDate(dynamic v) {
      if (v == null) return null;
      try {
        return DateTime.parse(v.toString());
      } catch (_) {
        return null;
      }
    }

    return ServiceEnquiry(
      id: json['_id'] ?? json['id'] ?? '',
      workType: json['workType'] ?? '',
      logItems: logItemsRaw
          .map((e) => LogItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      cubicFeet: (json['cubicFeet'] ?? 0).toDouble(),
      processingHours: json['processingHours'] as int?,
      requestedDate: json['requestedDate'] != null
          ? (json['requestedDate'] is String
              ? json['requestedDate'] as String
              : DateTime.parse(json['requestedDate'].toString())
                  .toIso8601String()
                  .substring(0, 10))
          : '',
      requestedTime: json['requestedTime'] ?? '',
      status: json['status'] ?? '',
      estimatedCost: (json['estimatedCost'] as num?)?.toDouble(),
      customerName: json['customerName'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      createdAt: _parseDate(json['createdAt']),
      notes: json['notes'] as String?,
      adminNotes: json['adminNotes'] as String?,
      acceptedDate: _parseDate(json['acceptedDate']),
      acceptedStartTime: json['acceptedStartTime'] as String?,
      acceptedEndTime: json['acceptedEndTime'] as String?,
      proposedDate: _parseDate(json['proposedDate']),
      proposedStartTime: json['proposedStartTime'] as String?,
      proposedEndTime: json['proposedEndTime'] as String?,
      scheduledDate: _parseDate(json['scheduledDate']),
      scheduledTime: json['scheduledTime'] as String?,
      paymentStatus: json['paymentStatus'] as String?,
      paymentMethod: json['paymentMethod'] as String?,
      offlinePaymentNote: json['offlinePaymentNote'] as String?,
    );
  }
}
