'use client';

import React, { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';
import { LanyardWrapper, Card, CardFront, CardBack } from './Lanyard.styles';

export default function Lanyard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 300, damping: 30 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const tiltX = useTransform(springY, [0, 1], ['15deg', '-15deg']);
  const tiltY = useTransform(springX, [0, 1], ['-15deg', '15deg']);

  const glareX = useTransform(springX, [0, 1], [0, 100]);
  const glareY = useTransform(springY, [0, 1], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(
    circle at ${glareX}% ${glareY}%, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(255, 255, 255, 0.2) 20%, 
    transparent 80%
  )`;

  const shadowX = useTransform(springX, [0, 1], [25, -25]);
  const shadowY = useTransform(springY, [0, 1], [25, -25]);
  const boxShadow = useMotionTemplate`${shadowX}px ${shadowY}px 40px rgba(0, 0, 0, 0.5)`;

  const glareOpacity = useTransform([springX, springY], ([x, y]: number[]) => {
    const dist = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
    return dist * 1.2;
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handlePointerLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <LanyardWrapper>
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={() => setIsFlipped((prev) => !prev)}
        style={{
          perspective: 1500,
          width: '280px',
          height: '423px',
          cursor: 'pointer',
          touchAction: 'none',
        }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              borderRadius: '16px',
              rotateX: tiltX,
              rotateY: tiltY,
              boxShadow: boxShadow,
            }}
          >
            <Card>
              <CardFront>
                <img
                  src="/lanyard/card_front.png"
                  alt="Card Front"
                  className="card-image"
                  fetchPriority="high"
                />
                <motion.div
                  style={{ background: glareBackground, opacity: glareOpacity }}
                  className="glare"
                />
              </CardFront>

              <CardBack>
                <img
                  src="/lanyard/card_back.png"
                  alt="Card Back"
                  className="card-image"
                  fetchPriority="high"
                />
                <motion.div
                  style={{ background: glareBackground, opacity: glareOpacity }}
                  className="glare"
                />
              </CardBack>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </LanyardWrapper>
  );
}
