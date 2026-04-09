import { useState, useEffect, useRef, useCallback } from "react";

const P1 = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
const P2 = "8214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196";
const P3 = "4428810975665933446128475648233786783165271201909145648566923460348610454326648213393607260249141273";
const P4 = "7245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094";
const P5 = "3305727036575959195309218611738193261179310511854807446237996274956735188575272489122793818301194912";
const P6 = "9833673362440656643086021394946395224737190702179860943702770539217176293176752384674818467669405132";
const P7 = "0005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235";
const P8 = "4201995611212902196086403441815981362977477130996051870721134999999837297804995105973173281609631859";
const P9 = "5024459455346908302642522308253344685035261931188171010003137838752886587533208381420617177669147303";
const PA = "5982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";
const PB = "3809525720106548586327886593615338182796823030195203530185296899577362259941389124972177528347913151";
const PC = "5574857242454150695950829533116861727855889075098381754637464939319255060400927701671139009848824012";
const PI_STR = P1+P2+P3+P4+P5+P6+P7+P8+P9+PA+PB+PC;

// Categories: c=civilization, s=science, w=war, a=art/culture, d=disaster, t=tech, p=philosophy
const EVENTS = [
  // Ancient world
  {year:-10000, name:"农业革命", en:"Agricultural Revolution", code:"10000351", color:"#22c55e", icon:"#"},
  {year:-3500, name:"苏美尔楔形文字", en:"Cuneiform Writing", code:"35003240", color:"#e8c170", icon:"Y"},
  {year:-3000, name:"金字塔建造", en:"Great Pyramid", code:"30002976", color:"#e8c170", icon:"^"},
  {year:-2500, name:"印度河流域文明", en:"Indus Valley", code:"25001735", color:"#f97316", icon:"I"},
  {year:-1754, name:"汉谟拉比法典", en:"Code of Hammurabi", code:"17543721", color:"#dc2626", icon:"L"},
  {year:-1200, name:"特洛伊战争", en:"Trojan War", code:"12003926", color:"#ef4444", icon:"T"},
  {year:-776, name:"首届奥运会", en:"First Olympics", code:"07760123", color:"#2dd4bf", icon:"O"},
  {year:-563, name:"释迦牟尼诞生", en:"Buddha Born", code:"05632748", color:"#fbbf24", icon:"B"},
  {year:-551, name:"孔子诞生", en:"Confucius Born", code:"05513512", color:"#f59e0b", icon:"K"},
  {year:-508, name:"雅典民主制", en:"Athenian Democracy", code:"05083760", color:"#3b82f6", icon:"D"},
  {year:-334, name:"亚历山大东征", en:"Alexander's Conquest", code:"03343368", color:"#8b5cf6", icon:"A"},
  {year:-221, name:"秦统一中国", en:"Qin Unification", code:"02211086", color:"#ef4444", icon:"Q"},
  {year:-4, name:"耶稣诞生", en:"Jesus Born", code:"00043325", color:"#a78bfa", icon:"J"},
  // Classical & Medieval
  {year:79, name:"庞贝城毁灭", en:"Pompeii Eruption", code:"00790824", color:"#ef4444", icon:"V"},
  {year:105, name:"蔡伦造纸", en:"Paper Invented", code:"01051127", color:"#a78bfa", icon:"P"},
  {year:476, name:"西罗马灭亡", en:"Rome Falls", code:"04764175", color:"#f97316", icon:"R"},
  {year:570, name:"穆罕默德诞生", en:"Muhammad Born", code:"05700412", color:"#22c55e", icon:"M"},
  {year:618, name:"唐朝建立", en:"Tang Dynasty", code:"06180618", color:"#e8c170", icon:"+"},
  {year:868, name:"金刚经印刷", en:"Diamond Sutra Printed", code:"08681105", color:"#06b6d4", icon:"S"},
  {year:1054, name:"东西教会大分裂", en:"Great Schism", code:"10540716", color:"#8b5cf6", icon:"/"},
  {year:1206, name:"成吉思汗建蒙古帝国", en:"Mongol Empire", code:"12061206", color:"#dc2626", icon:"G"},
  {year:1347, name:"黑死病大流行", en:"Black Death", code:"13471001", color:"#525252", icon:"X"},
  // Early Modern
  {year:1439, name:"古腾堡印刷术", en:"Gutenberg Press", code:"14395025", color:"#06b6d4", icon:"G"},
  {year:1492, name:"哥伦布到达美洲", en:"Columbus", code:"14923850", color:"#22c55e", icon:"C"},
  {year:1517, name:"马丁路德宗教改革", en:"Reformation", code:"15171031", color:"#8b5cf6", icon:"L"},
  {year:1543, name:"哥白尼日心说", en:"Copernicus Heliocentrism", code:"15430524", color:"#6366f1", icon:"@"},
  {year:1620, name:"五月花号到达", en:"Mayflower", code:"16201111", color:"#94a3b8", icon:"F"},
  {year:1687, name:"牛顿原理", en:"Newton Principia", code:"16879807", color:"#3b82f6", icon:"N"},
  // Revolutions
  {year:1776, name:"美国独立宣言", en:"US Independence", code:"17763870", color:"#dc2626", icon:"U"},
  {year:1789, name:"法国大革命", en:"French Revolution", code:"17891407", color:"#8b5cf6", icon:"F"},
  {year:1804, name:"海地独立", en:"Haiti Independence", code:"18040101", color:"#f97316", icon:"H"},
  {year:1839, name:"达盖尔摄影术", en:"Daguerreotype", code:"18390819", color:"#94a3b8", icon:"c"},
  {year:1859, name:"物种起源", en:"Origin of Species", code:"18595151", color:"#10b981", icon:"D"},
  {year:1861, name:"美国南北战争", en:"US Civil War", code:"18610412", color:"#ef4444", icon:"W"},
  {year:1869, name:"元素周期表", en:"Periodic Table", code:"18690306", color:"#06b6d4", icon:"E"},
  {year:1876, name:"贝尔发明电话", en:"Telephone", code:"18760310", color:"#fbbf24", icon:"t"},
  {year:1879, name:"爱迪生电灯", en:"Edison Light Bulb", code:"18791220", color:"#fbbf24", icon:"e"},
  // 20th Century
  {year:1903, name:"莱特兄弟首飞", en:"Wright Brothers", code:"19031217", color:"#3b82f6", icon:"w"},
  {year:1905, name:"狭义相对论", en:"Special Relativity", code:"19050626", color:"#6366f1", icon:"="},
  {year:1912, name:"泰坦尼克号沉没", en:"Titanic Sinks", code:"19120415", color:"#525252", icon:"s"},
  {year:1914, name:"一战爆发", en:"WWI Begins", code:"19140728", color:"#ef4444", icon:"1"},
  {year:1917, name:"十月革命", en:"October Revolution", code:"19171107", color:"#dc2626", icon:"r"},
  {year:1928, name:"青霉素发现", en:"Penicillin", code:"19280928", color:"#10b981", icon:"p"},
  {year:1929, name:"华尔街崩盘", en:"Wall Street Crash", code:"19291029", color:"#f59e0b", icon:"$"},
  {year:1937, name:"南京大屠杀", en:"Nanjing Massacre", code:"19371213", color:"#525252", icon:"n"},
  {year:1945, name:"广岛原子弹", en:"Hiroshima", code:"19450806", color:"#ef4444", icon:"*"},
  {year:1947, name:"印度独立", en:"India Independence", code:"19470815", color:"#f97316", icon:"i"},
  {year:1949, name:"新中国成立", en:"PRC Founded", code:"19491001", color:"#dc2626", icon:"Z"},
  {year:1953, name:"DNA双螺旋", en:"DNA Structure", code:"19530228", color:"#2dd4bf", icon:"d"},
  {year:1957, name:"苏联发射人造卫星", en:"Sputnik", code:"19571004", color:"#94a3b8", icon:"o"},
  {year:1961, name:"加加林太空飞行", en:"Gagarin in Space", code:"19610412", color:"#94a3b8", icon:"g"},
  {year:1963, name:"马丁路德金演讲", en:"I Have a Dream", code:"19630828", color:"#a78bfa", icon:"m"},
  {year:1969, name:"阿波罗登月", en:"Moon Landing", code:"19690720", color:"#94a3b8", icon:"M"},
  {year:1971, name:"Intel 4004芯片", en:"First Microprocessor", code:"19711115", color:"#06b6d4", icon:"4"},
  {year:1976, name:"苹果公司成立", en:"Apple Founded", code:"19760401", color:"#737373", icon:"a"},
  {year:1978, name:"中国改革开放", en:"China Reform", code:"19781218", color:"#f59e0b", icon:"x"},
  {year:1986, name:"切尔诺贝利核灾", en:"Chernobyl", code:"19860426", color:"#525252", icon:"!"},
  {year:1989, name:"柏林墙倒塌", en:"Berlin Wall Falls", code:"19891109", color:"#f59e0b", icon:"B"},
  {year:1990, name:"哈勃望远镜升空", en:"Hubble Telescope", code:"19900424", color:"#3b82f6", icon:"h"},
  {year:1991, name:"万维网公开", en:"World Wide Web", code:"19910806", color:"#06b6d4", icon:"W"},
  {year:1997, name:"克隆羊多莉", en:"Dolly the Sheep", code:"19970223", color:"#10b981", icon:"y"},
  // 21st Century
  {year:2001, name:"人类基因组测序", en:"Human Genome", code:"20010626", color:"#2dd4bf", icon:"H"},
  {year:2003, name:"SARS爆发", en:"SARS Outbreak", code:"20030301", color:"#525252", icon:"v"},
  {year:2004, name:"印度洋海啸", en:"Indian Ocean Tsunami", code:"20041226", color:"#525252", icon:"~"},
  {year:2007, name:"iPhone发布", en:"iPhone Launch", code:"20070109", color:"#737373", icon:"j"},
  {year:2008, name:"比特币白皮书", en:"Bitcoin Whitepaper", code:"20081031", color:"#f59e0b", icon:"b"},
  {year:2011, name:"福岛核灾", en:"Fukushima", code:"20110311", color:"#525252", icon:"f"},
  {year:2012, name:"希格斯玻色子", en:"Higgs Boson", code:"20120704", color:"#6366f1", icon:"q"},
  {year:2015, name:"引力波探测", en:"Gravitational Waves", code:"20150914", color:"#6366f1", icon:"G"},
  {year:2016, name:"AlphaGo胜李世石", en:"AlphaGo", code:"20160315", color:"#a78bfa", icon:"A"},
  {year:2019, name:"黑洞首张照片", en:"Black Hole Image", code:"20190410", color:"#1e293b", icon:"O"},
  {year:2020, name:"COVID-19大流行", en:"COVID-19 Pandemic", code:"20200311", color:"#525252", icon:"C"},
  {year:2022, name:"ChatGPT发布", en:"ChatGPT Launch", code:"20221130", color:"#06b6d4", icon:"T"},
  {year:2023, name:"GPT-4发布", en:"GPT-4", code:"20230314", color:"#a78bfa", icon:"4"},
];

