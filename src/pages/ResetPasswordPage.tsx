import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from "react-router";
import { motion } from 'framer-motion';
import { TbLock, TbEye, TbEyeOff, TbArrowLeft, TbCheck, TbCircleCheck } from 'react-icons/tb';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from '@/components/admin/AuthShell';

const resetPasswordSchema = z.object({
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'An uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'A number', test: (v: string) => /\d/.test(v) },
  { label: 'A symbol', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH = [
  { label: 'Too weak', color: 'bg-danger' },
  { label: 'Weak', color: 'bg-danger' },
  { label: 'Fair', color: 'bg-accent' },
  { label: 'Good', color: 'bg-teal' },
  { label: 'Strong', color: 'bg-success' },
];

// UI only: simulates the network request until a real backend is connected.
const fakeRequest = () => new Promise((resolve) => setTimeout(resolve, 900));

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  const password = useWatch({ control, name: 'password' }) || '';
  const score = RULES.filter((rule) => rule.test(password)).length;
  const strength = STRENGTH[score];

  const onSubmit = async () => {
    setIsLoading(true);
    await fakeRequest();
    setIsLoading(false);
    setIsDone(true);
  };

  if (isDone) {
    return (
      <AuthShell title="Password updated" subtitle="Your new password is saved. Use it the next time you sign in.">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6">
          <span className="grid size-16 place-items-center rounded-full bg-teal-soft text-success">
            <TbCircleCheck size={36} />
          </span>
        </motion.div>
        <Link to="/admin/login" className="btn btn-primary w-full">
          Continue to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Pick something strong that you don't use anywhere else.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="password" className="label">New password</label>
          <Input
            id="password"
            autoComplete="new-password"
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="New password"
            icon={TbLock}
            rightIcon={showPassword ? TbEyeOff : TbEye}
            rightIconLabel={showPassword ? 'Hide passwords' : 'Show passwords'}
            onClickRightIcon={() => setShowPassword(!showPassword)}
            aria-invalid={!!errors.password}
            className={errors.password ? 'border-danger' : ''}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}

          {password && (
            <div className="mt-3">
              <div className="flex gap-1.5" aria-hidden="true">
                {RULES.map((rule, i) => (
                  <span
                    key={rule.label}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? strength.color : 'bg-border'}`}
                  />
                ))}
              </div>
              <p className="mt-1.5 mb-0 text-[0.8rem] font-semibold text-muted" aria-live="polite">
                Strength: {strength.label}
              </p>
            </div>
          )}

          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[0.82rem]">
            {RULES.map((rule) => {
              const passed = rule.test(password);
              return (
                <li key={rule.label} className={`flex items-center gap-1.5 ${passed ? 'text-success' : 'text-muted'}`}>
                  <span
                    className={`grid size-4 place-items-center rounded-full ${passed ? 'bg-success text-white' : 'border border-border'}`}
                  >
                    {passed && <TbCheck size={11} />}
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirm new password</label>
          <Input
            id="confirmPassword"
            autoComplete="new-password"
            {...register('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Type it again"
            icon={TbLock}
            aria-invalid={!!errors.confirmPassword}
            className={errors.confirmPassword ? 'border-danger' : ''}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          {isLoading ? 'Saving…' : 'Save new password'}
        </Button>
      </form>

      <Link to="/admin/login" className="btn btn-ghost mt-2 w-full">
        <TbArrowLeft size={18} /> Back to sign in
      </Link>
    </AuthShell>
  );
}
