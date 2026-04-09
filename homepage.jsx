import { useState, useEffect, useRef, useCallback } from "react";

// ── Project definitions ──
const PROJECTS = [
  {
    key: "civilization",
    label: "MORTALITY",
    title: "文明死亡率精算",
    subtitle: "Civilization Survival Analysis",
    desc: "用精算科学预测文明寿命。37个已死亡文明的数据，1个仍然存活。",
    color: "#ef4444",
    icon: "†",
    stats: ["37 civilizations", "Gompertz model", "Kaplan-Meier"],
  },
  {
    key: "consciousness",
    label: "TRANSIT",
    title: "意识宿主迁徙",
    subtitle: "Consciousness Host Migration",
    desc: "5亿年来，意识的宿主不断死亡，但意识本身从未中断。它只是跳到下一个宿主。",
    color: "#a855f7",
    icon: "◎",
    stats: ["11 hosts", "5 billion years", "Exponential decay"],
  },
  {
    key: "pi",
    label: "π MIRROR",
    title: "圆周率之镜",
    subtitle: "History Encoded in π",
    desc: "将人类历史的关键时刻映射到π的数字序列中。随机还是命运？",
    color: "#2dd4bf",
    icon: "π",
    stats: ["1200+ digits", "99+ events", "Void zones"],
  },
  {
    key: "protein",
    label: "ARCHITECT",
    title: "蛋白质建筑学",
    subtitle: "Protein Architecture",
    desc: "如果蛋白质的二级结构是建筑，螺旋是立柱，折叠片是楼板，线圈是走廊。",
    color: "#2dd4bf",
    icon: "⬡",
    stats: ["4 proteins", "3D rendering", "PDB parser"],
  },
  {
    key: "cmb",
    label: "CMB FONT",
    title: "宇宙微波背景字体",
    subtitle: "Cosmic Microwave Background Typography",
    desc: "大爆炸38万年后的\u201C第一张照片\u201D。它的温度涨落决定了今天星系的分布。现在，用它来写字。",
    color: "#e8c170",
    icon: "◐",
    stats: ["2.725 K", "±200 µK", "Anisotropy map"],
  },
];

