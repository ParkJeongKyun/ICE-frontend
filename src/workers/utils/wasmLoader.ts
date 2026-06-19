/**
 * WASM 로딩 및 캐싱 유틸리티
 */

const CACHE_NAME = 'ice-wasm-cache-v1';
const IS_DEV = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

/**
 * Cache API를 사용하여 WASM 파일을 로드하고 캐싱함
 */
export async function fetchWasmWithCache(path: string): Promise<Response> {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    // 1. 캐시 확인
    const cachedResponse = await cache.match(path);
    if (cachedResponse) {
      if (IS_DEV) console.log(`[WasmLoader] Cache hit: ${path}`);
      return cachedResponse;
    }

    if (IS_DEV) console.log(`[WasmLoader] Cache miss, fetching: ${path}`);

    // 2. 네트워크 요청
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM from ${path} (HTTP ${response.status})`);
    }

    // 3. 응답 복제 및 캐시 저장 (성공한 경우에만)
    // stale한 캐시 정리를 위해 현재 요청한 경로와 다른 동일 타입의 이전 캐시를 삭제하는 로직을 추가할 수 있음
    await cache.put(path, response.clone());
    
    // 4. 오래된 캐시 정리 (선택 사항: 파일 이름 패턴을 분석하여 구버전 삭제)
    // 여기서는 단순히 동일한 prefix를 가진 다른 파일을 찾아서 삭제함
    cleanupOldWasmCache(cache, path);

    return response;
  } catch (error) {
    console.warn(`[WasmLoader] Cache API error, falling back to fetch:`, error);
    return fetch(path);
  }
}

/**
 * 특정 WASM 파일의 캐시를 삭제함
 */
export async function deleteWasmCache(path: string): Promise<boolean> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const result = await cache.delete(path);
    if (IS_DEV) console.log(`[WasmLoader] Cache deleted for path: ${path}, result: ${result}`);
    return result;
  } catch (error) {
    console.error(`[WasmLoader] Failed to delete WASM cache for path: ${path}`, error);
    return false;
  }
}

/**
 * 동일한 용도의 구버전 WASM 캐시 삭제
 * 예: ice_core_260606.wasm 로드 시 ice_core_*.wasm 인 다른 캐시 삭제
 */
async function cleanupOldWasmCache(cache: Cache, currentPath: string) {
  try {
    const keys = await cache.keys();
    const currentFileName = currentPath.split('/').pop() || '';
    
    // 파일명 패턴 추출 (날짜 부분 제외)
    // ice_core_260606.wasm -> ice_core_
    const patternMatch = currentFileName.match(/^(.+?_)\d+\.wasm$/);
    if (!patternMatch) return;
    
    const prefix = patternMatch[1];

    for (const request of keys) {
      const url = new URL(request.url);
      const fileName = url.pathname.split('/').pop() || '';
      
      if (fileName.startsWith(prefix) && fileName !== currentFileName) {
        if (IS_DEV) console.log(`[WasmLoader] Cleaning up old cache: ${fileName}`);
        await cache.delete(request);
      }
    }
  } catch (e) {
    console.warn('[WasmLoader] Cache cleanup failed:', e);
  }
}
