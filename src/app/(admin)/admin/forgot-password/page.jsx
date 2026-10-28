'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TbMail, TbArrowLeft, TbMailOpened, TbRefresh, TbPencil } from 'react-icons/tb';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from '@/components/admin/AuthShell';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

const RESEND_SECONDS = 30;

// UI only: simulates the network request until a real backend is connected.
const fakeRequest = () => new Promise((resolve) => setTimeout(resolve, 900));

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const onSubmit = async ({ email }) => {
    setIsLoading(true);
    await fakeRequest();
    setIsLoading(false);
    setSentTo(email);
    setCooldown(RESEND_SECONDS);
  };

  const onResend = async () => {
    setIsLoading(true);
    await fakeRequest();
    setIsLoading(false);
    setCooldown(RESEND_SECONDS);
    toast.success('A new reset link has been sent.');
  };

  return (
    <AuthShell
      title={sentTo ? 'Check your email' : 'Forgot your password?'}
      subtitle={
        sentTo
          ? null
          : "No worries. Enter the email of your admin account and we'll send you a link to choose a new password."
      }
    >
      <AnimatePresence mode="wait">
        {sentTo ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="mb-6 flex items-start gap-4 rounded-2xl border border-border bg-teal-soft p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-bg text-teal-text">
                <TbMailOpened size={22} />
              </span>
              <p className="m-0 text-[0.95rem]">
                If <strong className="break-all">{sentTo}</strong> belongs to an admin account, a reset link is on
                its way. The link expires in 30 minutes.
              </p>
            </div>

            <ol className="mb-6 space-y-2 pl-5 text-[0.9rem] text-muted">
              <li>Open the email from Intyoza.</li>
              <li>Click <strong className="text-fg">Reset password</strong>.</li>
              <li>Choose a new password and sign in.</li>
            </ol>

            <Button onClick={onResend} isLoading={isLoading} disabled={cooldown > 0} className="w-full">
              <TbRefresh size={18} />
              {cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend link'}
            </Button>

            <button
              type="button"
              onClick={() => setSentTo('')}
              className="btn btn-ghost mt-2 w-full"
            >
              <TbPencil size={18} /> Use a different email
            </button>

            <p className="mt-4 text-center text-[0.8rem] text-muted">
              Design preview:{' '}
              <Link href="/admin/reset-password/demo" className="font-semibold text-brand hover:underline">
                open the reset page
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <label htmlFor="email" className="label">Email</label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                placeholder="you@intyoza.rw"
                icon={TbMail}
                aria-invalid={!!errors.email}
                className={errors.email ? 'border-danger' : ''}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              {isLoading ? 'Sending…' : 'Send reset link'}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <Link href="/admin/login" className="btn btn-ghost mt-2 w-full">
        <TbArrowLeft size={18} /> Back to sign in
      </Link>
    </AuthShell>
  );
}
