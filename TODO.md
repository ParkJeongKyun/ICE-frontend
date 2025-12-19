# 코드 리뷰 및 개선 제안 사항

https://reactbits.dev/get-started/index

## 🔴 심각한 문제 (Critical Issues)

### 1. **메모리 누수 및 Worker 관리 문제**

#### index.tsx

- **문제**: Worker cleanup이 TabDataContext에만 의존하고 있어, HexViewer 컴포넌트가 언마운트될 때 정리되지 않을 수 있음
- **위치**: 라인 ~600-700, Worker 이벤트 리스너 등록 부분
- **영향**: 탭을 빠르게 여러 번 전환하면 메모리 누수 발생 가능
- **제안**:
  - `useEffect cleanup`에서 Worker 이벤트 리스너를 명시적으로 제거
  - `searchCleanupRef`에 등록된 모든 cleanup을 컴포넌트 언마운트 시 실행

#### fileReader.worker.ts

- **문제**: WASM 인스턴스가 여러 번 초기화될 수 있음 (RELOAD_WASM 메시지 처리)
- **위치**: 라인 ~60-90, initWasm 함수
- **영향**: 메모리 누수, 예상치 못한 동작
- **제안**:
  - 이전 WASM 인스턴스를 명시적으로 정리하는 로직 추가
  - `wasmReady` 플래그를 atomic하게 관리

### 2. **Race Condition**

#### index.tsx

- **문제**: 검색 요청이 여러 번 발생할 때 이전 요청의 결과가 나중에 도착할 수 있음
- **위치**: 라인 ~650-750, `findAllByHex`, `findAllByAsciiText`
- **영향**: 검색 결과가 뒤섞일 수 있음
- **현재 해결**: `searchId`로 부분적으로 해결했으나, Worker에서 이전 검색을 취소하는 로직 누락
- **제안**:
  - Worker에 `CANCEL_SEARCH` 메시지를 보내 이전 검색 중단
  - 현재 `cancelSearch` 플래그는 있지만 `searchId`와 연동되지 않음

#### index.tsx

- **문제**: 파일 선택 중 다른 파일을 선택하면 이전 처리가 완료되지 않은 상태에서 새 파일 처리 시작
- **위치**: 라인 ~70-130, `handleFileChange`
- **제안**:
  - 처리 중인 파일이 있으면 새 파일 선택을 막거나
  - 이전 처리를 취소하는 로직 추가

---

## 🟡 성능 문제 (Performance Issues)

### 3. **렌더링 최적화**

#### index.tsx

- **문제**: `directRender` 함수가 매번 전체 화면을 다시 그림
- **위치**: 라인 ~330-450
- **영향**: 스크롤 시 CPU 사용량 높음
- **제안**:
  - Dirty rectangle 기법 사용 (변경된 영역만 다시 그리기)
  - 드래그 중에는 렌더링 품질을 낮추기 (현재 일부 구현되어 있음)
  - `OffscreenCanvas`를 재사용하고 있지만, 매번 전체를 지우고 다시 그림

#### index.tsx

- **문제**: `selectionInfo` 계산이 매 렌더링마다 실행됨
- **위치**: 라인 ~40-50
- **영향**: Footer 영역 불필요한 재계산
- **제안**:
  - 이미 `useMemo`를 사용 중이지만, 의존성이 너무 자주 변경됨
  - `startIndex`, `endIndex`가 실제로 변경될 때만 재계산되도록 의존성 최적화

### 4. **청크 관리 최적화**

#### index.tsx

- **문제**: 청크 캐시에 제한이 없어 메모리가 무한정 증가할 수 있음
- **위치**: `chunkCacheRef` 사용 부분
- **영향**: 큰 파일을 오래 탐색하면 메모리 부족
- **제안**:
  - LRU (Least Recently Used) 캐시 구현
  - 최대 캐시 크기 설정 (예: 50MB)
  - 오래된 청크 자동 제거

#### fileReader.worker.ts

- **문제**: Worker의 큐 시스템이 있지만, 우선순위만 있고 오래된 요청 취소 로직 없음
- **위치**: 라인 ~30-40, queue 관리
- **제안**:
  - 화면에서 벗어난 청크 요청은 취소하거나 우선순위 낮추기
  - 현재 화면 근처의 청크만 로드