function findInPi(code) {
  for (let len = code.length; len >= 3; len--) {
    const sub = code.substring(0, len);
    const idx = PI_STR.indexOf(sub);
    if (idx !== -1) return {pos: idx, matchLen: len, matched: sub};
  }
  return {pos: -1, matchLen: 0, matched: ""};
}

function findVoidZones() {
  var ps = EVENTS.map(function(e) { return findInPi(e.code).pos; }).filter(function(p) { return p >= 0; }).sort(function(a, b) { return a - b; });
  var voids = [];
  for (var i = 0; i < ps.length - 1; i++) {
    var gap = ps[i + 1] - ps[i];
    if (gap > 30) {
      var mid = Math.floor((ps[i] + ps[i + 1]) / 2);
      voids.push({start: ps[i] + 5, end: ps[i + 1] - 5, mid: mid, digits: PI_STR.substring(mid, mid + 8), gap: gap});
    }
  }
  voids.sort(function(a,b){ return b.gap - a.gap; });
  return voids.slice(0, 5);
}

// Reverse-decode a pi sequence into a "predicted" event
function decodePrediction(digits) {
  // Encoding rule: YYYYMMDD -> first 4 = year, next 2 = month, last 2 = day
  var y = parseInt(digits.substring(0, 4));
  var m = parseInt(digits.substring(4, 6));
  var d = parseInt(digits.substring(6, 8));
  // Clamp to plausible
  if (y < 2024) y = 2024 + (y % 100);
  if (y > 2200) y = 2100 + (y % 100);
  if (m < 1 || m > 12) m = ((m - 1) % 12) + 1;
  if (d < 1 || d > 28) d = ((d - 1) % 28) + 1;
  // Derive "coordinates" from next digits or digit sums
  var dsum = 0;
  for (var i = 0; i < digits.length; i++) dsum += parseInt(digits[i]) || 0;
  var lat = ((dsum * 7.3) % 180) - 90;
  var lng = ((dsum * 13.1) % 360) - 180;
  return {year: y, month: m, day: d, lat: lat.toFixed(1), lng: lng.toFixed(1), raw: digits};
}

