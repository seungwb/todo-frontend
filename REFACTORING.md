# Frontend 리팩토링 내역

> 분석 일자: 2026-03-25
> 대상 프로젝트: todo-frontend (React + TypeScript + Vite)

---

## 1. [Critical] DTO가 잘못된 타입을 상속 (브라우저 `Response` 오용)

- **변경 파일**:
  - `src/apis/response/get-today-schedule-index.response.dto.ts`
  - `src/apis/response/get-weekly-schedule-index.response.dto.ts`
- **문제**: `GetTodayScheduleIndexResponseDto`와 `GetWeeklyScheduleIndexResponseDto`가 `extends ResponseDto` 대신 `extends Response`(브라우저 내장 Fetch API의 `Response` 타입)를 상속하고 있었음. 이는 완전히 잘못된 타입이며, `.code`, `.message` 필드가 없어 런타임 응답 처리 로직이 정상 동작하지 않을 수 있음.
- **수정**: 두 파일 모두 `import ResponseDto from "./response.dto"` 를 추가하고 `extends Response` → `extends ResponseDto` 로 변경.

---

## 2. [Critical] `axios` 에러 핸들링에서 `error.response` 가 `undefined`일 때 런타임 오류

- **변경 파일**: `src/apis/index.ts`
- **문제**: 기존 모든 API 함수에서 `.catch(error => { const responseBody: ResponseDto = error.response.data; return responseBody; })` 패턴을 사용했으나, 네트워크 완전 단절이나 CORS 오류 등으로 `error.response`가 `undefined`인 경우 `Cannot read properties of undefined (reading 'data')` 런타임 오류 발생.
- **수정**:
  - `axios.create()`로 공통 `apiClient` 인스턴스 생성 (`baseURL: API_DOMAIN` 적용)
  - 공통 `apiCall<T>()` 래퍼 함수 도입: `axios.isAxiosError(error) && error.response` 조건으로 안전하게 에러 처리
  - 기존 중복된 `.then().catch()` 블록 제거 및 `async/await` 패턴으로 일관성 통일
  - `WHETHER_API_KEY` 오타 → `WEATHER_API_KEY` 로 변수명 수정

---

## 3. [High] `cookie.ts` - 파라미터 타입 누락 (`any` 묵시적 사용)

- **변경 파일**: `src/utils/cookie.ts`
- **문제**: `getCookie(name)`, `deleteCookie(name)` 함수의 파라미터에 타입 어노테이션이 없어 TypeScript `noImplicitAny` 설정 시 컴파일 오류 발생. 반환 타입도 명시되지 않음.
- **수정**:
  - `getCookie(name: string): string | null`
  - `deleteCookie(name: string): void`
  - `for let` → `for const` 로 변경 (재할당 없는 루프 변수)

---

## 4. [High] `Loader2` 컴포넌트 - `any` 타입 사용

- **변경 파일**: `src/components/Loader2/index.tsx`
- **문제**: `function Loader2(props: any)` — `any` 타입 사용으로 타입 안전성 없음. 또한 이미 `lucide-react`에 `Loader2`가 있는데 동일한 SVG를 재정의하는 중복 컴포넌트.
- **수정**: `SVGProps<SVGSVGElement>` 타입으로 변경하여 SVG 컴포넌트 props에 적합한 타입 부여. (컴포넌트 자체는 현재 일부 뷰에서 직접 import하므로 유지)

---

## 5. [High] `types/interface/index.ts` - `TodoListItems` export 누락

- **변경 파일**: `src/types/interface/index.ts`
- **문제**: `ScheduleListItems`만 re-export 되고 `TodoListItems`는 누락되어 있었음. 각 컴포넌트가 직접 경로(`../types/interface/todo-list-items.interface`)로 import하는 회피책을 사용 중.
- **수정**: `TodoListItems` 를 index.ts에 추가 export. 이후 컴포넌트에서 `from "../types/interface"` 하나의 경로로 통합 가능.

---

## 6. [High] `ScheduleModal` - 응답 코드 매직 스트링 하드코딩

