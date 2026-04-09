import { useState, useEffect, useRef, useCallback } from "react";

// ── CMB Anisotropy Data ──
// Simulated CMB temperature fluctuation map (64x32 grid, values -200 to +200 microKelvin)
// Based on typical angular power spectrum patterns
function generateCMBMap(seed) {
  var map = [];
  for (var y = 0; y < 32; y++) {
    var row = [];
    for (var x = 0; x < 64; x++) {
      // Superposition of spherical harmonic-like modes
      var v = 0;
      v += 80 * Math.sin(x * 0.15 + seed) * Math.cos(y * 0.2 + seed * 0.7);
      v += 50 * Math.sin(x * 0.3 + y * 0.25 + seed * 1.3);
      v += 35 * Math.cos(x * 0.5 - y * 0.4 + seed * 2.1);
      v += 25 * Math.sin(x * 0.8 + y * 0.7 + seed * 0.3);
      v += 18 * Math.cos(x * 1.2 - y * 1.1 + seed * 1.7);
      v += 12 * Math.sin(x * 1.8 + y * 1.5 + seed * 0.9);
      v += 8 * Math.cos(x * 2.5 - y * 2.2 + seed * 2.5);
      row.push(Math.round(v));
    }
    map.push(row);
  }
  return map;
}

var CMB_MAP = generateCMBMap(42);

// Get CMB value at position (normalized 0-1)
function cmbAt(nx, ny) {
  var x = Math.floor(nx * 63) % 64;
  var y = Math.floor(ny * 31) % 32;
  return CMB_MAP[y][x];
}

// Map CMB value to color
function cmbColor(v) {
  // Classic CMB colormap: blue (cold) -> black -> red/yellow (hot)
  var t = (v + 200) / 400; // 0..1
  t = Math.max(0, Math.min(1, t));
  var r, g, b;
  if (t < 0.25) {
    r = 0; g = 0; b = Math.floor(80 + t * 4 * 175);
  } else if (t < 0.45) {
    var p = (t - 0.25) / 0.2;
    r = 0; g = Math.floor(p * 80); b = Math.floor(255 - p * 100);
  } else if (t < 0.55) {
    var p2 = (t - 0.45) / 0.1;
    r = Math.floor(p2 * 60); g = Math.floor(80 - p2 * 30); b = Math.floor(155 - p2 * 100);
  } else if (t < 0.75) {
    var p3 = (t - 0.55) / 0.2;
    r = Math.floor(60 + p3 * 195); g = Math.floor(50 + p3 * 80); b = Math.floor(55 - p3 * 55);
  } else {
    var p4 = (t - 0.75) / 0.25;
    r = 255; g = Math.floor(130 + p4 * 125); b = Math.floor(p4 * 100);
  }
  return "rgb(" + r + "," + g + "," + b + ")";
}

