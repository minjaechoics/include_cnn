# ⚡ 빠른 시작 가이드

5분 안에 GitHub Pages에 배포하고 전 세계에 공유하세요!

## 🎯 목표

이 가이드를 완료하면:
- ✅ GitHub Pages에 CNN 시각화 웹앱 배포
- ✅ 링크 하나로 누구나 접속 가능
- ✅ 동아리 박람회에서 QR 코드로 공유

## 📋 준비물

- GitHub 계정 (없으면 https://github.com 에서 가입)
- 3개 파일: `index.html`, `style.css`, `app.js`

## 🚀 3단계로 배포하기

### ✅ 1단계: 저장소 만들기 (1분)

1. https://github.com 접속 및 로그인
2. 오른쪽 상단 `+` → `New repository` 클릭
3. 입력:
   ```
   Repository name: cnn-visualization
   Description: KAIST Include CNN 체험 프로그램
   Public 선택 ✓
   ```
4. `Create repository` 버튼 클릭

### ✅ 2단계: 파일 업로드 (2분)

1. 방금 만든 저장소 페이지에서:
   ```
   "creating a new file" 링크 클릭
   ```

2. **첫 번째 파일 (index.html)**:
   - 파일명 입력: `index.html`
   - 아래 에디터에 `index.html` 파일 내용 복사 붙여넣기
   - 하단 `Commit new file` 클릭

3. **두 번째 파일 (style.css)**:
   - 다시 메인 페이지로 → `Add file` → `Create new file`
   - 파일명: `style.css`
   - `style.css` 파일 내용 붙여넣기
   - `Commit new file` 클릭

4. **세 번째 파일 (app.js)**:
   - 같은 방법으로 `app.js` 생성
   - 내용 붙여넣기 후 커밋

### ✅ 3단계: GitHub Pages 활성화 (1분)

1. 저장소 상단 `Settings` 탭 클릭
2. 왼쪽 메뉴에서 `Pages` 클릭
3. **Source** 섹션:
   - Branch: `main` (또는 `master`) 선택
   - Folder: `/ (root)` 선택
   - `Save` 버튼 클릭

4. 1-2분 기다리면 배포 완료!
   ```
   ✅ Your site is published at:
   https://[당신의GitHub아이디].github.io/cnn-visualization/
   ```

## 🎉 완료!

축하합니다! 이제 다음이 가능합니다:

### 📱 접속하기
```
https://[당신의아이디].github.io/cnn-visualization/
```

### 🔗 공유하기
- 카카오톡, 이메일, SNS에 링크 복사해서 보내기
- QR 코드 만들기: https://www.qr-code-generator.com/

### 🖼️ QR 코드 만들기 (30초)

1. https://www.qr-code-generator.com/ 접속
2. URL 입력: `https://당신의아이디.github.io/cnn-visualization/`
3. `Create QR Code` 클릭
4. `Download` 클릭
5. 프린트해서 동아리 부스에 비치!

## 🎨 커스터마이징 (선택사항)

### 제목 바꾸기

1. GitHub 저장소에서 `index.html` 클릭
2. 연필 아이콘 (Edit) 클릭
3. 다음 부분 수정:
   ```html
   <h1>🧠 KAIST Include - CNN 체험</h1>
   ```
   →
   ```html
   <h1>🤖 우리 동아리 - AI 데모</h1>
   ```
4. `Commit changes` 클릭
5. 30초 후 변경사항 반영!

### 색상 바꾸기

`style.css` 파일에서:

```css
/* 보라색 → 파란색 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
↓
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
```

## 📊 동아리 박람회 준비

### 필요한 것

1. **✅ 노트북/태블릿**
   - 큰 화면으로 데모 보여주기
   - 방문자가 직접 그릴 수 있게

2. **✅ QR 코드 포스터**
   ```
   ┌──────────────────────┐
   │                      │
   │   🧠 CNN 체험하기     │
   │                      │
   │   [  QR CODE  ]      │
   │                      │
   │   스캔하고 직접       │
   │   숫자를 그려보세요!  │
   │                      │
   └──────────────────────┘
   ```

3. **✅ 시연 대본**
   ```
   "안녕하세요! 직접 숫자를 그려보시겠어요?"
   → 그리기
   → "이제 예측하기를 눌러주세요"
   → 결과 확인
   → "보시다시피 CNN의 각 층이 어떻게 작동하는지 볼 수 있어요"
   ```

## 🆘 문제 해결

### Q: 404 에러가 나요
**A:** 
- Settings → Pages에서 활성화했는지 확인
- 2-3분 기다렸는지 확인
- 파일명이 정확히 `index.html`인지 확인

### Q: 페이지는 뜨는데 버튼이 안 눌려요
**A:**
- `app.js` 파일도 업로드했는지 확인
- 브라우저 F12 눌러서 에러 확인

### Q: 특성맵이 안 보여요
**A:**
- 정상입니다! 숫자를 그리고 "예측하기"를 눌러야 보입니다

### Q: 예측이 엉뚱한 숫자가 나와요
**A:**
- 정상입니다! 사전 학습 없이 랜덤 가중치로 작동합니다
- 시각화는 정상적으로 작동하므로 데모 용도로 충분합니다

## 📞 도움이 필요하면

1. GitHub Issues에 질문 올리기
2. 동아리 선배에게 물어보기
3. README.md의 자세한 설명 읽기

## 🎓 다음 단계

기본 배포를 마쳤다면:

- [ ] README.md에 동아리 정보 추가
- [ ] 색상/디자인 커스터마이징
- [ ] 모바일에서 테스트해보기
- [ ] 친구들과 공유하기
- [ ] 동아리 SNS에 홍보하기

## 🌟 팁

### 💡 모바일 최적화
- 자동으로 반응형! 스마트폰에서도 완벽 작동

### 💡 무료로 평생 호스팅
- GitHub Pages는 완전 무료
- 트래픽 제한 없음
- HTTPS 자동 지원

### 💡 언제든 수정 가능
- GitHub에서 파일 편집 → 즉시 반영
- 버전 관리 자동

---

## ✅ 체크리스트

배포 전:
- [ ] GitHub 계정 있음
- [ ] 3개 파일 준비됨

배포 후:
- [ ] URL 접속 확인
- [ ] 그리기 테스트
- [ ] 예측 테스트
- [ ] 모바일 테스트
- [ ] QR 코드 생성
- [ ] 친구에게 공유

---

**모두 완료했나요? 축하합니다! 🎉**

이제 전 세계 누구나 당신의 CNN 시각화 앱에 접속할 수 있습니다!
