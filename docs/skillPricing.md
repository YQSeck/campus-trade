# 鑷姩瀹氫环 Skill 鎺ュ彛鏂囨。

## 姒傝堪

鑷姩瀹氫环 Skill锛圓uto-pricing Skill锛夋槸涓€涓嫭绔嬬殑鍔熻兘鍗曞厓锛屽熀浜庡晢鍝佸垎绫汇€佹垚鑹层€佸師浠峰拰甯傚満鍙傝€冩暟鎹紝璁＄畻浜屾墜鍟嗗搧寤鸿鍞环銆傞€氳繃 RESTful API 鏆撮湶锛屽彲琚閮ㄧ郴缁熸垨鍓嶇椤甸潰璋冪敤銆?
---

## API 绔偣

### `POST /api/skills/recommend`

**鎻忚堪**锛氭牴鎹晢鍝佷俊鎭绠楀缓璁敭浠?
**Content-Type**锛歚application/json`

#### 璇锋眰鍙傛暟

| 鍙傛暟 | 绫诲瀷 | 蹇呭～ | 璇存槑 |
|------|------|------|------|
| `category` | `string` | 鏄?| 鍟嗗搧鍒嗙被锛屽彲閫夊€艰涓嬫柟 |
| `condition` | `string` | 鏄?| 鎴愯壊绛夌骇锛屽彲閫夊€艰涓嬫柟 |
| `originalPrice` | `number` | 鍚?| 鍟嗗搧鍘熶环锛堝厓锛夛紝鎻愪緵鍙彁楂樺噯纭€?|
| `marketPrices` | `number[]` | 鍚?| 甯傚満鍙傝€冧环鏍煎垪琛紙闄勮繎鍚岀被鍟嗗搧浠锋牸锛夛紝鎻愪緵鍙彁楂樺噯纭€?|

**鍒嗙被锛坈ategory锛?*锛?
| 鍊?| 璇存槑 | 鍩哄噯鎶樻墸鐜?|
|----|------|-----------|
| `涔︾睄` | 鏁欐潗銆佸弬鑰冧功绛?| 45% |
| `鐢靛瓙浜у搧` | 鎵嬫満銆佸钩鏉裤€佺數鑴戠瓑 | 55% |
| `鐢熸椿鐢ㄥ搧` | 鍙扮伅銆佹敹绾崇瓑 | 40% |
| `琛ｇ墿` | 鏈嶈銆侀瀷甯界瓑 | 35% |
| `鍏朵粬` | 鏈垎绫诲晢鍝?| 45% |

**鎴愯壊锛坈ondition锛?*锛?
| 鍊?| 璇存槑 | 鎶樻棫鍥犲瓙 |
|----|------|---------|
| `鍏ㄦ柊` | 鏈媶灏佹垨浠呮媶灏?| 95% |
| `鍑犱箮鍏ㄦ柊` | 浣跨敤 1-2 娆★紝鏃犱换浣曠棔杩?| 80% |
| `杞诲井浣跨敤` | 鏈夎交寰娇鐢ㄧ棔杩?| 60% |
| `鏄庢樉浣跨敤` | 鏈夋槑鏄句娇鐢ㄧ棔杩广€佸垝鐥?| 40% |
| `鑰佹棫` | 浣跨敤澶氬勾锛屾湁鏄庢樉纾ㄦ崯 | 25% |

#### 鍝嶅簲鍙傛暟

| 鍙傛暟 | 绫诲瀷 | 璇存槑 |
|------|------|------|
| `success` | `boolean` | 鏄惁鎴愬姛 |
| `suggestedPrice` | `number` | 寤鸿鍞环锛堝厓锛?|
| `priceRange` | `object` | 寤鸿浠锋牸鍖洪棿 |
| `priceRange.min` | `number` | 鏈€浣庡缓璁环锛堝厓锛?|
| `priceRange.max` | `number` | 鏈€楂樺缓璁环锛堝厓锛?|
| `confidence` | `number` | 缃俊搴︼紙0-1锛夛紝瓒婇珮琛ㄧず缁撴灉瓒婂彲闈?|
| `reasoning` | `string` | 瀹氫环鎺ㄧ悊杩囩▼璇存槑 |
| `breakdown` | `object` | 瀹氫环鍒嗚В鏄庣粏 |
| `breakdown.categoryBaseRate` | `number` | 鍒嗙被鍩哄噯鎶樻墸鐜?|
| `breakdown.conditionFactor` | `number` | 鎴愯壊鎶樻棫鍥犲瓙 |
| `breakdown.marketAverage` | `number\|null` | 甯傚満鍙傝€冨潎浠凤紙濡傛彁渚涳級 |
| `breakdown.marketAdjustment` | `boolean` | 鏄惁浣跨敤浜嗗競鍦鸿皟鏁?|

**澶辫触鍝嶅簲**锛?
| 鍙傛暟 | 绫诲瀷 | 璇存槑 |
|------|------|------|
| `success` | `boolean` | `false` |
| `error` | `string` | 閿欒鎻忚堪 |

---

### `GET /api/skills/recommend/meta`

**鎻忚堪**锛氳幏鍙栧畾浠峰紩鎿庣殑鍏冩暟鎹紙鍙敤鍒嗙被銆佹垚鑹茬瓑绾с€佸熀鍑嗗弬鏁帮級

#### 鍝嶅簲绀轰緥

```json
{
  "categories": ["涔︾睄", "鐢靛瓙浜у搧", "鐢熸椿鐢ㄥ搧", "琛ｇ墿", "鍏朵粬"],
  "conditions": ["鍏ㄦ柊", "鍑犱箮鍏ㄦ柊", "杞诲井浣跨敤", "鏄庢樉浣跨敤", "鑰佹棫"],
  "baseRates": {
    "涔︾睄": 0.45,
    "鐢靛瓙浜у搧": 0.55,
    "鐢熸椿鐢ㄥ搧": 0.40,
    "琛ｇ墿": 0.35,
    "鍏朵粬": 0.45
  },
  "conditionFactors": {
    "鍏ㄦ柊": 0.95,
    "鍑犱箮鍏ㄦ柊": 0.80,
    "杞诲井浣跨敤": 0.60,
    "鏄庢樉浣跨敤": 0.40,
    "鑰佹棫": 0.25
  }
}
```

---

## 璋冪敤绀轰緥

### 绀轰緥 1锛氫粎鎻愪緵鍒嗙被鍜屾垚鑹?
```bash
curl -X POST http://localhost:3000/api/skills/recommend \
  -H "Content-Type: application/json" \
  -d '{"category": "涔︾睄", "condition": "鍑犱箮鍏ㄦ柊"}'
