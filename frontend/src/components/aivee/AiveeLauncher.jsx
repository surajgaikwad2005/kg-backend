/**
 * AiveeLauncher
 * The floating avatar button shown when the chat is closed. Accent (ring + glow)
 * comes from the `accent` prop via the cascaded --aivee-accent var.
 */
'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { AIVEE_AVATAR } from './aivee.constants';
import { ACCENT, accentVars } from './aivee.theme';

export function AiveeLauncher({ avatar = AIVEE_AVATAR, onClick, label = 'Open Aivee assistant', className, accent }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      style={accentVars(accent)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={cn(
        'h-13 w-13 cursor-pointer overflow-hidden rounded-full border-2',
        ACCENT.ring, ACCENT.glow, ACCENT.glowHover,
        className,
      )}
    >
      <Image src={avatar} alt="Aivee" width={52} height={52} className="h-full w-full object-cover" priority />
    </motion.button>
  );
}
