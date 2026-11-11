import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { TbShieldLock } from "react-icons/tb";
import { Brand } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AuthShellProps {
  title: string;
  subtitle?: string | null;
  children: ReactNode;
}

/** Sign-in layout: form on the left, purple Intyoza panel with the group illustration on the right. */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex min-h-screen flex-col px-6 py-5 sm:px-10">
        <div className="flex items-center justify-between">
          <Brand className="h-10 w-auto" />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px]">
            <span className="eyebrow">Admin console</span>
            <h1 className="m-0 mb-2 font-display text-[clamp(2rem,3.4vw,2.6rem)] leading-tight font-bold">{title}</h1>
            {subtitle && <p className="mb-8 text-muted">{subtitle}</p>}
            {children}
          </motion.div>
        </div>

        <p className="m-0 inline-flex items-center justify-center gap-1.5 text-center text-[0.82rem] text-muted">
          <TbShieldLock size={15} className="shrink-0 text-teal-text" /> For authorised Intyoza staff only
        </p>
      </div>

      <div className="sticky top-0 hidden h-screen min-h-[560px] p-4 pl-0 lg:block">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-auth-panel text-white">
          <span className="absolute -top-24 -right-24 size-80 rounded-full bg-white/[0.06]" aria-hidden="true" />
          <span className="absolute top-1/3 -left-28 size-72 rounded-full bg-white/[0.05]" aria-hidden="true" />

          <div className="relative max-w-[30rem] px-10 pt-12 xl:px-14">
            <h2 className="m-0 mb-3 font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.15] font-bold text-white">
              Safe answers, real support.
            </h2>
            <p className="m-0 text-[1.02rem] text-white/80">
              Keep Intyoza accurate, kind and private for every young person who uses it.
            </p>
          </div>

          <div className="relative mt-auto flex justify-center px-8">
            <img
              src="/auth-people.webp"
              alt="A group of young people celebrating together"
              className="h-[min(60vh,560px)] w-auto max-w-full translate-y-1 object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