### 5. **불필요한 리렌더링**

#### index.tsx

- **문제**: `contextValue`가 매번 새로 생성되어 모든 하위 컴포넌트 리렌더링
- **위치**: 라인 ~150-180
- **현재 상태**: 이미 `useMemo`로 감싸져 있음 ✅
- **추가 제안**:
  - 각 함수들도 `useCallback`으로 메모이제이션 (일부만 되어 있음)
  - `getNewKey`는 이미 `useCallback`이지만, `setEncoding` 같은 단순 setter는 불필요할 수 있음

#### index.tsx

- **문제**: `tabContents` 계산이 복잡하고 의존성이 많음
- **위치**: 라인 ~110-180
- **영향**: 드래그 중 불필요한 재계산
- **제안**:
  - 개별 Tab 컴포넌트로 분리하여 메모이제이션
  - 현재 모든 탭이 하나의 `useMemo`에 있어 하나만 변경되어도 전체 재계산

---

## 🟢 코드 품질 개선 (Code Quality)

### 6. **타입 안정성**

#### fileReader.worker.ts

- **문제**: `(self as any).Go`, `(self as any).searchFunc` 등 any 타입 사용
- **위치**: 라인 ~50-60
- **제안**:
  - WASM 관련 타입 정의 파일 생성
  - `declare global { interface Window { ... } }` 패턴 사용

#### index.tsx

- **문제**: `colorsRef.current!` 처럼 non-null assertion 사용
- **위치**: 여러 곳
- **제안**:
  - `colorsRef.current`가 null일 때 early return
  - 기본값 설정

### 7. **에러 처리 개선**

#### index.tsx

- **문제**: EXIF 처리 실패 시 에러만 로깅하고 사용자에게 명확한 피드백 부족
- **위치**: 라인 ~100-140
- **제안**:
  - 에러 타입별로 다른 메시지 표시
  - Retry 로직 추가
  - 부분 실패 처리 (EXIF는 실패해도 Hex 뷰어는 동작)

#### `/cmd/ice_app/main.go`

- **문제**: 에러 발생 시 단순히 error 문자열만 반환
- **위치**: 라인 ~40-60
- **제안**:
  - 에러 코드 추가 (예: `ERR_INVALID_FORMAT`, `ERR_READ_FAILED`)
  - 상세한 에러 정보 (어느 단계에서 실패했는지)

### 8. **상수 관리**

#### hexViewer.ts

- **문제**: 상수가 분리되어 있지만 일부는 컴포넌트 내부에 하드코딩
- **예시**:
  - `layout`, `layoutMobile` 객체가 HexViewer 내부에 있음
  - `MAX_COPY_SIZE`는 상수 파일에 있지만 `COPY_CHUNK_SIZE` 사용처에서 로직이 중복
- **제안**:
  - 모든 매직 넘버를 상수 파일로 이동
  - 관련 상수를 그룹화 (예: `LAYOUT`, `SEARCH`, `PERFORMANCE`)

### 9. **중복 코드 제거**

#### index.tsx

- **문제**: 복사 로직이 Hex와 Text에서 중복
- **위치**: 라인 ~570-610, `handleCopy` 함수
- **현재 상태**: 이미 통합되어 있음 ✅

#### fileReader.worker.ts

- **문제**: Boyer-Moore-Horspool 알고리즘이 Go와 TypeScript에 중복 구현
- **위치**: Go 파일과 Worker 파일
- **제안**:
  - WASM이 로드되지 않을 때만 JS fallback 사용
  - 두 구현의 동작이 정확히 일치하는지 테스트 필요

---

## 🔵 구조 개선 (Architecture)

### 10. **상태 관리 분리**

#### index.tsx

- **문제**: 너무 많은 책임 (탭 데이터, 선택, 스크롤, Worker 관리, 탭 순서)
- **제안**:
  - `TabDataContext`: 탭 기본 데이터만
  - `SelectionContext`: 선택 영역 관리
  - `WorkerContext`: Worker 캐시 관리
  - `ViewStateContext`: 스크롤, UI 상태

