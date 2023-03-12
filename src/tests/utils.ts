type Coords = {
  lat: number;
  long: number;
};

export function addKilometersToCoords(kilometersToAdd: number, coords: Coords) {
  const EARTH_RADIUS_IN_KILOMETERS = 6378.137;
  const ONE_METER_IN_DEGREES =
    1 / (((2 * Math.PI) / 360) * EARTH_RADIUS_IN_KILOMETERS) / 1000;

  const valuePerCoordinate = (kilometersToAdd * 1000) / 1.3;

  const newLatitude = coords.lat + valuePerCoordinate * ONE_METER_IN_DEGREES;
  const newLongitude =
    coords.long +
    (valuePerCoordinate * ONE_METER_IN_DEGREES) /
      Math.cos(newLatitude * (Math.PI / 180));

  return {
    lat: newLatitude,
    long: newLongitude,
  };
}
