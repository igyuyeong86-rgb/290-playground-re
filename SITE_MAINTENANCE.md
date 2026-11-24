# 290 포트폴리오 사용 및 유지보수 가이드

이 사이트는 Next.js와 quietfolio 템플릿을 기반으로 만든 정적 사이트입니다. 소개, 프로젝트, 블로그 글은 저장소의 파일로 관리합니다. 수정할 때는 **로컬 파일 편집 → 미리보기 및 검사 → 직접 커밋·푸시 → Cloudflare 배포 확인** 순서로 진행하면 됩니다.

## 어디를 수정하면 되나요?

| 바꾸고 싶은 부분 | 수정할 파일 | 바꿀 항목 |
| --- | --- | --- |
| 홈의 이름, 직함, 위치, 이메일 | `lib/data.ts` | `profile`의 `name`, `short`, `role`, `location`, `timezone`, `email` |
| 자기소개 | `lib/data.ts` | `profile.about`. 문자열 하나가 소개 문단 하나입니다. |
| Developer Snapshot | `lib/data.ts` | `profile.snapshot`. 요즘 공부하는 것, 관심 분야, 진행 중인 작업을 한 줄씩 입력합니다. |
| GitHub 링크와 활동 그래프 | `lib/data.ts` | `profile.github`는 전체 주소, `profile.githubUser`는 계정 아이디입니다. |
| 프로젝트 카드와 필터 | `lib/data.ts` | `projects`에서 카드를 수정합니다. 필터를 추가하려면 `Category`와 `projectFilters`도 맞춥니다. |
| 프로젝트 상세 글 | `content/work/*.md` | 파일의 상단 메타데이터와 Markdown 본문을 수정합니다. |
| 경력과 기술 스택 | `lib/data.ts` | `experience`, `stackGroups` |
| 블로그 글 | `content/blog/*.md` | 글마다 Markdown 파일을 하나씩 추가하거나 수정합니다. |
| 이력서 페이지와 PDF | `lib/data.ts`, `app/resume/page.tsx`, `public/resume.pdf` | 데이터는 `lib/data.ts`, 페이지 구성은 `page.tsx`에서 수정합니다. 다운로드용 PDF는 별도로 교체합니다. |
| 홈 섹션 순서 | `app/page.tsx` | `<About />`, `<Projects />` 등 섹션 컴포넌트의 순서를 바꿉니다. |
| 상단 메뉴와 검색 메뉴 | `components/Navbar.tsx`, `components/CommandPalette.tsx` | 메뉴 문구와 링크를 수정합니다. |
| 기본 색상, 테두리, 테마 스타일 | `app/globals.css` | 기본값은 `:root`, 밝은 모드 값은 `:root[data-theme="light"]`에서 수정합니다. |
| 마우스 파티클 | `components/CursorFx.tsx` | 밝은 모드 팔레트는 `LIGHT_CORAL`, `LIGHT_GOLD`, 잔상의 크기와 시간은 `PX`, `TRAIL_MS`입니다. |
| 검색 결과 설명, 공유 이미지, 사이트 아이콘 | `lib/site.ts`, `app/opengraph-image.png`, `app/icon.png`, `app/apple-icon.png` | 사이트 설명과 키워드는 `lib/site.ts`에서, 이미지는 해당 파일을 교체합니다. |

## 프로필 사진과 배너 바꾸기

| 모드 | 프로필 사진 | 배너 |
| --- | --- | --- |
| 어두운 모드 | `public/img/avatar-dark.webp` | `public/img/matrix-290-banner.webp`, `matrix-290-banner.gif`, `matrix-290-poster.png` |
| 밝은 모드 | `public/img/avatar-light.webp` | `public/img/matrix-290-day-banner.webp`, `matrix-290-day-banner.gif`, `matrix-290-day-poster.png` |

- 프로필 사진은 정사각형으로 준비하세요. 다른 파일명을 쓰려면 `lib/data.ts`의 `profile.avatar`와 `profile.avatarLight`를 수정합니다.
- 배너는 현재와 같은 **1200 × 300** 크기를 쓰면 구도를 유지하기 쉽습니다. WebP가 기본 애니메이션이고 GIF가 대체 이미지입니다. `poster.png`는 기기에서 모션 줄이기를 켰을 때 표시됩니다. 파일명을 바꾸면 `components/Hero.tsx`도 함께 수정하세요.
- `scripts/make_banner.py`는 템플릿 배너를 만드는 스크립트입니다. 현재 사이트의 `matrix-290-*` 파일을 만들지는 않습니다.
- `public`에 넣은 파일은 주소에서 `public`을 뺍니다. 예를 들어 `public/img/projects/my-project.jpg`의 사이트 경로는 `/img/projects/my-project.jpg`입니다.

## 글과 프로젝트 추가하기

### 블로그 글

아래 내용을 `content/blog/first-study-note.md`로 저장하면 블로그 목록과 `/blog/first-study-note/`에서 확인할 수 있습니다.

```markdown
---
title: "첫 번째 공부 기록"
date: "2026-11-18"
category: "Study"
---

오늘 공부한 내용을 정리했습니다.

## 배운 것

- 첫 번째 내용
- 두 번째 내용
```

