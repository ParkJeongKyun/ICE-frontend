import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { getClientIp } from '@/utils/getClientIp';
import eventBus from '@/types/eventBus';

/**
 * IP 정보를 조회하고 표시하는 재사용 가능한 훅
 * API 호출, 다국어 포매팅, 클립보드 복사, 토스트 알림을 담당합니다.
 */
export const useShowIp = () => {
  const t = useTranslations();

  const showIp = useCallback(async () => {
    try {
      const ipInfo = await getClientIp();

      // 정보 키와 값의 매핑
      const infoMapping = [
        { key: 'ipInfo.address', value: ipInfo.ip },
        { key: 'ipInfo.hostname', value: ipInfo.hostname },
        { key: 'ipInfo.city', value: ipInfo.city },
        { key: 'ipInfo.region', value: ipInfo.region },
        { key: 'ipInfo.country', value: ipInfo.country },
        { key: 'ipInfo.location', value: ipInfo.loc },
        { key: 'ipInfo.organization', value: ipInfo.org },
        { key: 'ipInfo.timezone', value: ipInfo.timezone },
      ];

      // 값이 있는 것만 필터링하고 포맷팅
      const infoText = infoMapping
        .filter(({ value }) => value)
        .map(({ key, value }) => `${t(key)}: ${value}`)
        .join('\n');

      eventBus.emit('toast', {
        code: 'IP_FETCH_SUCCESS',
        message: infoText,
      });

      // IP만 클립보드에 복사
      await navigator.clipboard.writeText(ipInfo.ip);
      eventBus.emit('toast', {
        code: 'IP_COPIED',
      });
    } catch (error) {
      console.error('[useShowIp] IP fetch failed:', error);
      eventBus.emit('toast', {
        code: 'IP_FETCH_FAILED',
      });
    }
  }, [t]);

  return { showIp };
};