- **변경 파일**: `src/components/ScheduleModal/index.tsx`
- **문제**: `if (code === "DBE")`, `if (code === "VF" || code === "NU")`, `if (code === "NS")`, `if (code !== "SU")` 등 ResponseCode enum을 사용하지 않고 매직 스트링을 직접 비교. 오타나 enum 값 변경 시 버그 발생 위험. 또한 `ResponseCode` import가 누락되어 있었음.
- **수정**: `ResponseCode` enum import 추가 후 모든 문자열 비교를 `ResponseCode.DATABASE_ERROR`, `ResponseCode.VALIDATION_FAILED`, `ResponseCode.NOT_EXISTED_USER`, `ResponseCode.NOT_EXISTED_SCHEDULE`, `ResponseCode.SUCCESS` 로 교체.

---

## 7. [High] `views/index.tsx` - `Record<string, unknown>` 남용 및 불안전한 타입 캐스팅

- **변경 파일**: `src/views/index.tsx`
- **문제**: 날씨 데이터를 `Record<string, unknown> | null`로 관리하여 접근 시 `(weather.main as Record<string, unknown>)?.temp as string`, `((weather.weather as unknown[])?.[0] as Record<string, unknown>)?.description as string` 등 복잡한 다중 캐스팅 필요. 타입 안전성 없음.
- **수정**: `WeatherData` 인터페이스(`name: string`, `main: { temp: number }`, `weather: { description: string }[]`) 를 컴포넌트 파일 내 정의하고 `useState<WeatherData | null>(null)` 로 변경. 렌더링 시 `weather.main?.temp`, `weather.weather?.[0]?.description`, `weather.name` 으로 단순화.

---

## 8. [High] `Authentication/index.tsx` - `console.log`를 통한 민감 정보 노출

- **변경 파일**: `src/views/Authentication/index.tsx`
- **문제**: `FindPasswordCard`의 `findPasswordResponse` 함수에서 인증코드 발송 성공 시 `console.log(email + "로 인증코드를 발송하였습니다.")` 호출. 이메일 주소가 브라우저 개발자 도구 콘솔에 노출됨. 사용자에게도 피드백이 전달되지 않는 UX 문제.
- **수정**: `console.log` → `alert` 로 변경하여 사용자에게 발송 완료 메시지 표시.

---

## 9. [Medium] `views/index.tsx` - 날짜 타입 불일치 (상태에 string 저장)

- **변경 파일**: `src/views/index.tsx`
- **문제**: `ScheduleListItems` 인터페이스의 `startDate`, `endDate`, `regDate`는 `Date` 타입인데, `fetchTodayEvents`와 `fetchWeeklyEvents`에서 `.toLocaleDateString("ko-KR")` 변환 후 상태에 저장하여 타입 불일치 발생. 이후 렌더링에서 `String(schedule.startDate)` 로 다시 문자열 변환하는 이중 변환 존재.
- **수정**: 데이터를 원본 그대로(`ScheduleListItems[]`) 상태에 저장하고, 렌더링 시점에 `new Date(schedule.startDate).toLocaleDateString("ko-KR")` 포맷 적용.

---

## 10. [Medium] `views/index.tsx` - list key에 배열 인덱스 사용

- **변경 파일**: `src/views/index.tsx`
- **문제**: `todaySchedules.map((schedule, index) => <li key={index}>...)`, `todos.map((todo, index) => <li key={index}>...)`, `thisWeekSchedules.map((schedule, index) => <li key={index}>...)` 에서 배열 인덱스를 key로 사용. 항목 추가/삭제/재정렬 시 React의 재조정(reconciliation)이 잘못 동작할 수 있음.
- **수정**: `key={schedule.id}`, `key={todo.id}` 로 고유 id 사용.

---

## 11. [Medium] `views/index.tsx` - 중복 `TodoListItems` import 구문

- **변경 파일**: `src/views/index.tsx`
- **문제**: `import type { ScheduleListItems } from "../types/interface"` 와 `import type { TodoListItems } from "../types/interface"` 가 별도 라인으로 나뉘어 있었음.
- **수정**: 두 import를 `import type { ScheduleListItems, TodoListItems } from "../types/interface"` 로 합쳐 단일 import 구문으로 통합. (`types/interface/index.ts` 의 `TodoListItems` export 누락 수정과 연계)

