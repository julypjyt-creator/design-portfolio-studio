"use client";

import Image from "next/image";
import { PointerEvent, UIEvent, useEffect, useRef, useState } from "react";

export function WorkGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const fullscreenViewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{ pointerId: number; startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null);
  const hasImages = images.length > 0;

  const minZoom = 0.6;
  const maxZoom = 4;
  const step = 0.2;

  const clampZoom = (value: number) => Math.min(maxZoom, Math.max(minZoom, Number(value.toFixed(2))));
  const currentImage = images[activeIndex] ?? "";

  const handleZoomIn = () => setZoom((prev) => clampZoom(prev + step));
  const handleZoomOut = () => setZoom((prev) => clampZoom(prev - step));
  const handleZoomReset = () => setZoom(1);
  const handleZoomToggle = () => setZoom((prev) => (prev > 1.1 ? 1 : 2));

  const handleWheelZoom = (event: UIEvent<HTMLDivElement>) => {
    event.preventDefault();
    const wheelEvent = event.nativeEvent as WheelEvent;
    const direction = wheelEvent.deltaY < 0 ? 1 : -1;
    setZoom((prev) => clampZoom(prev + step * direction));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;

    const viewport = event.currentTarget;
    viewport.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const viewport = event.currentTarget;
    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    viewport.scrollLeft = dragState.scrollLeft - deltaX;
    viewport.scrollTop = dragState.scrollTop - deltaY;
  };

  const clearPointerDrag = (event?: PointerEvent<HTMLDivElement>) => {
    if (event) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore capture release failures.
      }
    }
    dragStateRef.current = null;
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isFullscreenOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreenOpen(false);
      }
      if (event.key === "+" || event.key === "=") {
        setZoom((prev) => clampZoom(prev + step));
      }
      if (event.key === "-") {
        setZoom((prev) => clampZoom(prev - step));
      }
      if (event.key === "0") {
        setZoom(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isFullscreenOpen]);

  useEffect(() => {
    const viewport = isFullscreenOpen ? fullscreenViewportRef.current : previewViewportRef.current;
    if (!viewport) return;

    if (zoom <= 1) {
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
    }
  }, [zoom, isFullscreenOpen]);

  if (!hasImages) return null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl2 border border-line bg-white">
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg border border-line bg-white/95 p-1 shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= minZoom}
            className="h-8 rounded-md px-3 text-sm text-stone disabled:cursor-not-allowed disabled:opacity-50"
          >
            -
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="h-8 rounded-md px-2 text-xs font-medium text-ink hover:bg-panel"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= maxZoom}
            className="h-8 rounded-md px-3 text-sm text-stone disabled:cursor-not-allowed disabled:opacity-50"
          >
            +
          </button>
          <button type="button" onClick={() => setIsFullscreenOpen(true)} className="h-8 rounded-md px-2 text-xs font-medium text-ink hover:bg-panel">
            全屏
          </button>
        </div>

        <div
          ref={previewViewportRef}
          className={`absolute inset-0 overflow-auto p-3 ${zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}`}
          onWheel={handleWheelZoom}
          onDoubleClick={handleZoomToggle}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={clearPointerDrag}
          onPointerCancel={clearPointerDrag}
        >
          <div className="flex min-h-full min-w-full items-center justify-center">
            <Image
              src={currentImage}
              alt={`${name} 图 ${activeIndex + 1}`}
              width={2200}
              height={1600}
              priority={activeIndex === 0}
              className="h-auto rounded-lg object-contain transition-[width] duration-200"
              style={{
                width: `${zoom * 100}%`,
                maxWidth: zoom <= 1 ? "100%" : "none"
              }}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-stone">提示：滚轮缩放，双击切换 100%/200%，放大后可拖拽平移，点击“全屏”可沉浸查看。</p>

      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            className={`relative aspect-[4/3] overflow-hidden rounded-lg border ${
              activeIndex === index ? "border-accent" : "border-line"
            }`}
            onClick={() => {
              setActiveIndex(index);
              handleZoomReset();
            }}
          >
            <Image src={image} alt={`${name} 缩略图 ${index + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {isFullscreenOpen ? (
        <div className="fixed inset-0 z-50 bg-black/90 p-4 md:p-8">
          <div className="mx-auto flex h-full max-w-7xl flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-black/50 px-3 py-2 text-white">
              <p className="text-sm">
                {name} · 第 {activeIndex + 1} 张
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoom <= minZoom}
                  className="h-8 rounded-md px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  -
                </button>
                <button type="button" onClick={handleZoomReset} className="h-8 rounded-md px-2 text-xs font-medium text-white/90 hover:bg-white/10">
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoom >= maxZoom}
                  className="h-8 rounded-md px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
                <button type="button" onClick={() => setIsFullscreenOpen(false)} className="h-8 rounded-md px-3 text-sm text-white hover:bg-white/10">
                  关闭
                </button>
              </div>
            </div>

            <div
              ref={fullscreenViewportRef}
              className={`relative flex-1 overflow-auto rounded-lg border border-white/20 ${zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}`}
              onWheel={handleWheelZoom}
              onDoubleClick={handleZoomToggle}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={clearPointerDrag}
              onPointerCancel={clearPointerDrag}
            >
              <div className="flex min-h-full min-w-full items-center justify-center p-3">
                <Image
                  src={currentImage}
                  alt={`${name} 全屏图 ${activeIndex + 1}`}
                  width={3000}
                  height={2200}
                  priority
                  className="h-auto rounded-lg object-contain transition-[width] duration-200"
                  style={{
                    width: `${zoom * 100}%`,
                    maxWidth: zoom <= 1 ? "100%" : "none"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
