"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete?: () => void;
  onPowerOn?: () => void;
}

export default function OffswitchLogo({ onComplete, onPowerOn }: Props) {
  const [step, setStep] = useState(0); 
  // 0: Initial (Dark)
  // 1: Powering (O active, main wire glows)
  // 2: F and S elements active
  // 3: W wires and segments active
  // 4: Switch Handle Moves (The "i" dot and handle stem)
  // 5: T, I stem, and H segments active
  // 6: Lamp On / Reveal Page
  // 7: Finished

  const handleStart = useCallback(() => {
    if (step !== 0) return;
    setStep(1);
  }, [step]);

  useEffect(() => {
    if (step === 0) return;

    const timings = [
      { step: 2, delay: 800 },  
      { step: 3, delay: 800 }, 
      { step: 4, delay: 800 }, 
      { step: 5, delay: 600 }, 
      { step: 6, delay: 1000 },
      { step: 7, delay: 6000 }, 
    ];

    const currentTimings = timings.find(t => t.step === step + 1);
    if (currentTimings) {
      const timer = setTimeout(() => {
        setStep(currentTimings.step);
        if (currentTimings.step === 6) onPowerOn?.();
        if (currentTimings.step === 7) onComplete?.();
      }, currentTimings.delay);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete, onPowerOn]);

  const RED = "#ff3b30";
  const YELLOW = "#ffcc00";
  const DARK = "#1a1a1a";
  const OFF_WHITE = "#e0e0e0";

  // Transition helper for static elements color change
  const transition = { duration: 0.6, ease: [0.4, 0, 0.2, 1] };

  const getStepColor = (targetStep: number, activeColor: string = RED, inactiveColor: string = DARK) => {
    return step >= targetStep ? activeColor : inactiveColor;
  };

  const isVisible = (targetStep: number) => step >= targetStep;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg 
        version="1.1" 
        viewBox="0 0 960 540" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', display: 'block', filter: isVisible(6) ? 'drop-shadow(0 0 15px rgba(255, 204, 0, 0.3))' : 'none' }}
      >
        <clipPath id="p.0">
          <path d="m0 0l960.0 0l0 540.0l-960.0 0l0 -540.0z" clipRule="nonzero"/>
        </clipPath>
        <g clipPath="url(#p.0)">
          
          {/* Main Background Wire (Step 1) */}
          <motion.path 
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: isVisible(1) ? 1 : 0.1, pathLength: isVisible(1) ? 1 : 0 }}
            transition={{ duration: 1.2 }}
            stroke={isVisible(1) ? RED : DARK} 
            strokeWidth="3.7" 
            strokeLinejoin="round" 
            strokeLinecap="round" 
            d="m98.08,164.14l0,-23.29l537.1,0l0,76.32" 
            fill="none" 
          />

          <motion.path 
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible(1) ? 1 : 0.1 }}
            stroke={isVisible(1) ? RED : DARK} 
            strokeWidth="2.8" 
            strokeLinejoin="round" 
            d="m935.79,367.17l-731.71,0" 
            fill="none"
          />

          {/* O - Power Symbol (Step 0/1) */}
          <g onClick={handleStart} style={{ cursor: step === 0 ? 'pointer' : 'default' }}>
            <motion.path 
              animate={{ fill: isVisible(1) ? RED : DARK }}
              transition={transition}
              d="m14.83,269.94c0,-45.5,37.27,-82.39,83.25,-82.39c22.08,0,43.25,8.68,58.87,24.13c15.61,15.45,24.38,36.41,24.38,58.26c0,45.5,-37.27,82.39,-83.25,82.39c-45.98,0,-83.25,-36.89,-83.25,-82.39zm26.28,0c0,30.98,25.51,56.1,56.97,56.1c31.46,0,56.97,-25.12,56.97,-56.1c0,-30.98,-25.51,-56.1,-56.97,-56.1c-31.46,0,-56.97,25.12,-56.97,56.1z" 
              fillRule="evenodd"
            />
            {/* O stem handler */}
            <motion.path 
              animate={{ 
                fill: isVisible(1) ? RED : DARK,
                y: isVisible(4) ? 5 : 0 
              }}
              transition={transition}
              d="m80.18,164.14l35.8,0l0,70.75l-35.8,0z" 
              fillRule="evenodd"
            />
            <motion.path 
              animate={{ 
                stroke: isVisible(1) ? RED : "#333",
                y: isVisible(4) ? 5 : 0
              }}
              strokeWidth="11" 
              d="m80.18,164.14l35.8,0l0,70.75l-35.8,0z" 
              fill="none"
            />
          </g>

          {/* F1 Parts (Step 2) */}
          <g style={{ opacity: isVisible(2) ? 1 : 0.1 }}>
            <motion.path animate={{ fill: isVisible(2) ? RED : DARK }} d="m187.92,266.23l84.07,0l0,3.96l-84.07,0z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(2) ? RED : DARK }} d="m202.81,272.94l53.67,0l0,4.23l-53.67,0z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(2) ? RED : DARK }} d="m189.01,252.6l84.07,0l0,3.96l-84.07,0z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(2) ? RED : DARK }} d="m203.07,259.39l53.67,0l0,3.96l-53.67,0z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(2) ? RED : DARK }} d="m221.11,251.8l20.45,0l0,19.25l-20.45,0z" fillRule="evenodd" />
          </g>

          {/* S Cells (Step 2) */}
          <g style={{ opacity: isVisible(2) ? 1 : 0.1 }}>
            <motion.path 
              animate={{ fill: isVisible(2) ? RED : DARK }}
              d="m421.62,248.91c-10.26,0,-18.56,2.32,-24.91,6.97c-6.35,4.65,-9.53,11.12,-9.53,19.41c0,3.2,0.54,6.21,1.62,9.01c1.1,2.78,2.76,5.42,4.96,7.91c2.23,2.47,4.84,4.68,7.84,6.63c3.02,1.95,8.87,4.81,17.54,8.57c11.25,4.77,16.87,10.49,16.87,17.15c0,9.3,-5.82,13.94,-17.47,13.94c-6.42,0,-14.89,-3.27,-25.41,-9.8l-6.65,16.96c9.86,5.28,20.38,7.91,31.56,7.91c11.84,0,21.11,-2.55,27.79,-7.66c6.68,-5.13,10.03,-12.22,10.03,-21.26c0,-6.91,-1.89,-12.66,-5.66,-17.24c-3.77,-4.59,-9.79,-8.67,-18.07,-12.25l-13.5,-5.84c-7.74,-3.33,-11.61,-8.23,-11.61,-14.7c0,-3.08,1.53,-5.62,4.6,-7.63c3.09,-2.01,6.88,-3.02,11.38,-3.02c7.54,0,15.05,2.83,22.53,8.48l5.36,-16.58c-11.78,-4.65,-21.54,-6.97,-29.28,-6.97z" 
              fillRule="evenodd"
            />
            <motion.path animate={{ fill: isVisible(2) ? RED : DARK }} d="m383.07,269.06c0,-11.31,12.29,-21.14,29.72,-23.76c17.43,-2.63,35.43,2.64,43.52,12.73l-2.24,0.72c-7.8,-9.04,-24.73,-13.67,-41.02,-11.23c-16.29,2.44,-27.74,11.34,-27.74,21.55z" fillRule="evenodd" />
          </g>

          {/* W - The Complex Connection (Step 3) */}
          <g style={{ opacity: isVisible(3) ? 1 : 0.1 }}>
            {/* W Body */}
            <motion.path 
              animate={{ fill: isVisible(3) ? RED : DARK }}
              d="m455.3,248.58l38.02,103.08l4.96,0l31.07,-68.69l31.17,68.69l4.96,0l38.12,-103.08l-18.56,0l-24.42,66.24l-29.18,-66.24l-4.96,0l-28.29,66.24l-22.73,-66.24z" 
              fillRule="evenodd"
            />
            {/* Diagonal Wires in W */}
            <motion.path animate={{ fill: isVisible(3) ? OFF_WHITE : "#444" }} d="m587.24,262.94l5.08,1.82l-27.99,75.68l-5.08,-1.82z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(3) ? OFF_WHITE : "#444" }} d="m525.5,263.2l4.87,-2.26l34.48,76.65l-4.87,2.26z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(3) ? OFF_WHITE : "#444" }} d="m526.91,260.81l4.93,2.14l-34.13,76.06l-4.93,-2.14z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(3) ? OFF_WHITE : "#444" }} d="m498.92,335.76l-5.05,1.88l-28.76,-79.5l5.05,-1.88z" fillRule="evenodd" />
          </g>

          {/* Switch I (Step 4 & 5) */}
          <g>
            {/* i Stem */}
            <motion.path 
              animate={{ fill: isVisible(5) ? RED : DARK }}
              d="m623.14,270.43l25.24,0l0,81.2l-25.24,0z" 
              fillRule="evenodd" 
              transition={transition}
            />
            <motion.path 
              animate={{ fill: isVisible(5) ? RED : DARK }}
              d="m608.84,243.93l53.67,0l0,2.32l-53.67,0z" 
              fillRule="evenodd" 
              transition={transition}
            />
            {/* Switch Dot of i */}
            <motion.path 
              animate={{ 
                fill: isVisible(5) ? RED : isVisible(4) ? "#ff7b70" : DARK,
                y: isVisible(4) ? 22 : 0, 
                transition: { type: "spring", stiffness: 100, damping: 12 }
              }}
              d="m623.52,217.15l23.33,0l0,27.09l-23.33,0z" 
              fillRule="evenodd"
            />
          </g>

          {/* T to H Connection (Step 5) */}
          <g style={{ opacity: isVisible(5) ? 1 : 0.1 }}>
            <motion.path animate={{ fill: isVisible(5) ? RED : DARK }} d="m698.76,217.79l25.24,0l0,133.84l-25.24,0z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(5) ? RED : DARK }} d="m680.05,248.61l62.89,0l0,28.08l-62.89,0z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(5) ? DARK : "#000" }} d="m701.57,253.06l6.31,0l0,19.25l-6.31,0z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(5) ? RED : DARK }} d="m854.17,258.73l20.45,0l0,92.2l-20.45,0z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(5) ? RED : DARK }} d="m854.17,174.54l20.45,0l0,85.48l-20.45,0z" fillRule="evenodd" />
            <motion.path animate={{ fill: isVisible(5) ? RED : DARK }} d="m875.98,268.36l48.27,0l0,3.96l-48.27,0z" fillRule="evenodd" />
          </g>

          {/* C - The Lamp (Step 6) */}
          <g style={{ opacity: isVisible(6) ? 1 : 0.2 }}>
            <motion.path 
              animate={{ 
                fill: isVisible(6) ? YELLOW : DARK,
                stroke: isVisible(6) ? YELLOW : DARK
              }}
              strokeWidth="2.8"
              d="m773.05,308.58c0,-18.28,14.82,-33.1,33.1,-33.1c8.78,0,17.2,3.49,23.41,9.7c6.21,6.21,9.7,14.63,9.7,23.41c0,18.28,-14.82,33.1,-33.1,33.1c-18.28,0,-33.1,-14.82,-33.1,-33.1zm2.29,0c0,17.02,13.8,30.81,30.81,30.81c17.02,0,30.81,-13.8,30.81,-30.81c0,-17.02,-13.8,-30.81,-30.81,-30.81c-17.02,0,-30.81,13.8,-30.81,30.81z" 
              fillRule="evenodd" 
            />
            {/* Filament */}
            <path fill={isVisible(6) ? "#332a00" : "#111"} d="m827.18,283.75l1.7,1.67l-47.19,47.19l-1.7,-1.67z" fillRule="evenodd" />
            <path fill={isVisible(6) ? "#332a00" : "#111"} d="m830.66,330.95l-1.67,1.67l-47.19,-47.22l1.67,-1.67z" fillRule="evenodd" />
            
            {/* C Body */}
            <motion.path 
              animate={{ fill: isVisible(6) ? "#000" : DARK }}
              d="m809.85,262.31c-17.43,0,-31.16,4.29,-41.21,12.87c-10.02,8.58,-15.03,19.96,-15.03,34.14c0,13.9,4.83,24.92,14.49,33.06c9.66,8.14,21.89,12.21,36.68,12.21c15.27,0,28.07,-2.74,38.4,-8.22l-7.6,-13.29c-8.78,5.48,-17.5,8.22,-26.14,8.22c-11.15,0,-19.86,-2.72,-26.14,-8.17c-6.28,-5.46,-9.42,-13.4,-9.42,-23.81c0,-10.47,3.07,-18.7,9.22,-24.7c6.15,-6.02,14.46,-9.03,24.93,-9.03c4.8,0,9.67,0.72,14.63,2.16c4.98,1.44,8.44,2.96,10.4,4.57l9.52,-11.13c-3.11,-2.05,-7.94,-4.04,-14.49,-5.98c-6.55,-1.94,-12.63,-2.91,-18.24,-2.91z" 
              fillRule="evenodd" 
            />
          </g>

          {/* Final H and reveal (Step 6) */}
          <motion.path 
            animate={{ fill: isVisible(6) ? "#000" : DARK }}
            d="m925.79,268.29l17.9,0l0,84.07l-17.9,0z" 
            fillRule="evenodd" 
          />
        </g>
      </svg>

      {/* Glow effects */}
      <AnimatePresence>
        {isVisible(6) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              boxShadow: `inset 0 0 120px ${YELLOW}`,
              mixBlendMode: 'screen',
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