---

## 12. [Medium] `views/Schedule/index.tsx` - 불필요한 타입 캐스팅

- **변경 파일**: `src/views/Schedule/index.tsx`
- **문제**: `const { scheduleListItems } = responseBody as { scheduleListItems: ScheduleListItems[] }` — `GetScheduleResponseDto` 타입을 import하고도 as로 새 구조체 타입을 재정의하는 불필요한 캐스팅. 또한 `responseBody`가 `null`이 아님을 보장한 후 별도 타입 가드 없이 구조분해.
- **수정**: `if (!responseBody || !("scheduleListItems" in responseBody)) return` 타입 가드 추가 후 `responseBody as GetScheduleResponseDto` 로 명확한 캐스팅.

---

## 13. [Medium] `views/Schedule/index.tsx` - useEffect 빈 의존성 배열 (eslint 비활성화 주석 추가)

- **변경 파일**: `src/views/Schedule/index.tsx`
- **문제**: `useEffect(() => { fetchEvents().then() }, [])` 에서 불필요한 `.then()` 체이닝. `fetchEvents`는 이미 async 함수라 `.then()` 호출이 의미 없는 빈 체이닝.
- **수정**: `fetchEvents()` 로 변경. `eslint-disable-next-line react-hooks/exhaustive-deps` 주석 추가.

---

## 14. [Medium] `views/Todo/index.tsx` - useEffect 불필요한 `.then()` 체이닝

- **변경 파일**: `src/views/Todo/index.tsx`
- **문제**: `fetchEvents().then()` — 위와 동일한 불필요한 `.then()` 체이닝.
- **수정**: `fetchEvents()` 로 변경. `eslint-disable-next-line react-hooks/exhaustive-deps` 주석 추가.

---

## 15. [Medium] `views/Todo/index.tsx` - 불안전한 타입 가드 없는 구조분해

- **변경 파일**: `src/views/Todo/index.tsx`
- **문제**: `if (!responseBody) { ... return }` 이후 `const { todoListItems } = responseBody as GetTodoResponseDto` 강제 캐스팅. `responseBody`가 `ResponseDto`(todoListItems 없음) 타입일 수도 있으나 타입 가드 없이 캐스팅.
- **수정**: `if (!responseBody || !("todoListItems" in responseBody)) { ... return }` 으로 안전한 타입 가드 추가, `as GetTodoResponseDto` 캐스팅 제거.

---

## 16. [Medium] `Authentication/index.tsx` - 미사용 `cookies` 변수

- **변경 파일**: `src/views/Authentication/index.tsx`
- **문제**: `SignInCard` 컴포넌트에서 `const [cookies, setCookie] = useCookies()` 로 `cookies`를 구조분해 했으나 실제로 `cookies`는 사용되지 않고 `setCookie`만 사용.
- **수정**: `const [, setCookie] = useCookies()` 로 변경하여 미사용 변수 제거.

---

## 17. [Medium] `components/TodoListItem/index.tsx` - 오타 메시지 ("일정" → "할일")

- **변경 파일**: `src/components/TodoListItem/index.tsx`
- **문제**: `deleteTodoResponse` 에서 `ResponseCode.NOT_EXISTED_TODO` 케이스의 alert 메시지가 `"이미 삭제된 일정입니다."` 로 되어 있어 Todo 삭제 시 "일정"이라는 잘못된 도메인 용어 사용.
- **수정**: `"이미 삭제된 할일입니다."` 로 정정.

---

## 18. [Medium] `components/TodoListItem/index.tsx` - `React` namespace import 없이 `React.MouseEvent` 사용

- **변경 파일**: `src/components/TodoListItem/index.tsx`
- **문제**: `import { useState } from "react"` 에서 `React` 네임스페이스를 import하지 않았으나, `onToggleHandler = (e: React.MouseEvent)` 에서 `React.MouseEvent` 타입을 사용하려 함.
- **수정**: `import { type MouseEvent, useState } from "react"` 로 변경 후 파라미터 타입을 `MouseEvent` 로 수정.

---

