"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef } from "react";

// Spline 패키지는 무거우므로 lazy + ssr off
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <SplineFallback />,
});

interface Props {
  scene: string;
  className?: string;
  style?: React.CSSProperties;
  /** 휠 이벤트가 Spline 카메라 줌을 변경하지 않도록 차단 후 페이지 스크롤로 위임 (기본 true) */
  disableScrollZoom?: boolean;
}

function SplineFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100/40 rounded-[2rem]">
      <div className="text-brand-300 text-sm font-semibold animate-pulse">
        장면을 불러오는 중…
      </div>
    </div>
  );
}

export function SplineCanvas({ scene, className, style, disableScrollZoom = true }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!disableScrollZoom) return;
    const el = wrapperRef.current;
    if (!el) return;

    // capture 단계에서 wheel 을 가로채 Spline canvas 줌을 막고,
    // 동일한 delta 만큼 페이지를 수동 스크롤시킨다.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: "auto" });
    };

    el.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => el.removeEventListener("wheel", onWheel, true);
  }, [disableScrollZoom]);

  return (
    <div ref={wrapperRef} className={className} style={style}>
      <Suspense fallback={<SplineFallback />}>
        <Spline scene={scene} />
      </Suspense>
    </div>
  );
}
