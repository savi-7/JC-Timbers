/// Address model - matches backend Address schema.
class Address {
  final String id;
  final String fullName;
  final String mobileNumber;
  final String pincode;
  final String state;
  final String address;
  final String flatHouseCompany;
  final String city;
  final String landmark;
  final bool isDefault;
  final String addressType;

  Address({
    required this.id,
    required this.fullName,
    required this.mobileNumber,
    required this.pincode,
    required this.state,
    required this.address,
    required this.flatHouseCompany,
    required this.city,
    this.landmark = '',
    this.isDefault = false,
    this.addressType = 'Home',
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      fullName: json['fullName'] ?? '',
      mobileNumber: json['mobileNumber'] ?? '',
      pincode: json['pincode'] ?? '',
      state: json['state'] ?? '',
      address: json['address'] ?? '',
      flatHouseCompany: json['flatHouseCompany'] ?? '',
      city: json['city'] ?? '',
      landmark: json['landmark'] ?? '',
      isDefault: json['isDefault'] == true,
      addressType: json['addressType'] ?? 'Home',
    );
  }

  Map<String, dynamic> toJson() => {
        'fullName': fullName,
        'mobileNumber': mobileNumber,
        'pincode': pincode,
        'state': state,
        'address': address,
        'flatHouseCompany': flatHouseCompany,
        'city': city,
        'landmark': landmark,
        'isDefault': isDefault,
        'addressType': addressType,
      };
}