## 19. [Medium] `components/InputBox/index.tsx` - 미사용 `React` 네임스페이스 import

- **변경 파일**: `src/components/InputBox/index.tsx`
- **문제**: `import React, { type ChangeEvent, type KeyboardEvent, useState } from "react"` 에서 `React` 네임스페이스를 import하나 `React.forwardRef`를 사용. React 17+의 JSX Transform 환경에서는 `React` 네임스페이스 import가 불필요하며, `forwardRef`를 named import로 사용 가능.
- **수정**: `import { forwardRef, type ChangeEvent, type KeyboardEvent, useState } from "react"` 로 변경하고 `React.forwardRef` → `forwardRef` 로 수정.

---

## 20. [Medium] `views/Notice/index.tsx` 및 `layouts/Container/index.tsx` - 미사용 `React` import

- **변경 파일**:
  - `src/views/Notice/index.tsx`
  - `src/layouts/Container/index.tsx`
- **문제**: React 17+ JSX Transform이 활성화된 Vite 환경에서는 JSX 변환에 `React` 네임스페이스가 더 이상 불필요하나 미사용 `import React from "react"` 가 남아 있음.
- **수정**: 두 파일에서 `import React from 'react'` 제거.

---

## 21. [Medium] `App.tsx` - 미사용 `React` import

- **변경 파일**: `src/App.tsx`
- **문제**: 미사용 `import React from 'react'` 존재.
- **수정**: `import React from 'react'` 제거.

---

## 22. [Low] `package.json` - 자기참조 의존성 및 미사용 의존성

- **변경 파일**: `package.json`
- **문제**:
  1. `"frontend": "file:"` — 패키지가 자기 자신을 의존성으로 참조하는 잘못된 설정. 순환 참조 및 설치 오류 위험.
  2. `"cra-template-typescript": "1.2.0"` — CRA(Create React App) 템플릿 의존성. Vite 기반 프로젝트에서 불필요한 레거시 의존성.
  3. `"react-modal": "^3.16.3"` — 프로젝트 어디에서도 `react-modal`을 import하지 않음. 미사용 의존성.
- **수정**: `"frontend": "file:"`, `"cra-template-typescript": "1.2.0"`, `"react-modal": "^3.16.3"` 세 항목 제거.

---

## 23. [Low] `constants/index.ts` - 세미콜론 일관성 부재

- **변경 파일**: `src/constants/index.ts`
- **문제**: `MAIN_PATH`, `AUTH_PATH`, `NOTICE_PATH`는 세미콜론(`;`)으로 끝나나 `CALENDAR_PATH`, `TODO_PATH`는 세미콜론 없이 선언되어 코드 스타일 불일치.
- **수정**: `CALENDAR_PATH`와 `TODO_PATH` 에 세미콜론 추가. 빈 줄 사이의 분리도 통합.

---

## 24. [Low] `vite.config.ts` - CRA 잔재 주석 제거

- **변경 파일**: `vite.config.ts`
- **문제**: `port: 3000, // CRA와 동일한 포트 유지`, `outDir: 'build', // CRA와 동일한 빌드 폴더 유지` — 이미 Vite로 마이그레이션 완료된 프로젝트에서 CRA 비교 주석이 불필요하게 남아 있음.
- **수정**: 불필요한 CRA 참조 주석 제거.

---

## 25. [Low] `apis/index.ts` - `WHETHER_API_KEY` 변수명 오타

- **변경 파일**: `src/apis/index.ts`
- **문제**: `const WHETHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY` — `WHETHER`(무엇인지 여부)는 오타이며 `WEATHER`(날씨)가 올바른 표기.
- **수정**: `WEATHER_API_KEY` 로 변수명 수정 (axios 인스턴스 리팩토링과 함께 적용).

---

## 26. [Low] `apis/request/schedule/delete-schedule.request.dto.ts` - 미사용 DTO

- **변경 파일**: `src/apis/request/schedule/delete-schedule.request.dto.ts` (변경 없음, 문서화만)
- **문제**: `DeleteScheduleRequestDto` 는 `index.ts`에서 re-export만 되고, 실제 `deleteScheduleRequest` 함수에서는 `id`를 URL 파라미터로 직접 전달하므로 이 DTO가 사용되지 않음.
- **수정**: 실제 코드 수정 없음. 향후 정리 대상으로 문서화. (백엔드 API 변경 시 불필요하면 삭제 권장)

