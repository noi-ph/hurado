"use client";

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import styles from './empty_notice.module.css';
import classNames from "classnames";

type MouseLocation = {
  x: number;
  y: number;
};

type EyeProps = {
  mouse: MouseLocation;
};

function Eye({ mouse }: EyeProps) {
  const socket = useRef<HTMLDivElement>(null);

  const style = getPupilStyle(socket.current, mouse);

  return (
    <div ref={socket} style={style} className="relative h-14 w-14 rounded-full border border-gray-800 bg-white">
      <div  className={classNames(styles.pupil, "absolute rounded-full bg-gray-800")}/>
    </div>
  );
};


function GooglyEyes() {
  const [mouse, setMouse] = useState({
    x: 0,
    y: 0
  });

  const onMouseMove = useCallback((event: MouseEvent) => {
    setMouse({ x: event.clientX, y: event.clientY });
  }, []);

  const onTouchMove = useCallback((event: TouchEvent) => {
    if (event.touches.length > 0) {
      setMouse({ x: event.touches[0].clientX, y: event.touches[0].clientX });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div className="flex justify-center gap-2">
      <Eye mouse={mouse} />
      <Eye mouse={mouse} />
    </div>
  );
}


function getPupilStyle(socket: HTMLDivElement | null, mouse: MouseLocation): CSSProperties | undefined {
  if (socket == null) {
    return undefined;
  }

  const rect = socket.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  // distance from eyes to mouse pointer
  const mouseX = mouse.x - cx;
  const mouseY = mouse.y - cy;

  const rotationRadians = Math.atan2(mouseX, mouseY);
  const rotationDegrees = rotationRadians * (180 / Math.PI) * -1 + 90;

  return { transform: `rotate(${rotationDegrees}deg)` };
}

type EmptyNoticeProps = {
  className?: string;
};

export function EmptyNotice({ className }: EmptyNoticeProps) {
  return (
    <div className={classNames(className, "text-center w-fit mx-auto py-12 px-6 rounded-lg border border-gray-800")}>
      <GooglyEyes/>
      <div className="max-w-96 mt-6 mx-auto text-gray-800">
        We searched everywhere, but there's nothing to see here right now. Please come back later.
      </div>
    </div>
  )
}

export function EmptyNoticePage() {
  return (
    <div className="my-16">
      <EmptyNotice/>
    </div>
  );
}