// ── Letter Path Data ──
// Simplified vector paths for A-Z, 0-9, and some punctuation
// Each letter is defined as a series of strokes: [[x1,y1,x2,y2,x3,y3...], ...]
// Coordinates 0-100
var LETTER_PATHS = {
  A: [[[15,100],[50,0],[85,100]],[[30,60],[70,60]]],
  B: [[[20,0],[20,100]],[[20,0],[65,0],[80,15],[80,35],[65,50],[20,50]],[[20,50],[70,50],[85,65],[85,85],[70,100],[20,100]]],
  C: [[[80,15],[65,0],[35,0],[15,20],[15,80],[35,100],[65,100],[80,85]]],
  D: [[[20,0],[20,100]],[[20,0],[60,0],[80,20],[80,80],[60,100],[20,100]]],
  E: [[[75,0],[20,0],[20,100],[75,100]],[[20,50],[60,50]]],
  F: [[[75,0],[20,0],[20,100]],[[20,50],[55,50]]],
  G: [[[80,15],[65,0],[35,0],[15,20],[15,80],[35,100],[65,100],[80,80],[80,55],[55,55]]],
  H: [[[20,0],[20,100]],[[80,0],[80,100]],[[20,50],[80,50]]],
  I: [[[30,0],[70,0]],[[50,0],[50,100]],[[30,100],[70,100]]],
  J: [[[35,0],[75,0]],[[60,0],[60,80],[45,100],[25,100],[15,85]]],
  K: [[[20,0],[20,100]],[[75,0],[20,55],[75,100]]],
  L: [[[20,0],[20,100],[75,100]]],
  M: [[[15,100],[15,0],[50,45],[85,0],[85,100]]],
  N: [[[20,100],[20,0],[80,100],[80,0]]],
  O: [[[50,0],[20,0],[10,20],[10,80],[20,100],[80,100],[90,80],[90,20],[80,0],[50,0]]],
  P: [[[20,100],[20,0],[65,0],[80,15],[80,40],[65,55],[20,55]]],
  Q: [[[50,0],[20,0],[10,20],[10,80],[20,100],[80,100],[90,80],[90,20],[80,0],[50,0]],[[65,75],[90,105]]],
  R: [[[20,100],[20,0],[65,0],[80,15],[80,35],[65,50],[20,50]],[[55,50],[85,100]]],
  S: [[[80,15],[65,0],[35,0],[15,15],[15,35],[35,50],[65,50],[85,65],[85,85],[65,100],[35,100],[15,85]]],
  T: [[[10,0],[90,0]],[[50,0],[50,100]]],
  U: [[[15,0],[15,75],[30,100],[70,100],[85,75],[85,0]]],
  V: [[[10,0],[50,100],[90,0]]],
  W: [[[5,0],[25,100],[50,40],[75,100],[95,0]]],
  X: [[[15,0],[85,100]],[[85,0],[15,100]]],
  Y: [[[15,0],[50,50],[85,0]],[[50,50],[50,100]]],
  Z: [[[15,0],[85,0],[15,100],[85,100]]],
  "0": [[[50,0],[20,0],[10,20],[10,80],[20,100],[80,100],[90,80],[90,20],[80,0],[50,0]],[[80,10],[20,90]]],
  "1": [[[30,15],[50,0],[50,100]],[[30,100],[70,100]]],
  "2": [[[15,15],[30,0],[70,0],[85,15],[85,35],[15,100],[85,100]]],
  "3": [[[15,15],[35,0],[65,0],[85,20],[85,40],[60,50],[85,60],[85,80],[65,100],[35,100],[15,85]]],
  "4": [[[70,100],[70,0],[10,65],[90,65]]],
  "5": [[[80,0],[20,0],[15,45],[60,45],[80,60],[80,85],[60,100],[25,100],[15,85]]],
  "6": [[[70,0],[35,0],[15,25],[15,80],[35,100],[65,100],[80,80],[80,60],[65,45],[20,45]]],
  "7": [[[15,0],[85,0],[40,100]]],
  "8": [[[50,0],[25,0],[15,15],[15,35],[25,50],[75,50],[85,65],[85,85],[75,100],[25,100],[15,85],[15,65],[25,50]],[[25,50],[75,50],[85,35],[85,15],[75,0],[50,0]]],
  "9": [[[80,45],[35,45],[20,20],[20,10],[35,0],[65,0],[85,20],[85,75],[65,100],[30,100]]],
  ".": [[[45,90],[55,90],[55,100],[45,100],[45,90]]],
  ",": [[[50,85],[55,100],[45,110]]],
  "!": [[[50,0],[50,75]],[[47,90],[53,90],[53,100],[47,100],[47,90]]],
  "?": [[[20,15],[35,0],[65,0],[80,15],[80,35],[50,55],[50,75]],[[47,90],[53,90],[53,100],[47,100],[47,90]]],
  " ": [],
};

