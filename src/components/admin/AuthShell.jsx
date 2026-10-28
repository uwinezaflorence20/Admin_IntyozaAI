"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TbShieldLock } from "react-icons/tb";
import { Brand } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Two-column layout for sign-in screens: Intyoza illustration on the left, form on the right. */
export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-lavender p-10 lg:flex">
        <span className="absolute -top-10 -right-10 size-56 rounded-full bg-accent-soft" aria-hidden="true" />
        <span className="absolute bottom-24 -left-12 size-40 rounded-full bg-teal-soft" aria-hidden="true" />
        <Brand className="relative h-12 w-auto" />
        <div className="relative mx-auto w-full max-w-md">
          <Image src="/auth-hero.png" alt="" width={453} height={425} priority className="h-auto w-full" />
        </div>
        <div className="relative max-w-md">
          <h2 className="mb-2 font-display text-[1.6rem] leading-tight">Safe answers, real support.</h2>
          <p className="m-0 text-muted">
            Keep Intyoza accurate, kind and private for every young person who uses it.
          </p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-5 lg:justify-end">
          <span className="lg:hidden">
            <Brand className="h-10 w-auto" />
          </span>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1 text-[0.8rem] font-semibold text-teal-text">
              <TbShieldLock size={14} /> Admin console
            </span>
            <h1 className="mt-4 mb-2 font-display text-[2rem] leading-tight font-bold">{title}</h1>
            {subtitle && <p className="mb-7 text-muted">{subtitle}</p>}
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