- `---` 두 줄 사이에 `title`, `date`, `category`를 적고 그 아래에 Markdown 본문을 씁니다.
- 파일명에서 `.md`를 뺀 부분이 `slug`입니다. 파일명은 소문자 영문, 숫자, 하이픈을 사용하세요. 게시 후 이름을 바꾸면 글 주소도 바뀝니다.
- 제목, 목록, 링크, 인용, 코드 블록, 표를 Markdown 문법으로 작성할 수 있습니다. 이미지 파일을 `public/img/`에 넣으면 본문에서 `![이미지 설명](/img/my-image.webp)`처럼 참조할 수 있습니다.
- 옵시디언에서 이미지를 붙여넣어 생기는 `![[Pasted image.png]]`를 그대로 사용할 수 있습니다. 이미지 파일은 `public/img/`에 있어야 하며, 파일명에 공백이 있어도 됩니다.
- 새 파일을 추가한 뒤 개발 서버에 바로 표시되지 않으면 `npm run dev`를 다시 시작합니다. 배포할 때는 빌드가 폴더의 `.md` 파일을 자동으로 읽습니다.

### 프로젝트

1. 표지 이미지를 `public/img/projects/`에 넣습니다.
2. `lib/data.ts`의 `projects`에 카드를 추가합니다. `image`, `title`, `year`, `category`, `status`, `description`, `tags`를 채웁니다. `live`와 `repo`에는 공개 사이트와 코드 주소를 선택적으로 넣습니다.
3. 상세 글이 필요하면 `content/work/my-project.md`를 만듭니다. 글의 주소는 `/work/my-project/`입니다. 블로그와 같은 헤더에 `cover: "/img/projects/my-project.jpg"`와 `tags: ["React", "TypeScript"]`를 추가합니다. [샘플 상세 글](content/work/northwind-dashboard.md)을 복사하면 편합니다.
4. 홈 카드에 `caseStudy: "/work/my-project"`를 넣어 상세 글과 연결합니다. Markdown 파일을 추가하면 상세 페이지는 자동으로 생성되며, 홈 카드는 `lib/data.ts`에서 별도로 관리합니다.
5. 프로젝트를 지울 때는 홈 카드와 상세 글 사이의 `caseStudy` 링크도 확인합니다.

### 이력서 갱신

`/resume`은 프로필과 경력 등의 데이터를 바탕으로 표시됩니다. 홈의 Resume 버튼과 검색 메뉴는 `/resume`으로 연결됩니다. 내용을 수정한 후 로컬에서 `/resume`을 열고 **인쇄 → PDF로 저장**을 선택하세요. 그 파일로 `public/resume.pdf`를 교체하면 다운로드 버튼에도 최신 버전이 제공됩니다.

## 로컬에서 확인하기

프로젝트 폴더를 VS Code로 열고 터미널에서 실행합니다. 프로젝트의 `.nvmrc`는 **Node.js 22**를 지정합니다. `npm ci`는 처음 열었거나 `package-lock.json`이 바뀌었을 때 실행하면 됩니다.

```powershell
node -v
npm ci
npm run dev
```

터미널에 표시되는 주소를 엽니다. 기본값은 `http://localhost:3000/`입니다. 파일을 저장한 뒤 홈, 바꾼 글 주소, 밝은·어두운 모드를 확인합니다. 서버는 `Ctrl+C`로 종료합니다.

```powershell
npm run validate
npm run typecheck
```

`validate`는 글 구조, 중복 주소, 일부 내부 링크와 이미지 경로를 확인합니다. `typecheck`는 TypeScript 오류를 확인합니다. 배포용 결과까지 확인하려면 아래 명령을 실행하세요. 정적 파일은 `out/`에 생성됩니다.

```powershell
node scripts/build-for-workers.mjs
```

## 직접 GitHub에 올리고 배포 확인하기

1. `git status`와 `git diff`로 변경 내용을 확인합니다. 새 이미지 파일은 `git status`에서 확인할 수 있습니다.
2. VS Code 소스 제어에서 올릴 파일만 스테이징한 뒤 커밋합니다. GitHub의 `main`에 푸시합니다.
3. Cloudflare 대시보드에서 **Workers & Pages → 290-playground → Deployments**를 열어, 방금 올린 커밋이 `Ready`인지 확인합니다. 기존 Git 자동 배포는 `wrangler.json`에 지정된 `out/`을 게시합니다.
4. [공개 사이트](https://playgroundandsandboxof290.xyz/)를 열고 수정한 부분을 확인합니다. 새 글이라면 목록과 상세 주소를 모두 열어 봅니다.

일반적인 글과 이미지 수정에는 `wrangler.json`, `next.config.ts`, `package.json`을 편집할 필요가 없습니다. Git을 통해 배포하는 경우 로컬에서 `npm run deploy`를 따로 실행할 필요도 없습니다.

## 문제가 생기면

| 증상 | 확인할 곳 |
| --- | --- |
| Markdown 메타데이터 오류 | 맨 위의 `---` 두 줄과 필수 항목, 따옴표, 들여쓰기를 확인하고 `npm run validate`를 다시 실행합니다. |
| 이미지가 안 뜸 | `public` 아래에 파일이 실제로 있는지, 경로와 확장자·대소문자가 일치하는지, Git에 추가했는지 확인합니다. |
| 글을 추가했는데 404 | `slug`와 주소가 맞는지 확인합니다. 프로젝트 글이라면 카드의 `caseStudy`도 확인합니다. |
| 배포 실패 | Cloudflare의 해당 커밋에서 **Build**를 눌러 첫 번째 실제 오류를 확인합니다. 로컬 검사에서 같은 오류를 재현한 뒤 수정 커밋을 푸시합니다. |
| 배포 성공인데 예전 화면이 보임 | `Ready`로 표시된 커밋이 최신인지 먼저 확인하고 브라우저를 새로고침합니다. |
| 이미 올린 수정사항을 되돌리고 싶음 | 대상 커밋을 확인하고 `git revert 커밋ID`로 되돌리는 커밋을 만든 뒤 직접 푸시합니다. |

공개할 수 있는 정보만 콘텐츠와 이미지에 넣으세요. 비밀번호와 API 키는 저장소에 넣지 않습니다.