export default function Homepage({ onEnterProject }) {
  var [hoveredIdx, setHoveredIdx] = useState(-1);
  var [entered, setEntered] = useState(false);
  var [particles, setParticles] = useState([]);
  var canvasRef = useRef(null);

  // Entry animation
  useEffect(function () {
    var t = setTimeout(function () {
      setEntered(true);
    }, 100);
    return function () {
      clearTimeout(t);
    };
  }, []);

  // Particle background
  useEffect(function () {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = (canvas.width = window.innerWidth);
    var h = (canvas.height = window.innerHeight);
    var pts = [];
    for (var i = 0; i < 60; i++) {
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.3 + 0.05,
      });
    }
    var raf;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var j = 0; j < pts.length; j++) {
        var p = pts[j];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + p.o + ")";
        ctx.fill();
      }
      // Draw faint connections
      for (var a = 0; a < pts.length; a++) {
        for (var b = a + 1; b < pts.length; b++) {
          var dx = pts[a].x - pts[b].x;
          var dy = pts[a].y - pts[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[a].x, pts[a].y);
            ctx.lineTo(pts[b].x, pts[b].y);
            ctx.strokeStyle =
              "rgba(255,255,255," + (0.03 * (1 - dist / 120)) + ")";
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    function onResize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", onResize);
    return function () {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  function handleClick(key) {
    onEnterProject(key);
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#06060a",
        color: "#e5e5e5",
        fontFamily: "'Courier New', 'SF Mono', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Gradient overlays */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse at 30% 20%, rgba(168,85,247,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(45,212,191,0.03) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(239,68,68,0.02) 0%, transparent 40%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Header area */}
        <div
          style={{
            paddingTop: "min(12vh, 100px)",
            paddingBottom: "20px",
            textAlign: "center",
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0)" : "translateY(20px)",
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Top marker */}
          <div
            style={{
              fontSize: "8px",
              letterSpacing: "6px",
              color: "#333",
              marginBottom: "24px",
              textTransform: "uppercase",
            }}
          >
            {"CRAZY IDEAS · EXPLORATION LAB"}
          </div>

          {/* Main title */}
          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 36px)",
              fontWeight: 300,
              color: "#e5e5e5",
              margin: "0 0 12px",
              letterSpacing: "2px",
              lineHeight: 1.5,
              fontFamily: "Georgia, 'Noto Serif SC', serif",
            }}
          >
            {"好奇心驱动我们去发现更多"}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "11px",
              color: "#525252",
              letterSpacing: "3px",
              margin: "0 0 6px",
              textTransform: "uppercase",
            }}
          >
            {"CURIOSITY DRIVES US TO DISCOVER MORE"}
          </p>

          {/* Divider */}
          <div
            style={{
              width: "40px",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              margin: "28px auto 0",
            }}
          />
        </div>

        {/* Project cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            padding: "10px 0 60px",
          }}
        >
          {PROJECTS.map(function (proj, idx) {
            var isHovered = hoveredIdx === idx;
            var delay = 0.3 + idx * 0.1;
            return (
              <div
                key={proj.key}
                onClick={function () {
                  handleClick(proj.key);
                }}
                onMouseEnter={function () {
                  setHoveredIdx(idx);
                }}
                onMouseLeave={function () {
                  setHoveredIdx(-1);
                }}
                style={{
                  position: "relative",
                  background: isHovered
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.02)",
                  border:
                    "1px solid " +
                    (isHovered
                      ? proj.color.replace(")", ",0.3)").replace("rgb", "rgba").replace("#", "")
                        ? "rgba(" + hexToRgb(proj.color) + ",0.3)"
                        : "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.05)"),
                  borderRadius: "8px",
                  padding: "24px 22px 20px",
                  cursor: "pointer",
                  transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  transform: isHovered
                    ? "translateY(-3px)"
                    : "translateY(0)",
                  opacity: entered ? 1 : 0,
                  animation: entered
                    ? "fadeSlideUp 0.7s " + delay + "s both"
                    : "none",
                  overflow: "hidden",
                }}
              >
                {/* Glow effect on hover */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "1px",
                    background: isHovered
                      ? "linear-gradient(90deg, transparent, " +
                        proj.color +
                        ", transparent)"
                      : "transparent",
                    opacity: 0.5,
                    transition: "all 0.35s ease",
                  }}
                />

                {/* Label + Icon */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      letterSpacing: "3px",
                      color: proj.color,
                      fontWeight: 700,
                    }}
                  >
                    {proj.label}
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      color: proj.color,
                      opacity: isHovered ? 0.8 : 0.3,
                      transition: "opacity 0.3s ease",
                      lineHeight: 1,
                    }}
                  >
                    {proj.icon}
                  </span>
                </div>

                {/* Chinese title */}
                <h2
                  style={{
                    fontSize: "17px",
                    fontWeight: 400,
                    color: "#e5e5e5",
                    margin: "0 0 4px",
                    fontFamily: "Georgia, 'Noto Serif SC', serif",
                    lineHeight: 1.4,
                  }}
                >
                  {proj.title}
                </h2>

                {/* English subtitle */}
                <div
                  style={{
                    fontSize: "8px",
                    letterSpacing: "2px",
                    color: "#525252",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  {proj.subtitle}
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: "11px",
                    color: "#737373",
                    lineHeight: 1.8,
                    margin: "0 0 16px",
                    fontFamily: "Georgia, 'Noto Serif SC', serif",
                  }}
                >
                  {proj.desc}
                </p>

                {/* Stats tags */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {proj.stats.map(function (s, si) {
                    return (
                      <span
                        key={si}
                        style={{
                          fontSize: "8px",
                          letterSpacing: "1px",
                          color: isHovered ? proj.color : "#404040",
                          padding: "3px 8px",
                          border:
                            "1px solid " +
                            (isHovered
                              ? "rgba(" +
                                hexToRgb(proj.color) +
                                ",0.2)"
                              : "rgba(255,255,255,0.06)"),
                          borderRadius: "3px",
                          transition: "all 0.3s ease",
                          textTransform: "uppercase",
                        }}
                      >
                        {s}
                      </span>
                    );
                  })}
                </div>

                {/* Arrow indicator */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    fontSize: "14px",
                    color: proj.color,
                    opacity: isHovered ? 0.6 : 0,
                    transform: isHovered
                      ? "translateX(0)"
                      : "translateX(-6px)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {"→"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "0 0 40px",
            opacity: entered ? 1 : 0,
            transition: "opacity 1.5s ease 1s",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              letterSpacing: "4px",
              color: "#262626",
              textTransform: "uppercase",
            }}
          >
            {"5 EXPLORATIONS · SELECT ONE TO BEGIN"}
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>
        {
          "@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }"
        }
      </style>
    </div>
  );
}

// Utility: hex color to r,g,b string
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? parseInt(result[1], 16) +
        "," +
        parseInt(result[2], 16) +
        "," +
        parseInt(result[3], 16)
    : "255,255,255";
}
