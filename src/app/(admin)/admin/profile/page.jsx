'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TbUser, TbMail, TbLock, TbEye, TbEyeOff, TbShieldCheck } from 'react-icons/tb';
import { toast } from 'sonner';
import { changePassword, getMe, updateProfile } from '@/lib/api';
import { LANGUAGE_LABELS } from '@/data/sampleData';
import { PageHeader, Panel, Loading } from '@/components/admin/parts';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const profileSchema = z.object({
  alias: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  language: z.enum(['EN', 'RW']),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Use at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

function ProfileForm({ user, onSaved }) {
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { alias: user.alias || '', email: user.email || '', language: user.language || 'EN' },
  });

  const onSubmit = async (values) => {
    try {
      const saved = await updateProfile(values);
      reset(values);
      onSaved(saved);
      toast.success('Profile saved');
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      toast.error(error.message || 'Could not save your profile');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="alias" className="label">Display name</label>
        <Input id="alias" icon={TbUser} {...register('alias')} aria-invalid={!!errors.alias} />
        {errors.alias && <p className="field-error">{errors.alias.message}</p>}
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <Input id="email" type="email" icon={TbMail} autoComplete="email" {...register('email')} aria-invalid={!!errors.email} />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="language" className="label">Language</label>
        <select id="language" className="select" {...register('language')}>
          {Object.entries(LANGUAGE_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
        </select>
      </div>
      <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>Save changes</Button>
    </form>
  );
}

function PasswordForm() {
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await changePassword(currentPassword, newPassword);
      reset();
      toast.success('Password updated');
    } catch (error) {
      toast.error(error.message || 'Could not update your password');
    }
  };

  const fields = [
    { name: 'currentPassword', label: 'Current password', autoComplete: 'current-password' },
    { name: 'newPassword', label: 'New password', autoComplete: 'new-password' },
    { name: 'confirmPassword', label: 'Confirm new password', autoComplete: 'new-password' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="label">{f.label}</label>
          <Input
            id={f.name}
            type={show ? 'text' : 'password'}
            autoComplete={f.autoComplete}
            icon={TbLock}
            rightIcon={show ? TbEyeOff : TbEye}
            rightIconLabel={show ? 'Hide passwords' : 'Show passwords'}
            onClickRightIcon={() => setShow(!show)}
            {...register(f.name)}
            aria-invalid={!!errors[f.name]}
          />
          {errors[f.name] && <p className="field-error">{errors[f.name].message}</p>}
        </div>
      ))}
      <Button type="submit" variant="outline" isLoading={isSubmitting}>Update password</Button>
    </form>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch((error) => toast.error(error.message || 'Could not load your profile'));
  }, []);

  if (!user) return <Loading label="Loading profile…" />;

  const name = user.alias || 'Admin';

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="Profile" description="Your admin details and sign-in password." />

      <section className="relative overflow-hidden rounded-[22px] bg-lavender p-6">
        <span className="absolute -top-8 -right-8 size-32 rounded-full bg-accent-soft" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-brand font-display text-[1.4rem] font-bold text-on-brand">
            {name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </span>
          <div>
            <h2 className="m-0 font-display text-[1.4rem]">{name}</h2>
            <p className="m-0 text-muted">{user.email}</p>
          </div>
          <span className="tag tag-brand ml-auto"><TbShieldCheck size={13} /> Administrator</span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Details" description="How you appear to other admins and moderators">
          <ProfileForm user={user} onSaved={setUser} />
        </Panel>
        <Panel title="Password" description="Use at least 8 characters you don't use anywhere else">
          <PasswordForm />
        </Panel>
      </div>
    </div>
  );
}
