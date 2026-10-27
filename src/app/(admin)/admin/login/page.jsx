"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TbMail, TbLock, TbEye, TbEyeOff } from "react-icons/tb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
});

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const router = useRouter();


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setApiError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://agriwatch-backenf.onrender.com/auth/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            Email: data.email,
            Password: data.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Handle various token key names the API might return
      const token =
        result.token ||
        result.accessToken ||
        result.data?.token ||
        result.data?.accessToken;

      // Handle various user object locations the API might return
      const user = result.user || result.data?.user || result.data;

      if (!token) {
        throw new Error("Login failed: no token received from server.");
      }

      // Ensure only admins can access this portal
      if (user?.Role !== "Admin") {
        throw new Error("Access denied. Admin account required.");
      }

      // Save token and user details
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Logged in successfully!");

      reset();

      router.replace("/admin/dashboard");
    } catch (error) {
      setApiError(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-black bg-white">
      {/* Left Side */}
      <div className="hidden lg:block lg:w-1/2 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-60 bg-[url('/Home.jpeg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary/40 to-transparent" />
      </div>

      {/* Right Side */}
      <div className="w-full bg-muted lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/icon.png"
              alt="AgriWatch Logo"
              width={150}
              height={150}
            />
          </div>

          {/* Heading */}
          <div className="mb-10 text-center">
            <p className="text-[#2F6B4F] text-xl font-extrabold uppercase tracking-widest">
              Admin Portal Access
            </p>

            <p className="text-sm text-muted-foreground mt-2 italic">
              Please log in with your administrative credentials to manage the
              AgriWatch system.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div className="space-y-2">
              <Input
                {...register("email")}
                placeholder="Email Address"
                icon={TbMail}
                className={`h-14 bg-white ${
                  errors.email ? "border-red-500" : ""
                }`}
              />

              {errors.email && (
                <p className="text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                icon={TbLock}
                rightIcon={showPassword ? TbEyeOff : TbEye}
                onClickRightIcon={() =>
                  setShowPassword(!showPassword)
                }
                className={`h-14 bg-white ${
                  errors.password ? "border-red-500" : ""
                }`}
              />

              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* API Error */}
            {apiError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm text-center">
                {apiError}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full h-14 text-sm font-semibold uppercase"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            {/* Forgot Password */}
            
          </form>
        </motion.div>
      </div>
    </div>
  );
}
