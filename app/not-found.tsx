'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center select-none"
      style={{
        backgroundColor: 'var(--color-on-primary-container, #f0fdfa)',
        color: '#111827',
      }}
    >
      <div className="max-w-md w-full flex flex-col items-center">

        {/* Animated 404 Illustration / Magnifying Glass Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative w-44 h-44 mb-6 flex items-center justify-center"
        >
          {/* Subtle glowing background aura */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-30"
            style={{ backgroundColor: 'var(--color-primary, #0d9488)' }}
          />

          {/* Floating SVG Magnifying Glass Illustration */}
          <motion.svg
            animate={{
              y: [0, -12, 0],
              rotate: [0, 3, -3, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: 'easeInOut'
            }}
            className="w-36 h-36 relative z-10 drop-shadow-md"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Dashed outer orbit ring */}
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="var(--color-primary, #0d9488)"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.3"
            />

            {/* Magnifying Glass Frame */}
            <circle
              cx="90"
              cy="90"
              r="42"
              stroke="var(--color-primary, #0d9488)"
              strokeWidth="10"
              fill="var(--color-on-primary-container, #f0fdfa)"
            />
            <circle
              cx="90"
              cy="90"
              r="30"
              fill="var(--color-primary, #0d9488)"
              opacity="0.1"
            />

            {/* Handle */}
            <path
              d="M120 120 L155 155"
              stroke="var(--color-primary-container, #0f766e)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Question Mark Inside Lens */}
            <path
              d="M84 82 C84 76, 96 76, 96 83 C96 88, 90 90, 90 95"
              stroke="var(--color-primary-container, #0f766e)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="90" cy="103" r="2.5" fill="var(--color-primary-container, #0f766e)" />

            {/* Decorative Sparkles */}
            <circle cx="145" cy="55" r="4" fill="var(--color-primary, #0d9488)" />
            <circle cx="45" cy="135" r="3" fill="var(--color-primary, #0d9488)" />
            <path d="M150 80 L158 80 M154 76 L154 84" stroke="var(--color-primary, #0d9488)" strokeWidth="2" strokeLinecap="round" />
          </motion.svg>
        </motion.div>

        {/* 404 Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl md:text-7xl font-extrabold tracking-tight mb-2"
          style={{ color: 'var(--color-primary-container, #0f766e)' }}
        >
          404
        </motion.h1>

        {/* Subtitle */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ color: 'var(--color-primary, #0d9488)' }}
        >
          Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-sm md:text-base mb-8 max-w-sm opacity-80"
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </motion.p>

        {/* Home Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
            style={{
              backgroundColor: 'var(--color-primary, #0d9488)',
              color: 'var(--color-on-primary, #ffffff)',
            }}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return Home
          </Link>
        </motion.div>

      </div>
    </div>
  )
}