// Classify prediction by coordinate
function geoLabel(lat, lng) {
  var la = parseFloat(lat), lo = parseFloat(lng);
  if (la > 60) return "Arctic Region";
  if (la < -60) return "Antarctic Region";
  if (lo > -30 && lo < 60 && la > 10 && la < 45) return "Mediterranean / North Africa";
  if (lo > 60 && lo < 150 && la > 0 && la < 55) return "East Asia";
  if (lo > -130 && lo < -60 && la > 10 && la < 55) return "North America";
  if (lo > -80 && lo < -35 && la > -55 && la < 10) return "South America";
  if (lo > 100 && lo < 180 && la > -50 && la < 0) return "Oceania";
  if (Math.abs(la) < 25 && (lo < -100 || lo > 150)) return "Central Pacific";
  if (lo > 20 && lo < 55 && la > -5 && la < 40) return "Middle East / East Africa";
  return "Unknown Sector [" + lat + ", " + lng + "]";
}

function PiStream(props) {
  var highlightPos = props.highlightPos;
  var highlightLen = props.highlightLen;
  var scrollToPos = props.scrollToPos;
  var horizontal = props.horizontal;
  var containerRef = useRef(null);
  var offsetRef = useRef(0);
  var targetRef = useRef(null);
  var frameRef = useRef(null);
  var stateRef = useRef(0);
  var [tick, setTick] = useState(0);

  useEffect(function() {
    if (scrollToPos >= 0) {
      targetRef.current = Math.max(0, scrollToPos - 20);
    }
  }, [scrollToPos]);

  useEffect(function() {
    var lastTime = 0;
    function animate(time) {
      frameRef.current = requestAnimationFrame(animate);
      if (!lastTime) { lastTime = time; return; }
      var dt = (time - lastTime) / 1000;
      lastTime = time;
      if (targetRef.current !== null) {
        var diff = targetRef.current - offsetRef.current;
        if (Math.abs(diff) < 0.5) {
          offsetRef.current = targetRef.current;
          targetRef.current = null;
        } else {
          offsetRef.current = offsetRef.current + diff * 0.08;
        }
      } else {
        offsetRef.current = (offsetRef.current + 0.6 * dt) % (PI_STR.length - 200);
      }
      stateRef.current++;
      if (stateRef.current % 3 === 0) setTick(function(t) { return t + 1; });
    }
    frameRef.current = requestAnimationFrame(animate);
    return function() { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, []);

  var startIdx = Math.floor(offsetRef.current);
  var ROWS = horizontal ? 3 : 25;
  var COLS = horizontal ? 40 : 5;

  var rows = [];
  for (var r = 0; r < ROWS; r++) {
    var rowStart = startIdx + r * COLS;
    var cells = [];
    for (var c = 0; c < COLS; c++) {
      var idx = rowStart + c;
      var digit = PI_STR[idx % PI_STR.length] || "0";
      var isHl = highlightPos >= 0 && idx >= highlightPos && idx < highlightPos + highlightLen;
      var dVal = parseInt(digit);
      var hue = 160 + dVal * 8;
      var light = isHl ? 70 : (30 + dVal * 3);
      var sat = isHl ? 80 : 15;
      cells.push(
        <span key={c} style={{
          color: isHl ? "#2dd4bf" : ("hsl(" + hue + "," + sat + "%," + light + "%)"),
          fontWeight: isHl ? 700 : 400,
          textShadow: isHl ? "0 0 8px #2dd4bf, 0 0 20px rgba(45,212,191,0.3)" : "none",
          transition: "all 0.3s",
          width: "20px",
          textAlign: "center",
          fontSize: isHl ? "20px" : "16px",
          display: "inline-block",
        }}>
          {digit}
        </span>
      );
    }
    var rowOpacity = horizontal
      ? (r === 1 ? 1 : 0.35)
      : 0.3 + 0.7 * (1 - Math.abs(r - ROWS / 2) / (ROWS / 2));
    rows.push(
      <div key={r} style={{display: "flex", justifyContent: "center", gap: "1px", opacity: rowOpacity, height: "26px", alignItems: "center"}}>
        {cells}
      </div>
    );
  }

  var maskDir = horizontal ? "to right" : "to bottom";
  return (
    <div ref={containerRef} style={{
      fontFamily: "'Courier New', monospace",
      fontSize: "16px",
      lineHeight: "26px",
      overflow: "hidden",
      height: "100%",
      width: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      maskImage: "linear-gradient(" + maskDir + ", transparent 0%, black 8%, black 92%, transparent 100%)",
      WebkitMaskImage: "linear-gradient(" + maskDir + ", transparent 0%, black 8%, black 92%, transparent 100%)",
    }}>
      {rows}
    </div>
  );
}

export default function App({ onBack }) {
  var [selectedEvent, setSelectedEvent] = useState(null);
  var [highlightPos, setHighlightPos] = useState(-1);
  var [highlightLen, setHighlightLen] = useState(0);
  var [scrollToPos, setScrollToPos] = useState(-1);
  var [showVoid, setShowVoid] = useState(false);
  var [hoveredIdx, setHoveredIdx] = useState(-1);

  var voidZones = findVoidZones();

  var handleEventClick = useCallback(function(ev) {
    var result = findInPi(ev.code);
    setSelectedEvent(ev);
    setHighlightPos(result.pos);
    setHighlightLen(result.matchLen);
    setScrollToPos(result.pos);
  }, []);

  var eventResults = EVENTS.map(function(e) {
    var r = findInPi(e.code);
    return Object.assign({}, e, r);
  });

  var timelineRef = useRef(null);

  useEffect(function() {
    if (selectedEvent && timelineRef.current) {
      var idx = eventResults.findIndex(function(e) { return e.code === selectedEvent.code; });
      var container = timelineRef.current.children[1];
      if (container && container.children[idx]) {
        container.children[idx].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedEvent]);

  return (
    <div style={{
      width: "100%", height: "100vh", background: "#050505", color: "#e5e5e5",
      fontFamily: "Georgia, 'Noto Serif SC', serif",
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* BG watermark */}
      <div style={{
        position: "fixed", inset: 0, overflow: "hidden", opacity: 0.025,
        fontFamily: "monospace", fontSize: "14px", lineHeight: "18px",
        color: "#2dd4bf", wordBreak: "break-all", padding: "20px",
        pointerEvents: "none", zIndex: 0,
      }}>
        {"3." + PI_STR + PI_STR}
      </div>

      <div style={{
        position: "fixed", top: "20%", left: "30%", width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(45,212,191,0.04) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ═══ TOP: Header + Pi stream ═══ */}
      <div style={{flexShrink: 0, position: "relative", zIndex: 10}}>
        {/* Header */}
        <div style={{padding: "16px 32px 10px", borderBottom: "1px solid rgba(45,212,191,0.1)"}}>
          <div style={{display: "flex", alignItems: "baseline", gap: "12px"}}>
            {onBack && <button onClick={onBack} style={{padding: "3px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "#525252", cursor: "pointer", fontSize: "11px", fontFamily: "'Courier New', monospace", transition: "all 0.2s", marginRight: "4px", alignSelf: "center"}}>{"← 首页"}</button>}
            <span style={{fontSize: "36px", color: "#2dd4bf", fontFamily: "'Courier New', monospace", fontWeight: 700}}>{"\u03C0"}</span>
            <h1 style={{fontSize: "18px", fontWeight: 400, letterSpacing: "4px", textTransform: "uppercase", color: "#e5e5e5", margin: 0, fontFamily: "'Courier New', monospace"}}>THE MIRROR</h1>
            <span style={{flex: 1}} />
            {[
              ["3.14159...", "\u03C0", "#2dd4bf"],
              [String(EVENTS.length), "Events", "#e8c170"],
              [String(voidZones.length), "Voids", "#ef4444"],
              ["\u221E", "Sequences", "#737373"],
            ].map(function(item, i) {
              return (
                <div key={i} style={{textAlign: "right", marginLeft: "20px"}}>
                  <div style={{fontSize: "16px", color: item[2], fontWeight: 700, fontFamily: "'Courier New', monospace"}}>{item[0]}</div>
                  <div style={{fontSize: "10px", color: "#404040", letterSpacing: "1px", fontFamily: "'Courier New', monospace"}}>{item[1]}</div>
                </div>
              );
            })}
          </div>
          <p style={{fontSize: "13px", color: "#525252", margin: "6px 0 0", lineHeight: 1.7, fontFamily: "'Courier New', monospace"}}>
            {"\u03C0"} is older than the universe by 13.8 billion years. Every event in human history, once encoded, already exists somewhere within it.
          </p>
        </div>

        {/* Pi stream — single horizontal strip */}
        <div style={{
          height: "88px", borderBottom: "1px solid rgba(45,212,191,0.08)",
          background: "rgba(0,0,0,0.3)", overflow: "hidden", position: "relative",
        }}>
          <div style={{
            position: "absolute", top: "8px", left: "16px",
            fontSize: "11px", color: "#333", letterSpacing: "3px", zIndex: 2,
            fontFamily: "'Courier New', monospace",
          }}>3.</div>
          <PiStream highlightPos={highlightPos} highlightLen={highlightLen} scrollToPos={scrollToPos} horizontal={true} />
        </div>
      </div>

      {/* ═══ MIDDLE: Horizontal Timeline (vertically centered via flex) ═══ */}
      <div ref={timelineRef} style={{
        flexShrink: 0,
        position: "relative", zIndex: 5,
        borderBottom: "1px solid rgba(45,212,191,0.08)",
        overflowX: "auto", overflowY: "hidden",
        padding: "0 32px",
      }}>
        {/* Horizontal axis line */}
        <div style={{
          position: "absolute", left: "32px", right: "32px", top: "50%", height: "1px",
          background: "linear-gradient(to right, transparent, rgba(45,212,191,0.2) 5%, rgba(45,212,191,0.2) 95%, transparent)",
          pointerEvents: "none",
        }} />

        <div style={{display: "flex", paddingTop: "16px", paddingBottom: "16px", minWidth: "max-content"}}>
          {eventResults.map(function(event, i) {
            var isSel = selectedEvent && selectedEvent.code === event.code;
            var isHov = hoveredIdx === i;
            return (
              <div
                key={i}
                onClick={function() { handleEventClick(event); }}
                onMouseEnter={function() { setHoveredIdx(i); }}
                onMouseLeave={function() { setHoveredIdx(-1); }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  width: "72px", flexShrink: 0,
                  cursor: "pointer", transition: "all 0.2s",
                  opacity: selectedEvent && !isSel ? 0.3 : 1,
                  position: "relative",
                }}
              >
                <div style={{
                  fontSize: "10px", color: isSel ? event.color : "#404040",
                  fontFamily: "'Courier New', monospace",
                  marginBottom: "6px", whiteSpace: "nowrap",
                  fontWeight: isSel ? 700 : 400,
                }}>
                  {event.year < 0 ? (-event.year + "BC") : event.year}
                </div>

                <div style={{
                  width: isSel ? "14px" : isHov ? "12px" : "8px",
                  height: isSel ? "14px" : isHov ? "12px" : "8px",
                  borderRadius: "50%", background: event.color,
                  boxShadow: isSel ? ("0 0 16px " + event.color + "aa") : "none",
                  transition: "all 0.3s",
                  marginBottom: "6px", flexShrink: 0,
                }} />

                <div style={{
                  fontSize: "14px", fontFamily: "'Courier New', monospace",
                  color: isSel ? event.color : "#444", fontWeight: 700,
                  width: "24px", height: "24px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isSel ? (event.color + "15") : "transparent",
                  borderRadius: "4px", marginBottom: "4px",
                }}>
                  {event.icon}
                </div>

                <div style={{
                  fontSize: "11px", fontWeight: isSel ? 700 : 500,
                  color: isSel ? event.color : "#999",
                  textAlign: "center", lineHeight: 1.3,
                  maxWidth: "68px", overflow: "hidden",
                  whiteSpace: "nowrap", textOverflow: "ellipsis",
                }}>
                  {event.name}
                </div>

                {isSel && (
                  <div style={{
                    position: "absolute", bottom: "-1px", left: "50%", transform: "translateX(-50%)",
                    width: "1px", height: "16px",
                    background: "linear-gradient(to bottom, " + event.color + ", transparent)",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ BOTTOM: Detail + Void Zones (scrollable) ═══ */}
      <div style={{flex: 1, overflow: "auto", position: "relative", zIndex: 5, minHeight: 0, padding: "20px 32px"}}>

        {/* Selected event detail */}
        {selectedEvent && (
          <div style={{
            marginBottom: "24px", padding: "20px",
            background: "linear-gradient(135deg, " + selectedEvent.color + "08, transparent)",
            border: "1px solid " + selectedEvent.color + "33",
            borderRadius: "8px",
          }}>
            <div style={{display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px"}}>
              <span style={{
                fontSize: "28px", width: "48px", height: "48px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: selectedEvent.color + "15",
                borderRadius: "50%", fontFamily: "'Courier New', monospace",
                color: selectedEvent.color, fontWeight: 700,
              }}>
                {selectedEvent.icon}
              </span>
              <div>
                <div style={{fontSize: "20px", fontWeight: 600, color: selectedEvent.color}}>{selectedEvent.name}</div>
                <div style={{fontSize: "14px", color: "#737373"}}>{selectedEvent.en} {" \u00B7 "} {selectedEvent.year < 0 ? ("BC" + (-selectedEvent.year)) : selectedEvent.year}</div>
              </div>
            </div>

            <div style={{fontFamily: "'Courier New', monospace", fontSize: "14px", lineHeight: 2.0, color: "#a3a3a3"}}>
              <div>{"Encoding: "}<span style={{color: "#e5e5e5", letterSpacing: "2px"}}>{selectedEvent.code}</span></div>
              <div>
                {"\u03C0 Position: "}<span style={{color: "#2dd4bf"}}>{"#" + (findInPi(selectedEvent.code).pos + 1)}</span>
                <span style={{color: "#525252"}}>{" (" + findInPi(selectedEvent.code).matchLen + " digits matched)"}</span>
              </div>
              <div style={{marginTop: "12px", padding: "14px", background: "rgba(0,0,0,0.3)", borderRadius: "6px", fontSize: "20px", letterSpacing: "5px"}}>
                {(function() {
                  var r = findInPi(selectedEvent.code);
                  var before = PI_STR.substring(Math.max(0, r.pos - 8), r.pos);
                  var match = PI_STR.substring(r.pos, r.pos + r.matchLen);
                  var after = PI_STR.substring(r.pos + r.matchLen, r.pos + r.matchLen + 8);
                  return (
                    <span>
                      <span style={{color: "#333"}}>{"..." + before}</span>
                      <span style={{
                        color: "#2dd4bf", fontWeight: 700,
                        textShadow: "0 0 8px rgba(45,212,191,0.3)",
                        background: "rgba(45,212,191,0.1)",
                        padding: "2px 6px", borderRadius: "4px",
                      }}>{match}</span>
                      <span style={{color: "#333"}}>{after + "..."}</span>
                    </span>
                  );
                })()}
              </div>
              <div style={{marginTop: "12px", fontSize: "14px", color: "#404040", fontStyle: "italic", fontFamily: "Georgia, serif"}}>
                {"This sequence existed before the Big Bang. " + selectedEvent.name + " happened " + Math.abs(selectedEvent.year) + " years " + (selectedEvent.year < 0 ? "BCE" : "CE") + "."}
              </div>
            </div>
          </div>
        )}

        {/* Philosophy (always visible when no selection) */}
        {!selectedEvent && (
          <div style={{
            padding: "24px",
            background: "rgba(45,212,191,0.03)", border: "1px solid rgba(45,212,191,0.08)",
            borderRadius: "8px", marginBottom: "24px",
          }}>
            <div style={{fontSize: "15px", color: "#737373", lineHeight: 2.0, fontFamily: "Georgia, 'Noto Serif SC', serif"}}>
              <p style={{margin: "0 0 10px", color: "#a3a3a3"}}>
                {"\u03C0 is irrational and infinite. This means every finite digit sequence \u2014 your birthday, your bank PIN, the Unicode encoding of this very sentence \u2014 "}
                <span style={{color: "#2dd4bf"}}>must</span>
                {" appear somewhere within it."}
              </p>
              <p style={{margin: "0 0 10px", color: "#737373"}}>
                {"This is not prophecy. \u03C0 does not care about humanity. It \"existed\" before protons formed \u2014 if \"existed\" means anything for a mathematical constant."}
              </p>
              <p style={{margin: 0, color: "#525252", fontStyle: "italic"}}>
                {"We didn't discover history inside \u03C0. We just discovered that \u03C0 never missed anything."}
              </p>
            </div>
          </div>
        )}

        {/* VOID ZONES — always visible */}
        <div style={{marginTop: selectedEvent ? "0" : "0"}}>
          <div
            onClick={function() { setShowVoid(!showVoid); }}
            style={{cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px"}}
          >
            <span style={{
              fontSize: "15px", color: "#ef4444", fontFamily: "monospace",
              width: "28px", height: "28px", display: "inline-flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(239,68,68,0.3)", borderRadius: "50%",
              animation: showVoid ? "none" : "pulse 2s infinite",
            }}>{"?"}</span>
            <span style={{
              fontSize: "14px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase",
              fontFamily: "'Courier New', monospace", color: "#ef4444",
            }}>
              {"VOID ZONES \u2014 \u03C0 \u7684\u201C\u9884\u8A00\u201D"}
            </span>
            <span style={{fontSize: "13px", color: "#525252"}}>{showVoid ? "\u25BC" : "\u25B6"}</span>
          </div>

          {showVoid && (
            <div>
              <div style={{fontSize: "14px", color: "#737373", lineHeight: 1.9, marginBottom: "18px", fontFamily: "Georgia, 'Noto Serif SC', serif"}}>
                <p style={{margin: "0 0 8px"}}>
                  {"75\u4E2A\u5DF2\u77E5\u4E8B\u4EF6\u5728 \u03C0 \u4E2D\u7684\u4F4D\u7F6E\u5DF2\u88AB\u6807\u8BB0\u3002\u4F46\u5B83\u4EEC\u4E4B\u95F4\u5B58\u5728\u5927\u6BB5\u201C\u7A7A\u767D\u201D\u2014\u2014\u6CA1\u6709\u4EFB\u4F55\u5DF2\u77E5\u4E8B\u4EF6\u5339\u914D\u7684 \u03C0 \u5E8F\u5217\u3002"}
                </p>
                <p style={{margin: "0 0 8px", color: "#a3a3a3"}}>
                  {"\u5982\u679C\u6211\u4EEC\u7528\u540C\u6837\u7684\u7F16\u7801\u89C4\u5219\u53CD\u5411\u89E3\u7801\u8FD9\u4E9B\u7A7A\u767D\u5E8F\u5217\u2014\u2014\u628A\u524D4\u4F4D\u5F53\u5E74\u4EFD\uFF0C\u63A5\u4E0B\u67652\u4F4D\u5F53\u6708\u4EFD\uFF0C\u6700\u540E2\u4F4D\u5F53\u65E5\u671F\uFF0C\u7528\u6570\u5B57\u548C\u63A8\u5BFC\u5750\u6807\u2014\u2014\u6211\u4EEC\u5F97\u5230\u4E86\u4EC0\u4E48\uFF1F"}
                </p>
              </div>

              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px"}}>
                {voidZones.map(function(v, i) {
                  var pred = decodePrediction(v.digits);
                  var geo = geoLabel(pred.lat, pred.lng);
                  var confidence = Math.min(95, Math.floor(50 + v.gap * 0.3));
                  return (
                    <div key={i} onClick={function() {
                      setHighlightPos(v.mid);
                      setHighlightLen(8);
                      setScrollToPos(v.mid);
                      setSelectedEvent(null);
                    }} style={{
                      padding: "16px", background: "rgba(239,68,68,0.03)",
                      border: "1px solid rgba(239,68,68,0.12)",
                      borderRadius: "8px", cursor: "pointer", transition: "all 0.2s",
                    }}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px"}}>
                        <span style={{
                          fontSize: "12px", color: "#ef4444", fontFamily: "monospace",
                          padding: "3px 8px", border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: "4px", letterSpacing: "1px",
                        }}>{"VOID #" + (i + 1)}</span>
                        <span style={{fontSize: "11px", color: "#404040", fontFamily: "monospace"}}>
                          {"gap: " + v.gap}
                        </span>
                      </div>

                      <div style={{
                        padding: "10px", background: "rgba(0,0,0,0.3)", borderRadius: "6px",
                        fontFamily: "monospace", fontSize: "20px", letterSpacing: "5px",
                        color: "#ef4444", fontWeight: 700, textAlign: "center",
                        textShadow: "0 0 10px rgba(239,68,68,0.2)", marginBottom: "10px",
                      }}>
                        {v.digits}
                      </div>

                      <div style={{fontFamily: "monospace", fontSize: "12px", lineHeight: 1.9}}>
                        <span style={{color: "#525252"}}>{"Year: "}</span>
                        <span style={{color: "#ef4444", fontWeight: 600}}>{pred.year}</span>
                        <span style={{color: "#333"}}>{" \u00B7 "}</span>
                        <span style={{color: "#525252"}}>{"Loc: "}</span>
                        <span style={{color: "#f59e0b"}}>{geo}</span>
                      </div>

                      <div style={{marginTop: "8px", display: "flex", alignItems: "center", gap: "8px"}}>
                        <div style={{flex: 1, height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden"}}>
                          <div style={{width: confidence + "%", height: "100%", background: "linear-gradient(to right, #ef4444, #f59e0b)", borderRadius: "2px"}} />
                        </div>
                        <span style={{fontSize: "10px", color: "#525252", fontFamily: "monospace"}}>{confidence + "%"}</span>
                      </div>

                      <div style={{marginTop: "8px", fontSize: "12px", color: "rgba(239,68,68,0.4)", fontStyle: "italic", fontFamily: "Georgia, serif", lineHeight: 1.7}}>
                        {i === 0 ? "\u89E3\u7801\u6307\u5411" + pred.year + "\u5E74\uFF0C" + geo + "\u3002\u5C1A\u672A\u53D1\u751F\u7684\u4E8B\u4EF6\uFF0C\u5DF2\u5728 \u03C0 \u4E2D\u7B49\u5F85\u3002" :
                         i === 1 ? "\u4E0E\u5DF2\u77E5\u4E8B\u4EF6\u8DDD\u79BB\u8FBE " + v.gap + " \u4F4D\u2014\u2014\u6700\u5927\u7684\u201C\u6C89\u9ED8\u5730\u5E26\u201D\u3002" :
                         i === 2 ? "\u5750\u6807\u4E0E\u5730\u7403\u5730\u7406\u4F53\u7CFB\u4E0D\u5339\u914D\u3002\u53EF\u80FD\u4E0D\u53D1\u751F\u5728\u5730\u7403\u3002" :
                         i === 3 ? "\u5E74\u4EFD\u8D85\u51FA\u4EBA\u7C7B\u7EAA\u5E74\u4F53\u7CFB\u3002\u6216\u8BB8\u9700\u8981\u65B0\u7684\u7F16\u7801\u4F53\u7CFB\u3002" :
                         "\u03C0 \u4FDD\u6301\u6C89\u9ED8\u3002\u5B83\u77E5\u9053\u4EC0\u4E48\uFF0C\u4F46\u6211\u4EEC\u8FD8\u65E0\u6CD5\u63CF\u8FF0\u3002"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Key insight */}
              <div style={{
                marginTop: "20px", padding: "20px",
                background: "linear-gradient(135deg, rgba(239,68,68,0.04), rgba(245,158,11,0.04))",
                border: "1px solid rgba(239,68,68,0.1)", borderRadius: "8px",
              }}>
                <div style={{fontSize: "14px", color: "#a3a3a3", lineHeight: 2.0, fontFamily: "Georgia, 'Noto Serif SC', serif"}}>
                  <p style={{margin: "0 0 8px", fontWeight: 600, color: "#ef4444", fontFamily: "monospace", fontSize: "13px", letterSpacing: "2px"}}>KEY INSIGHT</p>
                  <p style={{margin: "0 0 8px"}}>{"\u8FD9\u4E9B\u201C\u9884\u6D4B\u201D\u5F53\u7136\u4E0D\u662F\u771F\u6B63\u7684\u9884\u8A00\u3002\u03C0 \u4E0D\u5173\u5FC3\u4EBA\u7C7B\u3002\u4F46\u5B83\u63ED\u793A\u4E86\u4E00\u4E2A\u8BA9\u4EBA\u4E0D\u5B89\u7684\u4E8B\u5B9E\uFF1A"}</p>
                  <p style={{margin: "0 0 8px", color: "#e5e5e5"}}>{"\u5728\u4E00\u4E2A\u65E0\u9650\u4E0D\u5FAA\u73AF\u7684\u6570\u5B57\u4E32\u4E2D\uFF0C\u6BCF\u4E00\u4E2A\u53EF\u80FD\u7684\u6709\u9650\u5E8F\u5217\u90FD\u5FC5\u7136\u51FA\u73B0\u3002\u4F60\u7684\u6B7B\u4EA1\u65E5\u671F\u5DF2\u201C\u5199\u201D\u5728 \u03C0 \u91CC\u3002\u4E0D\u662F\u56E0\u679C\u3002\u662F\u5DE7\u5408\u7684\u7A77\u4E3E\u3002"}</p>
                  <p style={{margin: 0, color: "#737373", fontStyle: "italic"}}>{"\u4F46\u201C\u5DE7\u5408\u7684\u7A77\u4E3E\u201D\u548C\u201C\u547D\u8FD0\u201D\u4E4B\u95F4\uFF0C\u754C\u7EBF\u5728\u54EA\uFF1F"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{padding: "20px 0", textAlign: "center", fontSize: "12px", color: "#1a1a1a", letterSpacing: "3px", fontFamily: "'Courier New', monospace"}}>
          {"\u03C0 DOES NOT PREDICT \u00B7 \u03C0 DOES NOT FORGET \u00B7 \u03C0 SIMPLY IS"}
        </div>
      </div>

      <style>{"\n        * { box-sizing: border-box; margin: 0; }\n        ::-webkit-scrollbar { width: 4px; height: 4px; }\n        ::-webkit-scrollbar-track { background: transparent; }\n        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px; }\n        ::-webkit-scrollbar-thumb:hover { background: #333; }\n        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }\n      "}</style>
    </div>
  );
}
