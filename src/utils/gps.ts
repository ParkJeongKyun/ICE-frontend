import { ExifRow } from '@/types';

// Parse a rational GPS component string like "[43/1 28/1 2814/100]" into decimal degrees
export const parseRationalGPS = (data: string, ref: string): string => {
  try {
    const cleanRef = String(ref).replace(/[\[\]\s]/g, '');
    const parts = String(data).replace(/[\[\]]/g, '').split(/\s+/);
    if (parts.length < 3) return 'NaN';

    const values = parts.map((p) => {
      const [num, den] = p.split('/').map(Number);
      return num / den;
    });

    let decimal = values[0] + values[1] / 60 + values[2] / 3600;
    if (cleanRef === 'S' || cleanRef === 'W') decimal = -decimal;

    return decimal.toFixed(6);
  } catch (e) {
    return 'NaN';
  }
};

// Extract latitude/longitude from parsed EXIF rows (returns strings, 'NaN' if unavailable)
export const parseGPSFromRows = (rows: ExifRow[] | null | undefined): { lat: string; lng: string } => {
  if (!rows || !Array.isArray(rows)) return { lat: 'NaN', lng: 'NaN' };

  const gpsMap: Record<string, string> = {};
  rows.forEach(item => {
    if (item.tag && item.tag.startsWith('GPS')) gpsMap[item.tag] = item.data;
  });

  let lat = 'NaN';
  let lng = 'NaN';
  if (gpsMap.GPSLatitude && gpsMap.GPSLatitudeRef) {
    lat = parseRationalGPS(gpsMap.GPSLatitude, gpsMap.GPSLatitudeRef);
  }
  if (gpsMap.GPSLongitude && gpsMap.GPSLongitudeRef) {
    lng = parseRationalGPS(gpsMap.GPSLongitude, gpsMap.GPSLongitudeRef);
  }

  return { lat, lng };
};
