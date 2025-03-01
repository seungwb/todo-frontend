## 프로젝트 개요
- 프로젝트 명: 투두등장 (Frontend)
- 설명: 일정 및 할 일 관리를 지원하는 웹 애플리케이션
- 주요기능:
  - 날씨 정보 제공 (OpenWeatherMap API 연동)
  - 일정 관리 (Fullcalendar 기반 일정 추가, 수정, 삭제)
  - 할 일 관리 (To-Do 리스트 추가, 수정, 삭제, 완료 체크로 할일 완료 여부 관리)
  - 반응형 UI 지원

## 기술 스택

- 개발 환경

  ![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ_IDEA-000000?style=for-the-badge&logo=intellijidea&logoColor=white)
  ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
- 설정 및 패키지 관리

  ![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
- 사용 기술

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![FullCalendar](https://img.shields.io/badge/FullCalendar-FF4F00?style=for-the-badge&logo=fullcalendar&logoColor=white)
![React Modal](https://img.shields.io/badge/React_Modal-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Lucide React](https://img.shields.io/badge/Lucide_React-000000?style=for-the-badge&logo=lucide&logoColor=white)


## 프로젝트 구조

```angular2html
frontend/
│── src/
│   ├── apis/           # API 호출 관련 코드
│   ├── assets/         # 정적 파일 (이미지, 아이콘 등)
│   ├── components/     # 재사용 가능한 UI 컴포넌트
│   ├── constants/      # 상수값 정의
│   ├── layouts/        # 페이지 공통 레이아웃
│   ├── types/          # TypeScript 인터페이스 및 타입
│   ├── utils/          # 유틸리티 함수
│   ├── views/          # 페이지 단위 컴포넌트
│── public/             # 정적 파일 (favicon 등)
│── index.html          # 기본 HTML 파일
│── package.json        # 프로젝트 설정 및 의존성
│── vite.config.ts      # Vite 설정 파일
│── tailwind.config.js  # Tailwind 설정 파일
```

## 주요 기능 설명
- 인덱스 페이지
  - 현재 날씨 정보 제공 (OpenWeatherMap API 활용)
  - 오늘의 일정 및 할 일 리스트 표시
  - 이번 주 일정 한눈에 확인 가능
- 일정 관리
  - FullCalendar 를 사용하여 캘린더 기반 일정 관리
  - 일정 추가, 수정, 삭제 가능
- 할 일 관리
  - 새로운 할 일 추가, 수정 삭제 가능
  - 체크박스를 이용한 완료 처리 가능