// ── Render a letter with CMB-influenced strokes ──
function renderCMBLetter(ctx, letter, x, y, size, cmbOffsetX, cmbOffsetY) {
  var paths = LETTER_PATHS[letter.toUpperCase()];
  if (!paths || paths.length === 0) return;

  var scale = size / 100;

  paths.forEach(function(path) {
    if (path.length < 2) return;

    ctx.beginPath();

    for (var i = 0; i < path.length; i++) {
      var px = x + path[i][0] * scale;
      var py = y + path[i][1] * scale;

      // CMB-influenced displacement
      var cnx = (cmbOffsetX + path[i][0] * 0.01) % 1;
      var cny = (cmbOffsetY + path[i][1] * 0.01) % 1;
      var cmbVal = cmbAt(cnx, cny);

      // Displace point based on CMB
      var displaceX = cmbVal * 0.015 * scale;
      var displaceY = cmbVal * 0.01 * scale;
      px += displaceX;
      py += displaceY;

      // Stroke width varies with CMB
      var strokeW = 1.5 + Math.abs(cmbVal) * 0.02;
      ctx.lineWidth = strokeW * scale * 0.5;

      // Color from CMB
      var color = cmbColor(cmbVal);
      ctx.strokeStyle = color;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        // Bezier with CMB-influenced control point
        var prevPx = x + path[i-1][0] * scale;
        var prevPy = y + path[i-1][1] * scale;
        var midX = (prevPx + px) / 2 + cmbVal * 0.02 * scale;
        var midY = (prevPy + py) / 2 - cmbVal * 0.015 * scale;
        ctx.quadraticCurveTo(midX, midY, px, py);
      }
    }
    ctx.stroke();
  });
}

// ── CMB Background Visualization ──
function CMBBackground(props) {
  var canvasRef = useRef(null);
  var size = props.size || 300;

  useEffect(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    canvas.width = size * 2;
    canvas.height = Math.floor(size) * 2;
    ctx.scale(2, 2);

    var w = size, h = Math.floor(size / 2);
    for (var py = 0; py < h; py++) {
      for (var px = 0; px < w; px++) {
        var v = cmbAt(px / w, py / h);
        ctx.fillStyle = cmbColor(v);
        ctx.fillRect(px, py, 1.5, 1.5);
      }
    }
  }, [size]);

  return <canvas ref={canvasRef} style={{width: size + "px", height: Math.floor(size / 2) + "px", display: "block", borderRadius: "4px"}} />;
}

// ── Text Renderer ──
function CMBTextRenderer(props) {
  var text = props.text;
  var canvasRef = useRef(null);
  var fontSize = props.fontSize || 60;

  useEffect(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.scale(2, 2);
    ctx.clearRect(0, 0, w, h);

    // Background: faint CMB
    for (var by = 0; by < h; by += 3) {
      for (var bx = 0; bx < w; bx += 3) {
        var bv = cmbAt(bx / w, by / h);
        ctx.fillStyle = cmbColor(bv);
        ctx.globalAlpha = 0.04;
        ctx.fillRect(bx, by, 3, 3);
      }
    }
    ctx.globalAlpha = 1;

    var chars = text.toUpperCase().split("");
    var charWidth = fontSize * 0.7;
    var totalWidth = chars.length * charWidth;
    var startX = Math.max(10, (w - totalWidth) / 2);
    var startY = (h - fontSize) / 2;

    chars.forEach(function(ch, i) {
      var cx = startX + i * charWidth;
      var cmbOx = (i * 0.13 + 0.1) % 1;
      var cmbOy = (i * 0.17 + 0.2) % 1;

      // Glow effect
      ctx.shadowColor = cmbColor(cmbAt(cmbOx, cmbOy));
      ctx.shadowBlur = 8;

      renderCMBLetter(ctx, ch, cx, startY, fontSize, cmbOx, cmbOy);

      ctx.shadowBlur = 0;
    });

  }, [text, fontSize]);

  return <canvas ref={canvasRef} style={{width: "100%", height: "100%", display: "block"}} />;
}

