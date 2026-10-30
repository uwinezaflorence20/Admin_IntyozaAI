import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { TbMail, TbLock, TbEye, TbEyeOff, TbAlertCircle, TbFlask } from "react-icons/tb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthShell } from "@/components/admin/AuthShell";
import { DEMO_MODE, login } from "@/lib/api";
import { errorMessage } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters long"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async ({ email, password }: LoginValues) => {
    setApiError("");
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      setApiError(errorMessage(error, "Invalid email or password"));
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Use your Intyoza admin account to manage the platform.">
      {DEMO_MODE && (
        <div className="notice notice-warn mb-5 text-[0.88rem]">
          <TbFlask size={18} />
          <p className="m-0">Demo mode: any email and an 8+ character password will sign you in with sample data.</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            placeholder="you@intyoza.rw"
            icon={TbMail}
            aria-invalid={!!errors.email}
            className={errors.email ? "border-danger" : ""}
          />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">Password</label>
            <Link to="/admin/forgot-password" className="mb-1.5 text-[0.85rem] font-semibold text-brand hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            autoComplete="current-password"
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            icon={TbLock}
            rightIcon={showPassword ? TbEyeOff : TbEye}
            rightIconLabel={showPassword ? "Hide password" : "Show password"}
            onClickRightIcon={() => setShowPassword(!showPassword)}
            aria-invalid={!!errors.password}
            className={errors.password ? "border-danger" : ""}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        {apiError && (
          <div className="notice notice-danger text-[0.9rem]" role="alert">
            <TbAlertCircle size={18} className="text-danger" />
            <p className="m-0">{apiError}</p>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
