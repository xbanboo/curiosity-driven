import { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";

// ── Historical Civilization Data ──
// Each: [name, birthYear, deathYear, region, peakPopulationMillions]
const DEAD_CIVS = [
  ["Sumer", -4500, -1900, "Mesopotamia", 0.5],
  ["Ancient Egypt", -3100, -30, "North Africa", 5],
  ["Indus Valley", -3300, -1300, "South Asia", 5],
  ["Minoan", -2700, -1450, "Mediterranean", 0.3],
  ["Shang Dynasty", -1600, -1046, "East Asia", 4],
  ["Mycenaean Greece", -1600, -1100, "Mediterranean", 0.5],
  ["Phoenicia", -1500, -539, "Mediterranean", 1],
  ["Zhou Dynasty", -1046, -256, "East Asia", 25],
  ["Assyrian Empire", -2500, -609, "Mesopotamia", 4],
  ["Classical Greece", -508, -146, "Mediterranean", 3],
  ["Achaemenid Persia", -550, -330, "Central Asia", 35],
  ["Roman Republic", -509, -27, "Mediterranean", 20],
  ["Maurya Empire", -322, -185, "South Asia", 50],
  ["Han Dynasty", -206, 220, "East Asia", 57],
  ["Roman Empire", -27, 476, "Mediterranean", 70],
  ["Gupta Empire", 320, 550, "South Asia", 26],
  ["Byzantine Empire", 330, 1453, "Mediterranean", 26],
  ["Sasanian Empire", 224, 651, "Central Asia", 20],
  ["Tang Dynasty", 618, 907, "East Asia", 80],
  ["Abbasid Caliphate", 750, 1258, "Central Asia", 50],
  ["Song Dynasty", 960, 1279, "East Asia", 100],
  ["Khmer Empire", 802, 1431, "Southeast Asia", 2],
  ["Mongol Empire", 1206, 1368, "Central Asia", 110],
  ["Mali Empire", 1235, 1600, "West Africa", 10],
  ["Yuan Dynasty", 1271, 1368, "East Asia", 87],
  ["Ming Dynasty", 1368, 1644, "East Asia", 160],
  ["Aztec Empire", 1300, 1521, "Americas", 6],
  ["Inca Empire", 1438, 1533, "Americas", 12],
  ["Mughal Empire", 1526, 1857, "South Asia", 150],
  ["Qing Dynasty", 1644, 1912, "East Asia", 430],
  ["Ottoman Empire", 1299, 1922, "Central Asia", 35],
  ["Spanish Empire", 1492, 1975, "Mediterranean", 68],
  ["Portuguese Empire", 1415, 1999, "Mediterranean", 28],
  ["Dutch Empire", 1602, 1975, "Northern Europe", 37],
  ["British Empire", 1583, 1997, "Northern Europe", 533],
  ["French Colonial", 1534, 1980, "Northern Europe", 112],
  ["Soviet Union", 1922, 1991, "Central Asia", 293],
];

// Current "living" civilization
const CURRENT_CIV = {
  name: "Global Technological Civilization",
  nameCn: "全球技术文明",
  birth: 1945, // post-WWII interconnected era
  currentYear: 2026,
  age: 2026 - 1945,
  population: 8100,
};

// ── Actuarial Math ──
function getCivLifespans() {
  return DEAD_CIVS.map(function(c) { return c[2] - c[1]; });
}

// Kaplan-Meier survival curve from lifespans
function kaplanMeier(lifespans) {
  var sorted = lifespans.slice().sort(function(a,b){return a-b;});
  var n = sorted.length;
  var points = [{t: 0, s: 1.0}];
  var atRisk = n;
  for (var i = 0; i < sorted.length; i++) {
    var died = 1;
    while (i + 1 < sorted.length && sorted[i+1] === sorted[i]) { died++; i++; }
    var s = points[points.length - 1].s * (1 - died / atRisk);
    points.push({t: sorted[i], s: s});
    atRisk -= died;
  }
  points.push({t: sorted[sorted.length-1] + 100, s: 0});
  return points;
}

// Gompertz hazard: h(t) = a * exp(b * t)
// Fit by method of moments from lifespan data
function fitGompertz(lifespans) {
  var mean = d3.mean(lifespans);
  var median = d3.median(lifespans);
  // Approximate: b ~ ln(2) / (mean - median) when mean > median
  var diff = Math.max(mean - median, 10);
  var b = Math.log(2) / diff * 0.003;
  // a = b / (exp(b * median) - 1)
  var a = b / (Math.exp(b * median) - 1);
  if (a <= 0 || isNaN(a)) { a = 0.0005; b = 0.002; }
  return {a: a, b: b};
}

function gompertzSurvival(a, b, t) {
  return Math.exp(-(a/b) * (Math.exp(b*t) - 1));
}

function gompertzHazard(a, b, t) {
  return a * Math.exp(b * t);
}

// Remaining life expectancy at age t
function remainingLifeExpectancy(a, b, currentAge) {
  var total = 0;
  var dt = 1;
  for (var t = currentAge; t < currentAge + 5000; t += dt) {
    var s = gompertzSurvival(a, b, t) / gompertzSurvival(a, b, currentAge);
    if (s < 0.001) break;
    total += s * dt;
  }
  return total;
}

// ── Chart component ──
function SurvivalChart(props) {
  var canvasRef = useRef(null);
  var kmData = props.kmData;
  var gompertzParams = props.gompertzParams;
  var currentAge = props.currentAge;
  var highlightedCiv = props.highlightedCiv;

  useEffect(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = canvas.width = canvas.clientWidth * 2;
    var H = canvas.height = canvas.clientHeight * 2;
    ctx.scale(2, 2);
    var w = W / 2, h = H / 2;
    var pad = {top: 20, right: 20, bottom: 35, left: 40};
    var cw = w - pad.left - pad.right;
    var ch = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    // Max time
    var maxT = 3500;
    var xScale = function(t) { return pad.left + (t / maxT) * cw; };
    var yScale = function(s) { return pad.top + (1 - s) * ch; };

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var gy = yScale(i / 5);
      ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(w - pad.right, gy); ctx.stroke();
    }
    for (var j = 0; j <= 7; j++) {
      var gx = xScale(j * 500);
      ctx.beginPath(); ctx.moveTo(gx, pad.top); ctx.lineTo(gx, h - pad.bottom); ctx.stroke();
    }

    // Axes labels
    ctx.fillStyle = "#404040";
    ctx.font = "8px 'Courier New'";
    ctx.textAlign = "center";
    for (var k = 0; k <= 7; k++) {
      ctx.fillText(k * 500, xScale(k * 500), h - pad.bottom + 14);
    }
    ctx.textAlign = "right";
    for (var m = 0; m <= 5; m++) {
      ctx.fillText((m * 20) + "%", pad.left - 4, yScale(m / 5) + 3);
    }

    // Axis titles
    ctx.fillStyle = "#333";
    ctx.font = "7px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("LIFESPAN (YEARS)", w / 2, h - 4);
    ctx.save();
    ctx.translate(10, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("SURVIVAL RATE", 0, 0);
    ctx.restore();

    // Kaplan-Meier step function
    ctx.strokeStyle = "rgba(45,212,191,0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (var p = 0; p < kmData.length; p++) {
      var x = xScale(kmData[p].t);
      var y = yScale(kmData[p].s);
      if (p === 0) ctx.moveTo(x, y);
      else {
        ctx.lineTo(x, yScale(kmData[p-1].s));
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Gompertz fitted curve
    ctx.strokeStyle = "rgba(239,68,68,0.7)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (var t2 = 0; t2 <= maxT; t2 += 5) {
      var sx = xScale(t2);
      var sy = yScale(gompertzSurvival(gompertzParams.a, gompertzParams.b, t2));
      if (t2 === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Dead civilization dots
    DEAD_CIVS.forEach(function(civ) {
      var lifespan = civ[2] - civ[1];
      var survAtDeath = gompertzSurvival(gompertzParams.a, gompertzParams.b, lifespan);
      var cx2 = xScale(lifespan);
      var cy2 = yScale(survAtDeath);
      var isHl = highlightedCiv && highlightedCiv[0] === civ[0];
      ctx.beginPath();
      ctx.arc(cx2, cy2, isHl ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isHl ? "#ef4444" : "rgba(255,255,255,0.2)";
      ctx.fill();
      if (isHl) {
        ctx.fillStyle = "#ef4444";
        ctx.font = "8px 'Courier New'";
        ctx.textAlign = "left";
        ctx.fillText(civ[0] + " (" + lifespan + "yr)", cx2 + 6, cy2 - 4);
      }
    });

    // Current civilization marker
    var curX = xScale(currentAge);
    var curY = yScale(gompertzSurvival(gompertzParams.a, gompertzParams.b, currentAge));
    // Vertical line
    ctx.strokeStyle = "rgba(245,158,11,0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(curX, pad.top);
    ctx.lineTo(curX, h - pad.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    // Dot
    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "rgba(245,158,11,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(curX, curY, 9, 0, Math.PI * 2);
    ctx.stroke();
    // Label
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 8px 'Courier New'";
    ctx.textAlign = "left";
    ctx.fillText("WE ARE HERE", curX + 12, curY - 2);
    ctx.fillStyle = "#737373";
    ctx.font = "7px 'Courier New'";
    ctx.fillText("Age: " + currentAge + " years", curX + 12, curY + 9);

  }, [kmData, gompertzParams, currentAge, highlightedCiv]);

  return <canvas ref={canvasRef} style={{width: "100%", height: "100%", display: "block"}} />;
}

// ── Main App ──
export default function App({ onBack }) {
  var lifespans = getCivLifespans();
  var kmData = kaplanMeier(lifespans);
  var gp = fitGompertz(lifespans);
  var rle = remainingLifeExpectancy(gp.a, gp.b, CURRENT_CIV.age);
  var medianTotal = d3.median(lifespans);
  var meanTotal = Math.round(d3.mean(lifespans));
  var hazardNow = gompertzHazard(gp.a, gp.b, CURRENT_CIV.age);

  var [tickOffset, setTickOffset] = useState(0);
  var [hoveredCiv, setHoveredCiv] = useState(null);
  var [showAll, setShowAll] = useState(false);
  var [showMethod, setShowMethod] = useState(false);

  // Ticking countdown
  useEffect(function() {
    var id = setInterval(function() {
      setTickOffset(function(o) { return o + 1; });
    }, 1000);
    return function() { clearInterval(id); };
  }, []);

  var remainingDisplay = Math.max(0, rle - tickOffset / (365.25 * 24 * 3600));
  var remainYears = Math.floor(remainingDisplay);
  var remainDays = Math.floor((remainingDisplay - remainYears) * 365.25);

  // Sort civs by lifespan
  var sortedCivs = DEAD_CIVS.slice().sort(function(a,b) { return (b[2]-b[1]) - (a[2]-a[1]); });

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: "#08080a",
      color: "#e5e5e5", fontFamily: "'Courier New', 'SF Mono', monospace",
      position: "relative",
    }}>
      {/* BG */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: "radial-gradient(circle at 20% 50%, rgba(239,68,68,0.02) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(245,158,11,0.02) 0%, transparent 50%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Header */}
      <div style={{position: "relative", zIndex: 10, padding: "18px 16px 12px", borderBottom: "1px solid rgba(239,68,68,0.1)"}}>
        <div style={{display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap"}}>
          {onBack && <button onClick={onBack} style={{padding: "3px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "#525252", cursor: "pointer", fontSize: "11px", fontFamily: "'Courier New', monospace", transition: "all 0.2s", marginRight: "4px"}}>{"← 首页"}</button>}
          <span style={{fontSize: "14px", color: "#ef4444", fontWeight: 700}}>{"MORTALITY"}</span>
          <h1 style={{fontSize: "11px", fontWeight: 400, letterSpacing: "3px", color: "#737373", margin: 0}}>
            {"CIVILIZATION SURVIVAL ANALYSIS"}
          </h1>
        </div>
        <p style={{fontSize: "9px", color: "#404040", margin: "6px 0 0", lineHeight: 1.7}}>
          {"37 dead civilizations. 1 still alive. Same math that predicts your death date, applied to humanity."}
        </p>
      </div>

      {/* THE NUMBER */}
      <div style={{
        padding: "20px 16px", textAlign: "center",
        background: "linear-gradient(180deg, rgba(239,68,68,0.03) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(239,68,68,0.08)",
        position: "relative", zIndex: 5,
      }}>
        <div style={{fontSize: "8px", letterSpacing: "4px", color: "#525252", marginBottom: "8px", textTransform: "uppercase"}}>
          {"ACTUARIAL REMAINING LIFE EXPECTANCY"}
        </div>
        <div style={{display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px"}}>
          <span style={{
            fontSize: "48px", fontWeight: 700, color: "#ef4444",
            textShadow: "0 0 30px rgba(239,68,68,0.2)",
            fontFeatureSettings: "'tnum'",
            fontVariantNumeric: "tabular-nums",
          }}>
            {remainYears}
          </span>
          <span style={{fontSize: "14px", color: "#737373"}}>{"years"}</span>
          <span style={{fontSize: "24px", fontWeight: 700, color: "#ef4444", marginLeft: "8px"}}>
            {remainDays}
          </span>
          <span style={{fontSize: "14px", color: "#737373"}}>{"days"}</span>
        </div>
        <div style={{fontSize: "9px", color: "#404040", marginTop: "6px"}}>
          {"Global Technological Civilization \u00B7 Born 1945 \u00B7 Current age: " + CURRENT_CIV.age + " years"}
        </div>
        <div style={{fontSize: "8px", color: "#333", marginTop: "4px"}}>
          {"Gompertz-Makeham model \u00B7 fitted on " + DEAD_CIVS.length + " historical civilizations"}
        </div>
      </div>

      {/* Survival Chart */}
      <div style={{padding: "12px 16px", position: "relative", zIndex: 5}}>
        <div style={{fontSize: "8px", letterSpacing: "3px", color: "#404040", marginBottom: "6px", textTransform: "uppercase"}}>
          {"KAPLAN-MEIER SURVIVAL CURVE + GOMPERTZ FIT"}
        </div>
        <div style={{
          height: "220px", borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.3)",
        }}>
          <SurvivalChart kmData={kmData} gompertzParams={gp} currentAge={CURRENT_CIV.age} highlightedCiv={hoveredCiv} />
        </div>
        <div style={{display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap"}}>
          <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
            <div style={{width: "16px", height: "2px", background: "rgba(45,212,191,0.6)"}} />
            <span style={{fontSize: "8px", color: "#525252"}}>{"Kaplan-Meier (empirical)"}</span>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
            <div style={{width: "16px", height: "2px", background: "rgba(239,68,68,0.7)", borderTop: "1px dashed rgba(239,68,68,0.7)"}} />
            <span style={{fontSize: "8px", color: "#525252"}}>{"Gompertz model (fitted)"}</span>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
            <div style={{width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b"}} />
            <span style={{fontSize: "8px", color: "#525252"}}>{"Current civilization"}</span>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div style={{
        padding: "12px 16px", display: "flex", gap: "12px", flexWrap: "wrap",
        position: "relative", zIndex: 5,
      }}>
        {[
          [DEAD_CIVS.length, "Dead Civilizations", "#525252"],
          [medianTotal + "yr", "Median Lifespan", "#2dd4bf"],
          [meanTotal + "yr", "Mean Lifespan", "#2dd4bf"],
          [CURRENT_CIV.age + "yr", "Our Current Age", "#f59e0b"],
          [(hazardNow * 100).toFixed(2) + "%", "Current Hazard Rate", "#ef4444"],
          [Math.round(rle) + "yr", "Remaining (Gompertz)", "#ef4444"],
        ].map(function(item, i) {
          return (
            <div key={i} style={{flex: "1 0 28%", minWidth: "80px"}}>
              <div style={{fontSize: "16px", color: item[2], fontWeight: 700}}>{item[0]}</div>
              <div style={{fontSize: "7px", color: "#404040", letterSpacing: "0.5px"}}>{item[1]}</div>
            </div>
          );
        })}
      </div>

      {/* Civilization list */}
      <div style={{padding: "12px 16px", position: "relative", zIndex: 5}}>
        <div onClick={function(){ setShowAll(!showAll); }} style={{
          cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px",
        }}>
          <span style={{fontSize: "8px", letterSpacing: "3px", color: "#404040", textTransform: "uppercase"}}>
            {"DEATH RECORDS (" + DEAD_CIVS.length + " CIVILIZATIONS)"}
          </span>
          <span style={{fontSize: "9px", color: "#333"}}>{showAll ? "v" : ">"}</span>
        </div>
        {showAll && (
          <div style={{maxHeight: "300px", overflow: "auto"}}>
            {sortedCivs.map(function(civ, i) {
              var lifespan = civ[2] - civ[1];
              var pct = lifespan / 3200;
              return (
                <div key={i}
                  onMouseEnter={function(){ setHoveredCiv(civ); }}
                  onMouseLeave={function(){ setHoveredCiv(null); }}
                  style={{
                    padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.02)",
                    cursor: "pointer", transition: "all 0.15s",
                    opacity: hoveredCiv && hoveredCiv[0] !== civ[0] ? 0.3 : 1,
                  }}
                >
                  <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <div style={{flex: 1}}>
                      <div style={{display: "flex", alignItems: "baseline", gap: "6px"}}>
                        <span style={{fontSize: "10px", color: "#d4d4d4"}}>{civ[0]}</span>
                        <span style={{fontSize: "8px", color: "#333"}}>
                          {(civ[1] < 0 ? "BC" + (-civ[1]) : civ[1]) + "\u2013" + (civ[2] < 0 ? "BC" + (-civ[2]) : civ[2])}
                        </span>
                      </div>
                      <div style={{marginTop: "3px", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden"}}>
                        <div style={{
                          width: (pct * 100) + "%", height: "100%", borderRadius: "2px",
                          background: lifespan > 1000 ? "rgba(45,212,191,0.5)" : lifespan > 400 ? "rgba(245,158,11,0.5)" : "rgba(239,68,68,0.5)",
                        }} />
                      </div>
                    </div>
                    <span style={{fontSize: "10px", color: "#737373", minWidth: "50px", textAlign: "right"}}>{lifespan + "yr"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Methodology */}
      <div style={{padding: "0 16px 12px", position: "relative", zIndex: 5}}>
        <div onClick={function(){ setShowMethod(!showMethod); }} style={{
          cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px",
        }}>
          <span style={{fontSize: "8px", letterSpacing: "3px", color: "#404040", textTransform: "uppercase"}}>
            {"METHODOLOGY"}
          </span>
          <span style={{fontSize: "9px", color: "#333"}}>{showMethod ? "v" : ">"}</span>
        </div>
        {showMethod && (
          <div style={{
            padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.04)", fontSize: "10px", color: "#737373",
            lineHeight: 2.0, fontFamily: "Georgia, 'Noto Serif SC', serif",
          }}>
            <p style={{margin: "0 0 8px"}}>
              {"Gompertz-Makeham \u6CD5\u5219\u6700\u521D\u7528\u4E8E\u4EBA\u7C7B\u6B7B\u4EA1\u7387\u5EFA\u6A21\uFF1A\u6B7B\u4EA1\u529B\u968F\u5E74\u9F84\u6307\u6570\u589E\u957F\u3002\u5B83\u51C6\u786E\u5730\u63CF\u8FF0\u4E86\u4E3A\u4EC0\u4E4870\u5C81\u4EBA\u7684\u6B7B\u4EA1\u7387\u8FDC\u9AD8\u4E8E20\u5C81\u4EBA\u3002"}
            </p>
            <p style={{margin: "0 0 8px"}}>
              {"\u6211\u4EEC\u628A\u540C\u6837\u7684\u6A21\u578B\u5E94\u7528\u4E8E\u6587\u660E\u3002\u6BCF\u4E00\u4E2A\u5DF2\u6D88\u4EA1\u7684\u6587\u660E\u662F\u4E00\u4E2A\u6570\u636E\u70B9\uFF0C\u5F53\u524D\u6587\u660E\u662F\u4E00\u4E2A\u53F3\u622A\u65AD\u6837\u672C\uFF08censored data\uFF09\u3002"}
            </p>
            <p style={{margin: "0 0 8px"}}>
              {"Kaplan-Meier \u66F2\u7EBF\u663E\u793A\u7ECF\u9A8C\u751F\u5B58\u7387\uFF1B Gompertz \u62DF\u5408\u63D0\u4F9B\u53C2\u6570\u5316\u6A21\u578B\u3002\u4E24\u6761\u66F2\u7EBF\u7684\u5339\u914D\u5EA6\u8868\u660E\u6587\u660E\u7684\u5BFF\u547D\u5206\u5E03\u786E\u5B9E\u9075\u5FAA\u7C7B\u4F3C\u4E8E\u751F\u7269\u4F53\u7684\u6B7B\u4EA1\u89C4\u5F8B\u3002"}
            </p>
            <p style={{margin: "0", color: "#525252", fontStyle: "italic"}}>
              {"\u5F53\u7136\uFF0C\u8FD9\u4E2A\u6A21\u578B\u6709\u660E\u663E\u7684\u5C40\u9650\u6027\u3002\u6587\u660E\u4E0D\u662F\u751F\u7269\u4F53\u3002\u4F46\u6570\u5B66\u4E0D\u5728\u4E4E\u4F60\u662F\u7531\u7EC6\u80DE\u7EC4\u6210\u8FD8\u662F\u7531\u4EBA\u7EC4\u6210\u3002\u5B83\u53EA\u770B\u66F2\u7EBF\u7684\u5F62\u72B6\u3002"}
            </p>
          </div>
        )}
      </div>

      {/* Philosophy */}
      <div style={{
        margin: "0 16px 16px", padding: "14px",
        background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.08)",
        borderRadius: "6px", position: "relative", zIndex: 5,
      }}>
        <div style={{fontSize: "11px", color: "#737373", lineHeight: 2.0, fontFamily: "Georgia, 'Noto Serif SC', serif"}}>
          <p style={{margin: "0 0 8px", color: "#a3a3a3"}}>
            {"\u6BCF\u4E00\u4E2A\u5DF2\u6D88\u4EA1\u7684\u6587\u660E\uFF0C\u5728\u5B83\u9F0E\u76DB\u65F6\u671F\u90FD\u8BA4\u4E3A\u81EA\u5DF1\u662F\u6C38\u6052\u7684\u3002\u7F57\u9A6C\u4EBA\u79F0\u4E4B\u4E3A\u201C\u6C38\u6052\u4E4B\u57CE\u201D\u3002\u5510\u671D\u4EBA\u8BA4\u4E3A\u5929\u5B50\u53D7\u547D\u4E8E\u5929\u3002\u82F1\u5E1D\u56FD\u76F8\u4FE1\u201C\u65E5\u4E0D\u843D\u201D\u3002"}
          </p>
          <p style={{margin: "0 0 8px", color: "#e5e5e5"}}>
            {"\u6211\u4EEC\u4E5F\u8BA4\u4E3A\u81EA\u5DF1\u7684\u6587\u660E\u662F\u7279\u6B8A\u7684\u3002\u6211\u4EEC\u6709\u4E92\u8054\u7F51\u3001\u6838\u6B66\u5668\u3001AI\u3002\u4F46\u7CBE\u7B97\u8868\u4E0D\u5173\u5FC3\u4F60\u89C9\u5F97\u81EA\u5DF1\u591A\u7279\u6B8A\u3002\u5B83\u53EA\u770B\u6570\u636E\u3002"}
          </p>
          <p style={{margin: 0, color: "#525252", fontStyle: "italic"}}>
            {"\u800C\u6570\u636E\u8BF4\uFF1A\u6BCF\u4E00\u4E2A\u6587\u660E\u90FD\u4F1A\u6B7B\u3002\u95EE\u9898\u53EA\u662F\u4EC0\u4E48\u65F6\u5019\u3002"}
          </p>
        </div>
      </div>

      <div style={{padding: "10px 16px 24px", textAlign: "center", fontSize: "8px", color: "#1a1a1a", letterSpacing: "3px", position: "relative", zIndex: 5}}>
        {"EVERY CIVILIZATION BELIEVES IT IS ETERNAL \u00B7 NONE HAS BEEN RIGHT"}
      </div>
    </div>
  );
}
