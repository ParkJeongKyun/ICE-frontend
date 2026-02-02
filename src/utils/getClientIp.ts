/**
 * ipinfo.io API 응답 타입
 */
export interface IpInfoData {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  timezone?: string;
  [key: string]: any;
}

/**
 * 사용자의 외부 IP 및 위치 정보 조회
 * ipinfo.io API를 통해 클라이언트 IP와 상세 정보를 조회합니다
 */
export async function getClientIp(): Promise<IpInfoData> {
  try {
    const response = await fetch('https://ipinfo.io/json');
    if (!response.ok) {
      throw new Error('Failed to fetch IP info');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching client IP info:', error);
    throw error;
  }
}
