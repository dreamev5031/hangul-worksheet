# 한글 따라쓰기 glyph 조형 파이프라인

버전: `canonical-stroke-rendering-v3-optical-fit`

## 원칙

화면의 흐린 완성 글자, 현재 획, 완료 획, 화살표, 이동점과 입력 판정은 최종 생성된 동일 `StrokePath` 객체를 사용한다. 시스템 폰트 글자를 배경에 그리지 않으며 장식용 별도 경로도 만들지 않는다.

## 데이터 흐름

1. `strokeTemplates.ts`: 자모별 유아용 canonical 중심선
2. `syllableLayoutTemplates.ts`: 음절 유형별 초성·중성·종성 기본 박스
3. `opticalAdjustments.ts`: 자모·역할·레이아웃별 광학 보정
4. `syllableOverrides.ts`: 선별 완성형의 역할 단위 메타데이터 보정
5. `glyphFit.ts`: 전체 glyph bounding box 계산과 균일 확대·중앙정렬
6. `syllableLayout.ts`: 위 단계를 조합해 최종 canonical path 생성

## 음절 유형

- `vertical-no-final`: 세로 모음, 받침 없음
- `vertical-with-final`: 세로 모음, 받침 있음
- `horizontal-no-final`: 가로 모음, 받침 없음
- `horizontal-with-final`: 가로 모음, 받침 있음
- `compound-no-final`: 복합 모음, 받침 없음
- `compound-with-final`: 복합 모음, 받침 있음

받침이 있는 유형은 기본 받침 박스와 겹받침 좌우 박스를 각각 가진다. 복합 모음은 가로 성분과 세로 성분의 박스를 분리한다.

## 광학 보정

광학 보정은 다음 값만 가진 메타데이터다.

- `scaleX`
- `scaleY`
- `translateX`
- `translateY`
- `strokeWidthScale`

적용 범위는 `initial`, `medial`, `final` 역할과 음절 레이아웃 유형이다. 획 개수, 획 ID, 획순은 변경하지 않는다.

## 자동 fit

자모 배치와 광학 보정이 끝난 모든 획의 실제 bounding box를 계산한다. 목표 박스에 들어가는 최대 균일 배율을 구하고 전체 획에 동일한 scale과 translate를 적용한다.

- 종횡비 유지
- 전체 glyph 중심 `(0.5, 0.5)` 정렬
- 목표 영역 안쪽 여백 유지
- 자모 사이 상대 거리 유지
- 두께와 판정 tolerance도 같은 배율로 변환

## 완성형 override

기본 조합만으로 비율이 불안정한 소수의 글자에만 적용한다. 현재 대상은 다음 9자다.

- 황
- 밤
- 슬
- 김
- 민
- 준
- 과
- 물
- 한

Override는 역할별 scale·translate와 선택적 fit box만 지정한다. 완성형 획 좌표나 획순을 새로 작성하지 않는다.

## 품질 회귀

자동 검사는 다음을 확인한다.

- 11,172개 현대 한글 음절 생성 성공
- 모든 최종 좌표 0~1
- glyph 중심 정렬
- 목표 영역 사용률
- 초성·중성·종성 간격
- 받침 크기와 위치
- 원형 획의 width/height 비율
- override 전후 획 개수·ID·순서 동일
- 표시와 판정의 동일 객체 참조
- ㄷ 2획, 다 4획과 waypoint 판정 유지