### 11. **컴포넌트 분리**

#### index.tsx

- **문제**: 800줄이 넘는 거대한 컴포넌트
- **제안**:
  - `HexCanvas`: 캔버스 렌더링 전용
  - `HexScrollbar`: 스크롤바 전용
  - `HexSelection`: 선택 영역 관리
  - `HexSearch`: 검색 로직
  - 각각을 커스텀 훅으로 분리 가능

#### index.tsx

- **문제**: Layout 파일이 비즈니스 로직과 UI가 섞여 있음
- **제안**:
  - `useFooterInfo` 훅으로 Footer 로직 분리
  - `useModalContent` 훅으로 Modal 로직 분리

### 12. **Go 코드 구조**

#### `/cmd/ice_app/main.go`

- **문제**: `searchPatternBMH` 함수가 main 패키지에 있음
- **제안**:
  - `internal/ice_search` 패키지로 분리
  - `internal/ice_exif`처럼 재사용 가능하게 구성
  - 테스트 코드 추가 용이

---

## 🟣 보안 및 안정성 (Security & Stability)

### 13. **파일 크기 제한**

#### index.tsx

- **문제**: 파일 크기 제한이 없음
- **영향**: 수 GB 파일을 열면 브라우저 크래시
- **제안**:
  - 최대 파일 크기 설정 (예: 500MB)
  - 큰 파일은 경고 메시지 표시
  - 스트리밍 방식으로 처리

### 14. **WASM 타임아웃 처리**

#### fileReader.worker.ts

- **문제**: WASM 초기화 타임아웃이 5초로 짧음
- **위치**: 라인 ~70
- **제안**:
  - 느린 네트워크를 고려해 10초로 증가
  - Retry 로직 추가
  - 진행 상황 표시

### 15. **입력 검증**

#### index.tsx

- **문제**: 검색어 길이 제한만 있고 패턴 검증 부족
- **위치**: 라인 ~130-150
- **제안**:
  - Hex 검색: 유효한 hex 문자열인지 검증 강화
  - ASCII 검색: 특수문자 이스케이프 처리
  - 너무 짧은 패턴(1-2바이트) 경고

---

## 📊 모니터링 및 디버깅

### 16. **성능 측정**

#### index.tsx

- **현재 상태**: 개발 모드에서만 렌더링 시간 측정 ✅
- **추가 제안**:
  - 청크 로드 시간 측정
  - 검색 성능 측정
  - 평균 FPS 모니터링

### 17. **로깅 개선**

#### 전반적으로

- **문제**: console.log가 산발적으로 사용됨
- **제안**:
  - 로깅 레벨 시스템 (ERROR, WARN, INFO, DEBUG)
  - 프로덕션에서는 ERROR만 출력
  - 구조화된 로그 (타임스탬프, 컴포넌트명, 이벤트명)

---

## 🎯 우선순위 정리

### High Priority (즉시 수정 필요)

1. **메모리 누수** (#1)
2. **Race Condition** (#2)
3. **청크 캐시 무제한 증가** (#4)
4. **파일 크기 제한 없음** (#13)

### Medium Priority (다음 스프린트)

5. **렌더링 최적화** (#3)
6. **에러 처리 개선** (#7)
7. **상태 관리 분리** (#10)
8. **컴포넌트 분리** (#11)

### Low Priority (점진적 개선)

9. **타입 안정성** (#6)
10. **중복 코드 제거** (#9)
11. **로깅 개선** (#17)

---

## 💡 추가 제안

### 18. **테스트 코드**

- 현재 테스트 코드가 없어 보임
- 핵심 로직(검색, 청크 관리, WASM 통신)에 대한 단위 테스트 추가
- E2E 테스트로 주요 시나리오 검증

### 19. **접근성 (a11y)**

- 키보드 네비게이션 개선
- 스크린 리더 지원
- ARIA 속성 추가

### 20. **Progressive Enhancement**

- WASM 미지원 브라우저 대응
- 현재는 JS fallback이 있지만 명시적 안내 없음
- Service Worker로 오프라인 지원 고려
