"use client";

import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  onComplete?: () => void;
  onPowerOn?: () => void; // Added to trigger page reveal
}

export default function OffswitchLogo({ onComplete, onPowerOn }: Props) {
  const [step, setStep] = useState(0); 
  // 0: Initial (Dark, only O visible)
  // 1: Powering (Wire to Fs)
  // 2: Fs active
  // 3: W active
  // 4: Switch Closing (i)
  // 5: T/I/H active
  // 6: Lamp On / Reveal Page
  // 7: Finished (Wait 5s then onComplete)

  const handleStart = useCallback(() => {
    if (step !== 0) return;
    setStep(1);
  }, [step]);

  useEffect(() => {
    if (step === 0) return;

    const timings = [
      { step: 2, delay: 600 },  // Cells in F
      { step: 3, delay: 1000 }, // W wire
      { step: 4, delay: 1400 }, // Switch closing
      { step: 5, delay: 1800 }, // T/I/H wire
      { step: 6, delay: 2200 }, // Lamp yellow, Page White
      { step: 7, delay: 7200 }, // 5s after lamp
    ];

    const currentTimings = timings.find(t => t.step === step + 1);
    if (currentTimings) {
      const timer = setTimeout(() => {
        setStep(currentTimings.step);
        if (currentTimings.step === 6) {
          onPowerOn?.();
        }
        if (currentTimings.step === 7) {
          onComplete?.();
        }
      }, currentTimings.step === 7 ? 5000 : 400); // 5s for the final reveal
      return () => clearTimeout(timer);
    }
  }, [step, onComplete, onPowerOn]);

  const red = "#ff3b30";
  const yellow = "#ffcc00";
  const black = "#000000";
  const white = "#ffffff";
  const transparent = "transparent";

  // Transition helper
  const tr = { transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' };
  const fastTr = { transition: 'all 0.3s ease' };

  // Helper to determine visibility/color based on step
  // Only O visible initially (Step 0)
  const isVisible = (s: number) => step >= s;
  
  // The 'O' is always visible but maybe dimmed or glowing
  const oColor = step > 0 ? red : black;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg 
        version="1.1" 
        viewBox="0 0 960 540" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <clipPath id="p.0">
          <path d="m0 0l960.0 0l0 540.0l-960.0 0l0 -540.0z" clipRule="nonzero"/>
        </clipPath>
        <g clipPath="url(#p.0)">
          {/* Background is handled by the caller (Page) */}

          {/* O Power Symbol (Step 0+) */}
          <g onClick={handleStart} style={{ cursor: step === 0 ? 'pointer' : 'default' }}>
            {/* Circle O */}
            <path 
              fill={step === 0 ? "#333" : isVisible(1) ? red : black} 
              d="m14.83,269.94c0,-45.5,37.27,-82.39,83.25,-82.39c22.08,0,43.25,8.68,58.87,24.13c15.61,15.45,24.38,36.41,24.38,58.26c0,45.5,-37.27,82.39,-83.25,82.39c-45.98,0,-83.25,-36.89,-83.25,-82.39zm26.28,0c0,30.98,25.51,56.1,56.97,56.1c31.46,0,56.97,-25.12,56.97,-56.1c0,-30.98,-25.51,-56.1,-56.97,-56.1c-31.46,0,-56.97,25.12,-56.97,56.1z" 
              fillRule="evenodd"
              style={tr}
            />
            {/* Power Stem */}
            <path 
              fill={step === 0 ? "#333" : isVisible(1) ? red : black} 
              d="m80.18,164.14l35.8,0l0,70.75l-35.8,0z" 
              fillRule="evenodd" 
              style={tr}
            />
          </g>

          {/* Main Connection Wire (Step 1+) */}
          <path 
            stroke={red} 
            strokeWidth="3.7" 
            strokeLinejoin="round" 
            strokeLinecap="butt" 
            d="m98.08,164.14l0,-23.29l537.1,0l0,76.32" 
            fill="none" 
            style={{ ...tr, opacity: isVisible(1) ? 1 : 0 }}
          />

          {/* F1 Cells (4 horizontal lines) - Step 2 */}
          <g style={{ ...tr, opacity: isVisible(2) ? 1 : 0 }}>
            <path fill={red} d="m187.9,266.23l84.07,0l0,3.96l-84.07,0z" fillRule="evenodd" />
            <path fill={red} d="m202.81,272.94l53.67,0l0,4.23l-53.67,0z" fillRule="evenodd" />
            <path fill={red} d="m189.01,252.6l84.07,0l0,3.96l-84.07,0z" fillRule="evenodd" />
            <path fill={red} d="m203.07,259.39l53.67,0l0,3.96l-53.67,0z" fillRule="evenodd" />
          </g>

          {/* F2 Cells (4 horizontal lines) - Step 2 */}
          <g style={{ ...tr, opacity: isVisible(2) ? 1 : 0 }}>
            <path fill={red} d="m286.97,266.22l84.07,0l0,3.96l-84.07,0z" fillRule="evenodd" />
            <path fill={red} d="m301.87,272.92l53.67,0l0,4.23l-53.67,0z" fillRule="evenodd" />
            <path fill={red} d="m288.06,252.58l84.07,0l0,3.96l-84.07,0z" fillRule="evenodd" />
            <path fill={red} d="m302.13,259.37l53.67,0l0,3.96l-53.67,0z" fillRule="evenodd" />
          </g>

          {/* S Wire (Step 1+ or 2?) */}
          <path 
            fill={red} 
            d="m421.62,248.91c-10.26,0,-18.56,2.32,-24.91,6.97c-6.35,4.65,-9.53,11.12,-9.53,19.41c0,3.2,0.54,6.21,1.62,9.01c1.1,2.78,2.76,5.42,4.96,7.91c2.23,2.47,4.84,4.68,7.84,6.63c3.02,1.95,8.87,4.81,17.54,8.57c11.25,4.77,16.87,10.49,16.87,17.15c0,9.3,-5.82,13.94,-17.47,13.94c-6.42,0,-14.89,-3.27,-25.41,-9.8l-6.65,16.96c9.86,5.28,20.38,7.91,31.56,7.91c11.84,0,21.11,-2.55,27.79,-7.66c6.68,-5.13,10.03,-12.22,10.03,-21.26c0,-6.91,-1.89,-12.66,-5.66,-17.24c-3.77,-4.59,-9.79,-8.67,-18.07,-12.25l-13.5,-5.84c-7.74,-3.33,-11.61,-8.23,-11.61,-14.7c0,-3.08,1.53,-5.62,4.6,-7.63c3.09,-2.01,6.88,-3.02,11.38,-3.02c7.54,0,15.05,2.83,22.53,8.48l5.36,-16.58c-11.78,-4.65,-21.54,-6.97,-29.28,-6.97z" 
            fillRule="evenodd"
            style={{ ...tr, opacity: isVisible(2) ? 1 : 0 }}
          />

          {/* W (The diagonal wires) - Step 3 */}
          <path 
            fill={red} 
            d="m455.3,248.58l38.02,103.08l4.96,0l31.07,-68.69l31.17,68.69l4.96,0l38.12,-103.08l-18.56,0l-24.42,66.24l-29.18,-66.24l-4.96,0l-28.29,66.24l-22.73,-66.24z" 
            fillRule="evenodd"
            style={{ ...tr, opacity: isVisible(3) ? 1 : 0 }}
          />

          {/* I Switch (Step 4) */}
          {/* Base stroke of i */}
          <path fill={red} d="m623.14,270.43l25.24,0l0,81.2l-25.24,0z" fillRule="evenodd" style={{ ...tr, opacity: isVisible(5) ? 1 : 0 }}/>
          {/* Dot of i (The button) */}
          <path fill={red} d="m623.52,217.15l23.33,0l0,27.09l-23.33,0z" fillRule="evenodd" style={{ ...tr, opacity: isVisible(5) ? 1 : 0 }}/>
          
          {/* Switch Arm - Path 26? Let's use coordinate logic if possible or just color it */}
          <path 
            fill={red} 
            d="m623.52,217.15l23.33,0l0,27.09l-23.33,0z" 
            fillRule="evenodd" 
            style={{ 
              ...tr,
              opacity: isVisible(4) ? 1 : 0,
              transform: step >= 4 ? 'translateY(5px)' : 'none',
              transformOrigin: 'center'
            }}
          />

          {/* Connection through T to H (Step 5) */}
          {/* T Stems */}
          <g style={{ ...tr, opacity: isVisible(5) ? 1 : 0 }}>
             <path fill={red} d="m698.76,217.79l25.24,0l0,133.84l-25.24,0z" fillRule="evenodd" />
             <path fill={red} d="m680.05,248.61l62.89,0l0,28.08l-62.89,0z" fillRule="evenodd" />
             <path fill={red} d="m712.06,253.06l0.76,1.73l-9.8,4.34l-0.76,-1.73z" fillRule="evenodd" />
             <path fill={red} d="m712.82,269.3l-0.79,1.76l-9.77,-4.34l0.79,-1.76z" fillRule="evenodd" />
          </g>

          {/* H Stem (Step 5) */}
          <path fill={red} d="m854.17,258.73l20.45,0l0,92.2l-20.45,0z" fillRule="evenodd" style={{ ...tr, opacity: isVisible(5) ? 1 : 0 }}/>
          <path fill={red} d="m854.17,174.54l20.45,0l0,85.48l-20.45,0z" fillRule="evenodd" style={{ ...tr, opacity: isVisible(5) ? 1 : 0 }}/>

          {/* C Lamp Area (Step 6) */}
          {/* Lamp Background Circle */}
          <path 
            fill={yellow} 
            d="m773.05,308.58c0,-18.28,14.82,-33.1,33.1,-33.1c8.78,0,17.2,3.49,23.41,9.7c6.21,6.21,9.7,14.63,9.7,23.41c0,18.28,-14.82,33.1,-33.1,33.1c-18.28,0,-33.1,-14.82,-33.1,-33.1zm2.29,0c0,17.02,13.8,30.81,30.81,30.81c17.02,0,30.81,-13.8,30.81,-30.81c0,-17.02,-13.8,-30.81,-30.81,-30.81c-17.02,0,-30.81,13.8,-30.81,30.81z" 
            fillRule="evenodd" 
            style={{ ...tr, opacity: isVisible(6) ? 1 : 0 }}
          />
          {/* Filament X inside C */}
          <path fill={black} d="m827.18,283.75l1.7,1.67l-47.19,47.19l-1.7,-1.67z" fillRule="evenodd" />
          <path fill={black} d="m830.66,330.95l-1.67,1.67l-47.19,-47.22l1.67,-1.67z" fillRule="evenodd" />

          {/* Masking the rest of the letters initially to make them "invisible" */}
          {/* We'll just set their fill to transparent or black based on step */}
          <g style={{ opacity: isVisible(6) ? 1 : 0, ...tr }}>
            {/* The base letters - in black */}
            <path fill={black} d="m809.85,262.31c-17.43,0,-31.16,4.29,-41.21,12.87c-10.02,8.58,-15.03,19.96,-15.03,34.14c0,13.9,4.83,24.92,14.49,33.06c9.66,8.14,21.89,12.21,36.68,12.21c15.27,0,28.07,-2.74,38.4,-8.22l-7.6,-13.29c-8.78,5.48,-17.5,8.22,-26.14,8.22c-11.15,0,-19.86,-2.72,-26.14,-8.17c-6.28,-5.46,-9.42,-13.4,-9.42,-23.81c0,-10.47,3.07,-18.7,9.22,-24.7c6.15,-6.02,14.46,-9.03,24.93,-9.03c4.8,0,9.67,0.72,14.63,2.16c4.98,1.44,8.44,2.96,10.4,4.57l9.52,-11.13c-3.11,-2.05,-7.94,-4.04,-14.49,-5.98c-6.55,-1.94,-12.63,-2.91,-18.24,-2.91z" fillRule="evenodd" />
            <path fill={black} d="m925.79,268.29l17.9,0l0,84.07l-17.9,0z" fillRule="evenodd" />
          </g>

        </g>
      </svg>

      {/* Glow effects (using CSS drop-shadow for simplicity and performance) */}
      {isVisible(6) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '100%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 100px rgba(255, 204, 0, 0.2)',
          mixBlendMode: 'screen',
          animation: 'pulse 4s infinite'
        }} />
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
