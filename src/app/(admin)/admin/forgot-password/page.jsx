'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TbMail, TbArrowLeft } from 'react-icons/tb';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://agriwatch-backenf.onrender.com/auth/forgotPassword',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            Email: data.email,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send reset link');
      }

      toast.success(result.message || 'Reset link sent to your email!');

      reset();

      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EBEFF5] relative p-6">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          href="/admin/login"
          className="flex items-center gap-2 text-white hover:text-accent hover:bg-white transition-colors text-sm font-bold uppercase tracking-widest bg-primary px-6 py-3 rounded border border-border shadow-md"
        >
          <TbArrowLeft size={20} /> Back
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white p-12 md:p-20 shadow-[0_0_50px_rgba(0,0,0,0.05)] rounded-sm"
      >
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-primary mb-6 tracking-tight uppercase">
            Forgot Password
          </h1>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <div className="text-lg font-medium text-primary/60 mb-4">
              Enter Email Address
            </div>

            <Input
              {...register('email')}
              placeholder="jmlustitia@gmail.com"
              icon={TbMail}
              className={`h-14 border-primary border-[1px] ${
                errors.email ? 'border-red-500' : ''
              }`}
            />

            {errors.email && (
              <p className="text-sm font-medium text-red-500 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full h-14 text-sm font-medium uppercase"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>

        <div className="mt-12 text-center text-muted-foreground/70 text-[0.9rem] leading-relaxed px-4">
          The email must be the one associated with your account.
        </div>
      </motion.div>
    </div>
  );
}