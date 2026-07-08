import { getDistance } from "geolib";

export class GPSService {
  static OFFICE_LAT =
  Number(process.env.OFFICE_LAT);

static OFFICE_LNG =
  Number(process.env.OFFICE_LNG);

static ALLOWED_RADIUS =
  Number(process.env.OFFICE_RADIUS);
  

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