---

## 요약

| 심각도   | 건수 |
|----------|------|
| Critical | 2    |
| High     | 6    |
| Medium   | 12   |
| Low      | 5    |
| **합계** | **25** |

### 주요 변경 파일 목록
- `src/apis/index.ts` — axios 인스턴스 도입, 공통 에러 처리, 변수명 오타 수정
- `src/apis/response/get-today-schedule-index.response.dto.ts` — 잘못된 타입 상속 수정
- `src/apis/response/get-weekly-schedule-index.response.dto.ts` — 잘못된 타입 상속 수정
- `src/types/interface/index.ts` — TodoListItems export 추가
- `src/components/ScheduleModal/index.tsx` — 매직 스트링 → ResponseCode enum 교체
- `src/components/Loader2/index.tsx` — any 타입 → SVGProps 교체
- `src/components/InputBox/index.tsx` — 미사용 React import 제거, forwardRef named import
- `src/components/TodoListItem/index.tsx` — React.MouseEvent → MouseEvent, 오타 메시지 수정
- `src/views/index.tsx` — WeatherData 인터페이스, 타입 캐스팅 제거, key 개선, 중복 import 통합
- `src/views/Authentication/index.tsx` — console.log 제거, 미사용 변수 제거
- `src/views/Schedule/index.tsx` — 불필요한 .then() 제거, 타입 가드 개선
- `src/views/Todo/index.tsx` — 불필요한 .then() 제거, 안전한 타입 가드 추가
- `src/views/Notice/index.tsx` — 미사용 React import 제거
- `src/layouts/Container/index.tsx` — 미사용 React import 제거
- `src/utils/cookie.ts` — 파라미터/반환 타입 추가
- `src/constants/index.ts` — 세미콜론 일관성 통일
- `vite.config.ts` — CRA 잔재 주석 제거
- `package.json` — 미사용 및 잘못된 의존성 3개 제거

---

# 전체 디자인 개선 (2026-03-28)

> 분석 일자: 2026-03-28
> 대상: todo-frontend 전체 UI/UX
> 방향: Modern Dark SaaS (Linear / Vercel 스타일)

## 디자인 시스템 변경

### 색상 팔레트
- **배경**: `#0d0d12` → `#09090f` (딥 다크, 블루 틴트 강화)
- **카드 배경**: `#13131a` → `#111118`
- **카드 hover**: `#1c1c28` → `#18181f`
- **카드 테두리**: `rgba(255,255,255,0.06)` → `rgba(255,255,255,0.07)`
- **Primary 버튼**: `bg-gradient-to-r from-indigo-500 to-violet-600` → `bg-indigo-600` (solid) + 글로우 shadow

### 타이포그래피
- 라벨 스타일: `text-sm text-slate-400` → `text-[11px] font-medium text-slate-500 uppercase tracking-wider`
- 타이틀 스타일: `tracking-tight` 추가로 가독성 향상

---

## 변경 파일별 상세

### `src/index.css`
- Google Fonts Inter에 `ital` 및 `opsz` 파라미터 추가
- CSS 커스텀 프로퍼티(`--bg-base`, `--bg-card`, `--border` 등) 추가
- 스크롤바 너비 `6px` → `4px`, 배경 투명으로 변경
- `::selection` 스타일 추가 (인디고 계열 선택 색상)
- `input[type="datetime-local"] { color-scheme: dark }` 추가
- FullCalendar 폰트 크기 및 letter-spacing 개선

### `src/tailwind.config.js`
- `surface` 토큰: `DEFAULT`/`secondary` → `DEFAULT`/`2`/`3` 세 단계로 세분화
- `primary.muted` 토큰 추가 (`rgba(99,102,241,0.12)`)
- `boxShadow` 커스텀 토큰 추가: `glow-sm`, `glow`, `glow-lg`, `card`, `modal`
- 불필요한 HSL 기반 `destructive`, `muted`, `popover`, `card` 토큰 제거
- `pulse-glow` keyframe/animation 추가

