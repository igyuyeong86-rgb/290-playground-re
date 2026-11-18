# 포트폴리오 블로그

이 사이트는 [quietfolio](https://github.com/salahu01/quietfolio-template)의 화면 구조와 스타일을 바탕으로 만든 포트폴리오 블로그입니다. 원본의 MIT 라이선스는 [LICENSE.quietfolio](LICENSE.quietfolio)에 보관했습니다. 예시 인물·프로젝트·글은 포함하지 않았습니다. 기본 경로(`/`)에는 소개, Projects, Study, Latest writing이 보이며 내용은 빈 상태에서 시작합니다.

상단 `관리`에서 관리자 비밀번호로 로그인하면 소개를 편집하고, Projects·Study·Writing 글을 작성·수정·삭제할 수 있습니다. 전체 글 목록은 `/blog`, 상세 주소는 `/blog/<id>`입니다. 내용은 Cloudflare D1의 `portfolio_blog_profile`과 `portfolio_blog_posts` 테이블에 저장됩니다.

관리자 인증은 포트폴리오 전용 계정과 세션을 사용합니다. 최초 로그인 전에 Worker 런타임 Secret `ADMIN_INITIAL_PASSWORD`를 설정해야 합니다. 비밀번호를 소스 코드에 저장하지 마세요.

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```sh
npm ci
npm run dev
```

## 확인 및 배포

```sh
npm run typecheck
npm test
npm run build
npm run deploy
```

`wrangler.json`의 D1 바인딩과 Cloudflare 계정 로그인이 준비되어야 배포할 수 있습니다. 현재 작업 환경에는 Cloudflare 로그인이 연결되어 있지 않습니다.
