import { getDistance } from "geolib";

export class GPSService {
  static OFFICE_LAT = 26.8467;
  static OFFICE_LNG = 80.9462;

  static ALLOWED_RADIUS = 50;

  static validateLocation(
    latitude: number,
    longitude: number
  ) {
    const distance = getDistance(
      {
        latitude,
        longitude,
      },
      {
        latitude: this.OFFICE_LAT,
        longitude: this.OFFICE_LNG,
      }
    );

    return {
      distance,
      valid:
        distance <=
        this.ALLOWED_RADIUS,
    };
  }
}
