"use client";

import { useEffect, useState } from "react";

// 3D box loader that assembles into the WRITETEC logo cube (blue top / cyan front /
// navy right) with the centre corner cubelet removed to reveal the black inner walls.
// Ported 1:1 from the original wt-preloader.js. Plays 3 cycles, then fades out.
// Uses sessionStorage so it only shows once per browser tab session.

const PAGE_BG = "#eef1f6";
const CYCLES = 3;
const DURATION = 3000;
const MIN_SHOW = CYCLES * DURATION; // 9s
const FADE_MS = 500;

const CSS = `
#wt-preloader{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:54px;background:${PAGE_BG};transition:opacity ${FADE_MS}ms ease;will-change:opacity}
#wt-preloader.wt-hide{opacity:0;pointer-events:none}
#wt-preloader .wt-brand{font-family:"Sora",system-ui,sans-serif;font-weight:800;font-size:20px;letter-spacing:-.02em;color:#0d1424;display:flex;align-items:center;gap:7px;animation:wt-pl-pulse 1.6s ease-in-out infinite}
#wt-preloader .wt-brand small{font-size:8.5px;font-weight:700;letter-spacing:.24em;color:#9aa4b2}
@keyframes wt-pl-pulse{0%,100%{opacity:.55}50%{opacity:1}}
.wt-loader{--duration:3s;--primary:#2456e6;--primary-light:#17b4e8;--primary-rgba:rgba(36,86,230,0);width:200px;height:320px;position:relative;transform-style:preserve-3d}
@media (max-width:480px){.wt-loader{zoom:.44}}
.wt-loader:before,.wt-loader:after{--r:20.5deg;content:"";width:320px;height:140px;position:absolute;right:32%;bottom:-11px;background:${PAGE_BG};transform:translateZ(200px) rotate(var(--r));animation:wt-mask var(--duration) linear forwards 3}
.wt-loader:after{--r:-20.5deg;right:auto;left:32%}
.wt-loader .ground{position:absolute;left:-50px;bottom:-120px;transform-style:preserve-3d;transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}
.wt-loader .ground div{transform:rotateX(90deg) rotateY(0deg) translate(-48px,-120px) translateZ(100px) scale(0);width:200px;height:200px;background:linear-gradient(45deg,var(--primary) 0%,var(--primary) 50%,var(--primary-light) 50%,var(--primary-light) 100%);transform-style:preserve-3d;animation:wt-ground var(--duration) linear forwards 3}
.wt-loader .ground div:before,.wt-loader .ground div:after{--rx:90deg;--ry:0deg;--x:44px;--y:162px;--z:-50px;content:"";width:156px;height:300px;opacity:0;background:linear-gradient(var(--primary),var(--primary-rgba));position:absolute;transform:rotateX(var(--rx)) rotateY(var(--ry)) translate(var(--x),var(--y)) translateZ(var(--z));animation:wt-ground-shine var(--duration) linear forwards 3}
.wt-loader .ground div:after{--rx:90deg;--ry:90deg;--x:0;--y:177px;--z:150px}
.wt-loader .box{--x:0;--y:0;position:absolute;animation:var(--duration) linear forwards 3;transform:translate(var(--x),var(--y))}
.wt-loader .box div{width:48px;height:48px;position:relative;transform-style:preserve-3d;animation:var(--duration) ease forwards 3;background-color:#17b4e8;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}
.wt-loader .box div:before,.wt-loader .box div:after{--rx:90deg;--ry:0deg;--z:24px;--y:-24px;--x:0;content:"";position:absolute;width:inherit;height:inherit;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);transform:rotateX(var(--rx)) rotateY(var(--ry)) translate(var(--x),var(--y)) translateZ(var(--z))}
.wt-loader .box div:before{background-color:#2456e6}
.wt-loader .box div:after{--rx:0deg;--ry:90deg;--x:24px;--y:0;background-color:#0a3a6b}
.wt-loader .box.box7{display:none}
.wt-loader .box.box5 div:after{background-color:#0a0a0a;box-shadow:inset 0 0 0 1px rgba(255,255,255,.34)}
.wt-loader .box.box6 div{background-color:#0a0a0a;box-shadow:inset 0 0 0 1px rgba(255,255,255,.34)}
.wt-loader .box.box4 div:before{background-color:#000;box-shadow:inset 0 0 0 1px rgba(255,255,255,.34)}
.wt-loader .box.box0{--x:-220px;--y:-120px;left:58px;top:108px;animation-name:wt-box-move0}
.wt-loader .box.box0 div{animation-name:wt-box-scale0}
.wt-loader .box.box1{--x:-260px;--y:120px;left:25px;top:120px;animation-name:wt-box-move1}
.wt-loader .box.box1 div{animation-name:wt-box-scale1}
.wt-loader .box.box2{--x:120px;--y:-190px;left:58px;top:64px;animation-name:wt-box-move2}
.wt-loader .box.box2 div{animation-name:wt-box-scale2}
.wt-loader .box.box3{--x:280px;--y:-40px;left:91px;top:120px;animation-name:wt-box-move3}
.wt-loader .box.box3 div{animation-name:wt-box-scale3}
.wt-loader .box.box4{--x:60px;--y:200px;left:58px;top:132px;animation-name:wt-box-move4}
.wt-loader .box.box4 div{animation-name:wt-box-scale4}
.wt-loader .box.box5{--x:-220px;--y:-120px;left:25px;top:76px;animation-name:wt-box-move5}
.wt-loader .box.box5 div{animation-name:wt-box-scale5}
.wt-loader .box.box6{--x:-260px;--y:120px;left:91px;top:76px;animation-name:wt-box-move6}
.wt-loader .box.box6 div{animation-name:wt-box-scale6}
.wt-loader .box.box7{--x:-240px;--y:200px;left:58px;top:87px;animation-name:wt-box-move7}
.wt-loader .box.box7 div{animation-name:wt-box-scale7}
@keyframes wt-box-move0{12%{transform:translate(var(--x),var(--y))}25%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
@keyframes wt-box-scale0{6%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}14%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
@keyframes wt-box-move1{16%{transform:translate(var(--x),var(--y))}29%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
@keyframes wt-box-scale1{10%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}18%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
@keyframes wt-box-move2{20%{transform:translate(var(--x),var(--y))}33%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
@keyframes wt-box-scale2{14%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}22%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
@keyframes wt-box-move3{24%{transform:translate(var(--x),var(--y))}37%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
@keyframes wt-box-scale3{18%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}26%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
@keyframes wt-box-move4{28%{transform:translate(var(--x),var(--y))}41%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
@keyframes wt-box-scale4{22%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}30%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
@keyframes wt-box-move5{32%{transform:translate(var(--x),var(--y))}45%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
@keyframes wt-box-scale5{26%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}34%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
@keyframes wt-box-move6{36%{transform:translate(var(--x),var(--y))}49%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
@keyframes wt-box-scale6{30%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}38%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
@keyframes wt-box-move7{40%{transform:translate(var(--x),var(--y))}53%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
@keyframes wt-box-scale7{34%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}42%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
@keyframes wt-ground{0%,65%{transform:rotateX(90deg) rotateY(0deg) translate(-48px,-120px) translateZ(100px) scale(0)}75%,90%{transform:rotateX(90deg) rotateY(0deg) translate(-48px,-120px) translateZ(100px) scale(1)}100%{transform:rotateX(90deg) rotateY(0deg) translate(-48px,-120px) translateZ(100px) scale(0)}}
@keyframes wt-ground-shine{0%,70%{opacity:0}75%,87%{opacity:.2}100%{opacity:0}}
@keyframes wt-mask{0%,65%{opacity:0}66%,100%{opacity:1}}
`;

const SESSION_KEY = "wt-preloader-shown";

export function Preloader() {
  const [shouldShow, setShouldShow] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // Only show on the very first tab open per session
    if (sessionStorage.getItem(SESSION_KEY)) {
      setGone(true);
      return;
    }

    sessionStorage.setItem(SESSION_KEY, "1");
    setShouldShow(true);

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);

    const t1 = setTimeout(() => setHidden(true), MIN_SHOW);
    const t2 = setTimeout(() => setGone(true), MIN_SHOW + FADE_MS + 80);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone || !shouldShow) return null;

  const brand = (
    <div className="wt-brand">
      WRITETEC<small>BİLGİ TEKNOLOJİLERİ</small>
    </div>
  );

  return (
    <div
      id="wt-preloader"
      className={hidden ? "wt-hide" : undefined}
      role="status"
      aria-label="Yükleniyor"
    >
      <style>{CSS}</style>
      {reduced ? (
        brand
      ) : (
        <>
          <div className="wt-loader">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={`box box${i}`}>
                <div />
              </div>
            ))}
            <div className="ground">
              <div />
            </div>
          </div>
          {brand}
        </>
      )}
    </div>
  );
}