```

**鍝嶅簲**锛?
```json
{
  "success": true,
  "suggestedPrice": 36,
  "priceRange": { "min": 28, "max": 44 },
  "confidence": 0.20,
  "reasoning": "涔︾睄绫讳簩鎵嬪熀鍑嗘姌鎵ｇ巼绾?45%锛堟暀鏉愩€佸弬鑰冧功鎶樻棫杈冨揩锛岄櫎闈炴槸鐑棬涓撲笟涔︼級銆傚嚑涔庡叏鏂版姌鏃у洜瀛愪负 80%銆傛棤鍘熶环鍜屽競鍦哄弬鑰冿紝浠呯粰鍑哄綊涓€鍖栨寚鏁般€?,
  "breakdown": {
    "categoryBaseRate": 0.45,
    "conditionFactor": 0.80,
    "marketAverage": null,
    "marketAdjustment": false
  }
}
```

### 绀轰緥 2锛氭彁渚涘師浠?+ 甯傚満鍙傝€冿紙鏈€楂樼簿搴︼級

```bash
curl -X POST http://localhost:3000/api/skills/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "category": "鐢靛瓙浜у搧",
    "condition": "杞诲井浣跨敤",
    "originalPrice": 4399,
    "marketPrices": [1800, 2100, 1950, 2200]
  }'
```

**鍝嶅簲**锛?
```json
{
  "success": true,
  "suggestedPrice": 1932.71,
  "priceRange": { "min": 1874, "max": 1990 },
  "confidence": 0.85,
  "reasoning": "鐢靛瓙浜у搧绫讳簩鎵嬪熀鍑嗘姌鎵ｇ巼绾?55%锛堥殢鎹唬鎶樹环鏄庢樉锛屾畫鍊煎彇鍐充簬鍝佺墝鍜岄厤缃級銆傝交寰娇鐢ㄦ姌鏃у洜瀛愪负 60%銆傜粨鍚堝師浠疯绠楋紙楼1451.67锛変笌甯傚満鍙傝€冨潎浠凤紙楼2012.50锛夛紝鎸?6:4 鍔犳潈銆?,
  "breakdown": {
    "categoryBaseRate": 0.55,
    "conditionFactor": 0.60,
    "marketAverage": 2012.50,
    "marketAdjustment": true
  }
}
```

### 绀轰緥 3锛氭棤鏁堝弬鏁?
```bash
curl -X POST http://localhost:3000/api/skills/recommend \
  -H "Content-Type: application/json" \
  -d '{"category": "姹借溅", "condition": "鍑犱箮鍏ㄦ柊"}'
```

**鍝嶅簲**锛?
```json
{
  "success": false,
  "error": "鏃犳晥鍒嗙被锛屽彲閫夊€硷細涔︾睄銆佺數瀛愪骇鍝併€佺敓娲荤敤鍝併€佽。鐗┿€佸叾浠?
}
```

---

## 瀹氫环绠楁硶璇存槑

```
寤鸿浠锋牸 = 鍘熶环 脳 鍒嗙被鍩哄噯鎶樻墸鐜?脳 鎴愯壊鎶樻棫鍥犲瓙 脳 (1 + 甯傚満璋冩暣)

鑻ュ悓鏃舵湁鍘熶环涓庡競鍦哄弬鑰冿細
  寤鸿浠锋牸 = 妯″瀷浠锋牸 脳 0.6 + 甯傚満鍧囦环 脳 0.4锛堝姞鏉冭瀺鍚堬級
  缃俊搴?= 0.85

鑻ヤ粎鏈夊師浠凤細
  寤鸿浠锋牸 = 鍘熶环 脳 鍒嗙被鎶樻墸鐜?脳 鎴愯壊鎶樻棫鍥犲瓙
  缃俊搴?= 0.60

鑻ヤ粎鏈夊競鍦哄弬鑰冿細
  寤鸿浠锋牸 = 甯傚満鍧囦环
  缃俊搴?= 0.50

鑻ユ棤鍘熶环涔熸棤甯傚満鍙傝€冿細
  寤鸿浠锋牸 = 鍒嗙被鎶樻墸鐜?脳 鎴愯壊鎶樻棫鍥犲瓙 脳 100锛堝綊涓€鍖栨寚鏁帮級
  缃俊搴?= 0.20
```

---

## 澶栭儴闆嗘垚

- **鍓嶇璋冪敤**锛氫娇鐢?`@/utils/request` 鍙戦€?POST 璇锋眰鍒?`/api/skills/recommend`
- **CLI 璋冪敤**锛歚trade-cli` 鍐呴儴涓嶇洿鎺ラ泦鎴愶紝閫氳繃 curl 鎴?HTTP 瀹㈡埛绔皟鐢?- **绗笁鏂圭郴缁?*锛氭敮鎸?CORS锛屽彲鐩存帴璺ㄥ煙璋冪敤