// ── Full Alphabet Display ──
function AlphabetDisplay() {
  var canvasRef = useRef(null);

  useEffect(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.scale(2, 2);
    ctx.clearRect(0, 0, w, h);

    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var cols = 13;
    var cellW = w / cols;
    var cellH = h / 2;
    var sz = Math.min(cellW, cellH) * 0.7;

    letters.split("").forEach(function(ch, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var cx = col * cellW + (cellW - sz) / 2;
      var cy = row * cellH + (cellH - sz) / 2;
      var cmbOx = (i * 0.08 + 0.05) % 1;
      var cmbOy = (i * 0.11 + 0.15) % 1;

      ctx.shadowColor = cmbColor(cmbAt(cmbOx, cmbOy));
      ctx.shadowBlur = 4;
      renderCMBLetter(ctx, ch, cx, cy, sz, cmbOx, cmbOy);
      ctx.shadowBlur = 0;
    });
  }, []);

  return <canvas ref={canvasRef} style={{width: "100%", height: "100%", display: "block"}} />;
}

// ── Power Spectrum Chart ──
function PowerSpectrum() {
  var canvasRef = useRef(null);

  useEffect(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.scale(2, 2);
    ctx.clearRect(0, 0, w, h);

    var pad = {top: 15, right: 10, bottom: 22, left: 35};
    var cw = w - pad.left - pad.right;
    var ch = h - pad.top - pad.bottom;

    // Simulated CMB angular power spectrum C(l)
    // Peaks at l ~ 200, 550, 800
    var data = [];
    for (var l = 2; l <= 1200; l += 3) {
      var base = 6000 / (1 + l * 0.005);
      var p1 = 4500 * Math.exp(-Math.pow((l - 220) / 80, 2));
      var p2 = 2800 * Math.exp(-Math.pow((l - 540) / 60, 2));
      var p3 = 1800 * Math.exp(-Math.pow((l - 810) / 50, 2));
      var damping = Math.exp(-l * 0.001);
      var val = (base + p1 + p2 + p3) * damping;
      data.push({l: l, v: val});
    }

    var maxV = Math.max.apply(null, data.map(function(d){return d.v;}));
    var xScale = function(l) { return pad.left + (Math.log(l) - Math.log(2)) / (Math.log(1200) - Math.log(2)) * cw; };
    var yScale = function(v) { return pad.top + ch * (1 - v / maxV); };

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 0.5;
    [10, 100, 1000].forEach(function(l) {
      var x = xScale(l);
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, h - pad.bottom); ctx.stroke();
      ctx.fillStyle = "#333";
      ctx.font = "7px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText("l=" + l, x, h - pad.bottom + 12);
    });

    // Draw spectrum with CMB colors
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach(function(d, i) {
      var x = xScale(d.l);
      var y = yScale(d.v);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "rgba(239,180,100,0.7)";
    ctx.stroke();

    // Fill under curve with gradient
    ctx.lineTo(xScale(data[data.length-1].l), h - pad.bottom);
    ctx.lineTo(xScale(data[0].l), h - pad.bottom);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    grad.addColorStop(0, "rgba(239,180,100,0.15)");
    grad.addColorStop(1, "rgba(239,180,100,0.01)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Label peaks
    ctx.fillStyle = "#737373";
    ctx.font = "7px 'Courier New'";
    ctx.textAlign = "center";
    [[220, "1st peak\nstroke width"], [540, "2nd peak\ncurvature"], [810, "3rd peak\ntexture"]].forEach(function(pk) {
      var x = xScale(pk[0]);
      var lines = pk[1].split("\n");
      ctx.fillStyle = "#e8c170";
      ctx.fillText(lines[0], x, pad.top + 8);
      ctx.fillStyle = "#525252";
      ctx.fillText(lines[1], x, pad.top + 17);
    });

    // Y axis
    ctx.fillStyle = "#333";
    ctx.font = "6px 'Courier New'";
    ctx.save();
    ctx.translate(8, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("POWER", 0, 0);
    ctx.restore();

  }, []);

  return <canvas ref={canvasRef} style={{width: "100%", height: "100%", display: "block"}} />;
}

// ── Main ──
export default function App({ onBack }) {
  var [inputText, setInputText] = useState("HELLO UNIVERSE");
  var [fontSize, setFontSize] = useState(55);
  var [showAlphabet, setShowAlphabet] = useState(false);
  var [showSpectrum, setShowSpectrum] = useState(false);
  var [showMethod, setShowMethod] = useState(false);

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: "#08080c",
      color: "#e5e5e5", fontFamily: "'Courier New', 'SF Mono', monospace",
      position: "relative",
    }}>
      {/* BG */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: "radial-gradient(circle at 50% 40%, rgba(200,140,60,0.03) 0%, transparent 60%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Header */}
      <div style={{position: "relative", zIndex: 10, padding: "18px 16px 10px", borderBottom: "1px solid rgba(200,140,60,0.12)"}}>
        <div style={{display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap"}}>
          {onBack && <button onClick={onBack} style={{padding: "3px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "#525252", cursor: "pointer", fontSize: "11px", fontFamily: "'Courier New', monospace", transition: "all 0.2s", marginRight: "4px"}}>{"← 首页"}</button>}
          <span style={{fontSize: "14px", color: "#e8c170", fontWeight: 700}}>{"CMB FONT"}</span>
          <h1 style={{fontSize: "10px", fontWeight: 400, letterSpacing: "2px", color: "#737373", margin: 0}}>
            {"COSMIC MICROWAVE BACKGROUND TYPOGRAPHY"}
          </h1>
        </div>
        <p style={{fontSize: "9px", color: "#404040", margin: "6px 0 0", lineHeight: 1.8}}>
          {"\u5B87\u5B99\u5927\u7206\u70B838\u4E07\u5E74\u540E\u7684\u201C\u7B2C\u4E00\u5F20\u7167\u7247\u201D\u3002\u5B83\u7684\u6E29\u5EA6\u6DA8\u843D\u51B3\u5B9A\u4E86\u4ECA\u5929\u661F\u7CFB\u7684\u5206\u5E03\u3002\u73B0\u5728\uFF0C\u7528\u5B83\u6765\u5199\u5B57\u3002"}
        </p>
      </div>

      {/* CMB Map */}
      <div style={{padding: "12px 16px", position: "relative", zIndex: 5}}>
        <div style={{fontSize: "8px", letterSpacing: "3px", color: "#404040", marginBottom: "6px", textTransform: "uppercase"}}>
          {"CMB ANISOTROPY MAP (SIMULATED)"}
        </div>
        <div style={{display: "flex", justifyContent: "center", background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.04)"}}>
          <CMBBackground size={Math.min(500, typeof window !== "undefined" ? window.innerWidth - 60 : 400)} />
        </div>
        <div style={{display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "7px", color: "#404040"}}>
          <span>{"-200 \u00B5K (cold)"}</span>
          <span>{"CMB T = 2.725K \u00B1 fluctuations"}</span>
          <span>{"+200 \u00B5K (hot)"}</span>
        </div>
      </div>

      {/* Text Input */}
      <div style={{padding: "8px 16px", position: "relative", zIndex: 5}}>
        <div style={{fontSize: "8px", letterSpacing: "3px", color: "#404040", marginBottom: "6px", textTransform: "uppercase"}}>
          {"TYPE ANYTHING \u2014 SEE IT IN THE OLDEST LIGHT"}
        </div>
        <input
          value={inputText}
          onChange={function(e) { setInputText(e.target.value); }}
          placeholder="Type here..."
          maxLength={30}
          style={{
            width: "100%", padding: "10px 12px",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,140,60,0.15)",
            borderRadius: "4px", color: "#e8c170", fontSize: "14px",
            fontFamily: "'Courier New', monospace", outline: "none",
            letterSpacing: "3px",
          }}
        />
      </div>

      {/* Rendered text */}
      <div style={{padding: "8px 16px", position: "relative", zIndex: 5}}>
        <div style={{
          height: "120px", borderRadius: "6px",
          border: "1px solid rgba(200,140,60,0.1)",
          background: "rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}>
          <CMBTextRenderer text={inputText} fontSize={fontSize} />
        </div>
        {/* Size slider */}
        <div style={{display: "flex", alignItems: "center", gap: "8px", marginTop: "6px"}}>
          <span style={{fontSize: "8px", color: "#404040"}}>{"SIZE"}</span>
          <input
            type="range" min="25" max="80" value={fontSize}
            onChange={function(e) { setFontSize(parseInt(e.target.value)); }}
            style={{flex: 1, accentColor: "#e8c170", height: "2px"}}
          />
          <span style={{fontSize: "8px", color: "#404040"}}>{fontSize + "px"}</span>
        </div>
      </div>

      {/* Full alphabet */}
      <div style={{padding: "8px 16px", position: "relative", zIndex: 5}}>
        <div onClick={function(){ setShowAlphabet(!showAlphabet); }} style={{
          cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px",
        }}>
          <span style={{fontSize: "8px", letterSpacing: "3px", color: "#404040", textTransform: "uppercase"}}>
            {"FULL ALPHABET"}
          </span>
          <span style={{fontSize: "9px", color: "#333"}}>{showAlphabet ? "v" : ">"}</span>
        </div>
        {showAlphabet && (
          <div style={{
            height: "100px", borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(0,0,0,0.3)",
          }}>
            <AlphabetDisplay />
          </div>
        )}
      </div>

      {/* Power Spectrum */}
      <div style={{padding: "8px 16px", position: "relative", zIndex: 5}}>
        <div onClick={function(){ setShowSpectrum(!showSpectrum); }} style={{
          cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px",
        }}>
          <span style={{fontSize: "8px", letterSpacing: "3px", color: "#404040", textTransform: "uppercase"}}>
            {"ANGULAR POWER SPECTRUM \u2192 FONT PARAMETERS"}
          </span>
          <span style={{fontSize: "9px", color: "#333"}}>{showSpectrum ? "v" : ">"}</span>
        </div>
        {showSpectrum && (
          <div>
            <div style={{
              height: "140px", borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(0,0,0,0.3)",
              marginBottom: "6px",
            }}>
              <PowerSpectrum />
            </div>
            <div style={{fontSize: "9px", color: "#525252", lineHeight: 1.8, fontFamily: "Georgia, serif"}}>
              <p style={{margin: "0 0 4px"}}>
                {"CMB\u7684\u89D2\u529F\u7387\u8C31\u6709\u4E09\u4E2A\u4E3B\u8981\u5CF0\uFF1A"}
              </p>
              <p style={{margin: "0 0 3px", color: "#e8c170"}}>
                {"1st peak (l\u2248220) \u2192 \u7B14\u753B\u7C97\u7EC6\uFF1A\u5B87\u5B99\u7684\u201C\u66F2\u7387\u201D\u51B3\u5B9A\u7B14\u753B\u7684\u57FA\u7840\u7C97\u7EC6"}
              </p>
              <p style={{margin: "0 0 3px", color: "#e8c170"}}>
                {"2nd peak (l\u2248540) \u2192 \u5F2F\u66F2\u5EA6\uFF1A\u91CD\u5B50\u4E0E\u5149\u5B50\u7684\u6BD4\u4F8B\u51B3\u5B9A\u5B57\u4F53\u7684\u5F27\u5EA6"}
              </p>
              <p style={{margin: "0", color: "#e8c170"}}>
                {"3rd peak (l\u2248810) \u2192 \u7EB9\u7406\uFF1A\u6697\u7269\u8D28\u5BC6\u5EA6\u51B3\u5B9A\u5B57\u4F53\u7684\u5FAE\u89C2\u7EB9\u7406"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mapping rules */}
      <div style={{padding: "8px 16px", position: "relative", zIndex: 5}}>
        <div style={{fontSize: "8px", letterSpacing: "3px", color: "#404040", marginBottom: "6px", textTransform: "uppercase"}}>
          {"MAPPING RULES"}
        </div>
        <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
          {[
            ["#4466cc", "\u51B7\u533A (-200\u00B5K)", "\u7EC6\u7B14\u753B\u3001\u5185\u6536"],
            ["#1a1a1a", "\u5747\u6E29\u533A", "\u6807\u51C6\u7B14\u753B"],
            ["#cc6633", "\u70ED\u533A (+100\u00B5K)", "\u7C97\u7B14\u753B\u3001\u5916\u6269"],
            ["#ffcc66", "\u6781\u70ED\u533A (+200\u00B5K)", "\u6700\u7C97\u3001\u5F3A\u4F4D\u79FB"],
          ].map(function(item, i) {
            return (
              <div key={i} style={{display: "flex", alignItems: "center", gap: "5px", fontSize: "9px"}}>
                <div style={{width: "10px", height: "10px", borderRadius: "2px", background: item[0]}} />
                <span style={{color: "#737373"}}>{item[1]}</span>
                <span style={{color: "#404040"}}>{"\u2192"}</span>
                <span style={{color: "#a3a3a3"}}>{item[2]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Philosophy */}
      <div style={{
        margin: "12px 16px 16px", padding: "14px",
        background: "rgba(200,140,60,0.03)", border: "1px solid rgba(200,140,60,0.08)",
        borderRadius: "6px", position: "relative", zIndex: 5,
      }}>
        <div style={{fontSize: "11px", color: "#737373", lineHeight: 2.2, fontFamily: "Georgia, 'Noto Serif SC', serif"}}>
          <p style={{margin: "0 0 8px", color: "#a3a3a3"}}>
            {"CMB\u662F\u5B87\u5B99\u6700\u53E4\u8001\u7684\u4FE1\u53F7\u3002\u5B83\u643A\u5E26\u7684\u6E29\u5EA6\u6DA8\u843D\u4E0D\u8D85\u8FC7\u4E07\u5206\u4E4B\u4E00\uFF0C\u4F46\u6B63\u662F\u8FD9\u4E9B\u5FAE\u5C0F\u7684\u6DA8\u843D\uFF0C\u51B3\u5B9A\u4E86\u4ECA\u5929\u54EA\u91CC\u6709\u661F\u7CFB\u3001\u54EA\u91CC\u662F\u865A\u7A7A\u3002"}
          </p>
          <p style={{margin: "0 0 8px", color: "#e5e5e5"}}>
            {"\u6362\u53E5\u8BDD\u8BF4\uFF1A138\u4EBF\u5E74\u524D\u7684\u4E00\u6B21\u5FAE\u5C0F\u7684\u6E29\u5EA6\u6CE2\u52A8\uFF0C\u6700\u7EC8\u5BFC\u81F4\u4E86\u4F60\u6B64\u523B\u6B63\u5728\u8BFB\u8FD9\u884C\u5B57\u3002\u73B0\u5728\uFF0C\u8FD9\u884C\u5B57\u672C\u8EAB\u4E5F\u7531\u90A3\u540C\u4E00\u6B21\u6CE2\u52A8\u6765\u4E66\u5199\u3002"}
          </p>
          <p style={{margin: 0, color: "#525252", fontStyle: "italic"}}>
            {"\u5B87\u5B99\u7528\u81EA\u5DF1\u6700\u53E4\u8001\u7684\u5149\u5199\u4E86\u4E00\u5C01\u4FE1\u3002\u6211\u4EEC\u53EA\u662F\u628A\u5B83\u7FFB\u8BD1\u6210\u4E86\u5B57\u6BCD\u3002"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        padding: "0 16px 12px", display: "flex", gap: "14px", flexWrap: "wrap",
        position: "relative", zIndex: 5,
      }}>
        {[
          ["2.725K", "CMB Temperature", "#e8c170"],
          ["380,000", "Years After Big Bang", "#e8c170"],
          ["\u00B10.001%", "Anisotropy", "#ef4444"],
          ["A\u2013Z", "26 Glyphs", "#2dd4bf"],
        ].map(function(item, i) {
          return (
            <div key={i}>
              <div style={{fontSize: "14px", color: item[2], fontWeight: 700}}>{item[0]}</div>
              <div style={{fontSize: "7px", color: "#404040", letterSpacing: "0.5px"}}>{item[1]}</div>
            </div>
          );
        })}
      </div>

      <div style={{padding: "10px 16px 24px", textAlign: "center", fontSize: "8px", color: "#1a1a1a", letterSpacing: "3px", position: "relative", zIndex: 5}}>
        {"THE UNIVERSE WROTE A LETTER \u00B7 WE JUST TRANSLATED IT INTO ALPHABET"}
      </div>
    </div>
  );
}