### `src/layouts/Header/index.tsx`
- 로고: 텍스트 그라디언트 → `CheckSquare` 아이콘 + 인디고 배경 뱃지로 변경
- 로그인/로그아웃 버튼: `LogIn` / `LogOut` 아이콘 추가, 로그인 상태 별 스타일 분기
- active nav 표시: 하단 dot → 하단 1px 라인 (`h-px`)으로 변경
- 헤더 높이: `h-16` → `h-14` (더 슬림하게)
- 메뉴 아이템 간격: `gap-1` → `gap-0.5`

### `src/views/index.tsx` (대시보드)
- 배경에 Ambient glow 효과(고정 배치 블러 원) 추가
- 인사 문구: 시간대별 동적 멘트(`getGreeting()`) 추가
- **통계 row 신규 추가**: 전체 할일 / 남은 할일 / 완료율 3개 카드
- **그리드 레이아웃 변경**: `grid-cols-2` → `grid-cols-3` (3열 bento 그리드)
- 날씨 카드: 1/3 너비, 그라디언트 배경 + ambient 원, 습도(`humidity`) 표시 추가
- 오늘의 일정: 2/3 너비, 바로가기 `ArrowRight` 아이콘 추가
- 할일 목록 카드: 진행률 바 추가, 5개 초과 시 "N개 더 보기" 링크
- 이번 주 일정: 1/3 너비 사이드 카드, 최대 4건 표시

### `src/views/Todo/index.tsx`
- **필터 탭 신규 추가**: 전체 / 미완료 / 완료 세그먼트 컨트롤
- **진행률 바 신규 추가**: 완료 비율 표시 (Framer Motion 애니메이션)
- 헤더: "X/Y개 완료" 부제목 추가
- 버튼: 그라디언트 → solid 인디고 + 글로우 shadow
- 빈 상태: 필터 상태별 메시지 분기 처리

### `src/views/Schedule/index.tsx`
- 헤더: 아이콘 뱃지(`CalendarDays`) + 부제목 추가
- 버튼: solid 인디고 + 글로우 shadow
- 필터: `border` 버튼 나열 → `bg-[#111118]` 컨테이너 내 pill 탭으로 변경
- 필터 레이블: "이전/오늘/차후" → "지난/오늘/예정" (자연스러운 표현)
- 빈 상태: 아이콘 뱃지 스타일로 개선

### `src/views/Notice/index.tsx`
- 헤더: `Bell` 아이콘에 amber 계열 배경 뱃지 적용
- 테이블 헤더: 배경 카드 제거 → 인라인 레이블로 변경 (더 미니멀)
- 항목: hover 배경 `#1c1c28` → `#18181f`

### `src/views/Authentication/index.tsx`
- 카드 외부에 `-inset-px` 그라디언트 레이어 추가 (subtle border glow)
- 카드 상단 중앙 그라디언트 라인 추가 (`via-indigo-500/50`)
- 배경 광원 3개 → 더 자연스러운 배치로 조정
- **FindId/FindPassword/SignUp 카드**: 타이틀 아이콘 뱃지 제거 → `ArrowLeft` 뒤로가기 버튼 + 인라인 제목으로 변경
- SignIn 카드: 아이콘 크기/색상 정제
- 링크 버튼: `<span onClick>` → `<button>` 태그로 의미론적 개선

### `src/components/InputBox/index.tsx`
- 라벨: `text-sm text-slate-400` → `text-[11px] uppercase tracking-wider`
- **Validation 개선**: `touched` 상태 추가 — 값 입력 후 blur 또는 재입력 시에만 에러 표시 (UX 개선)
- 패스워드 토글 아이콘 크기: `18px` → `16px`

### `src/components/TodoListItem/index.tsx`
- 카드 테두리: 기본 `border-white/[0.06]` → expanded 시 `border-white/[0.12]` + `shadow` 적용
- 체크박스 완료 상태: 글로우 shadow 추가 (`shadow-[0_0_8px_rgba(99,102,241,0.4)]`)
- 날짜 텍스트: `text-xs text-slate-600` → `text-[11px] text-slate-700`
- 액션 버튼: 배경 있는 항상 표시 → `border` 스타일 + hover 색상 강조로 변경
- 수정 버튼: 완료 상태가 아닐 때만 표시 (기존: 완료 상태일 때만 표시) → 반전 수정

### `src/components/TodoModal/index.tsx`
- **상단 컬러 바 추가**: `h-px bg-gradient-to-r from-indigo-500/60 via-violet-500/60 to-transparent`
- 헤더: 텍스트만 → `CheckSquare` 아이콘 뱃지 + 제목
- 오버레이: `opacity` → `bg-black/70 backdrop-blur-sm`
- 입력 필드: `autoFocus` 추가, Enter 키 제출 처리 추가
- 제목 라벨에 필수 표시(`*`) 추가
- 버튼: 그라디언트 → solid 인디고

### `src/components/ScheduleListItem/index.tsx`
- **상단 컬러 바 추가**: `h-px bg-gradient-to-r from-indigo-500/50 via-violet-500/30 to-transparent`
- 액션 버튼: 항상 표시 → `opacity-0 group-hover:opacity-100` (hover 시에만 표시)
- 날짜: 시작/종료 동일일인 경우 단일 날짜로 표시 (`isSameDay` 처리)
- `whileHover`: `y: -2` → `y: -1` (더 절제된 인터랙션)

### `src/components/ScheduleModal/index.tsx`
- **상단 컬러 바 추가**: `h-px bg-gradient-to-r from-violet-500/60 via-indigo-500/60 to-transparent`
- 헤더: 텍스트만 → `CalendarDays` 아이콘 뱃지 + 제목
- 입력 필드: `autoFocus` 추가
- 라벨 스타일: uppercase tracking-wider 통일, 선택 필드에 `(선택)` 명시

---

## 요약

| 구분 | 건수 |
|------|------|
| 전역 스타일 (CSS/Config) | 2 |
| 레이아웃 | 1 |
| 페이지 뷰 | 5 |
| 컴포넌트 | 5 |
| **합계** | **13** |

### 주요 변경 파일 목록 (스타일)
- `src/index.css` — CSS 변수, 스크롤바, selection, FullCalendar 테마 개선
- `src/tailwind.config.js` — surface/shadow/animation 토큰 재정의
- `src/layouts/Header/index.tsx` — 아이콘 로고, 슬림 헤더, 인증 버튼 개선
- `src/views/index.tsx` — Bento grid, 통계 row, 진행률 바, ambient glow
- `src/views/Todo/index.tsx` — 필터 탭, 진행률 바
- `src/views/Schedule/index.tsx` — pill 필터, 아이콘 헤더
- `src/views/Notice/index.tsx` — 미니멀 테이블 헤더
- `src/views/Authentication/index.tsx` — 글래스 카드, ArrowLeft 뒤로가기, 그라디언트 라인
- `src/components/InputBox/index.tsx` — touched 기반 validation, uppercase 라벨
- `src/components/TodoListItem/index.tsx` — 글로우 체크박스, 테두리 동적 강조
- `src/components/TodoModal/index.tsx` — 상단 컬러 바, 아이콘 헤더, autoFocus
- `src/components/ScheduleListItem/index.tsx` — hover-only 액션 버튼, 동일일 날짜 처리
- `src/components/ScheduleModal/index.tsx` — 상단 컬러 바, 아이콘 헤더, autoFocus

---

# 신규 기능 구현 (2026-04-01)

## 비밀번호 재설정
이메일 인증 완료 후 새 비밀번호 입력 화면(`ResetPasswordCard`)으로 이동하여 비밀번호를 변경할 수 있는 흐름 완성.

## 공지사항
더미 데이터 → 실제 API 연동으로 전면 재작성. 목록 조회, 상세 조회(조회수 표시), 작성·수정·삭제(로그인 사용자) 기능 구현.

## 마이페이지
회원정보 조회·수정(이름/전화번호), 비밀번호 변경, 활동 통계(할일·일정), 로그아웃, 회원 탈퇴 기능이 포함된 마이페이지 페이지 신규 구현. 헤더 네비게이션 및 라우트 등록 완료.
