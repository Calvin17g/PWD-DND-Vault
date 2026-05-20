import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

// Zod validation schema
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(20, "Username must be 20 characters or fewer.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores.",
      ),
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const { confirmPassword, ...payload } = data;
      const res = await authAPI.register(payload);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card card">
        <div className="auth-header">
          <h1 className="auth-title">Join the Vault</h1>
          <p className="auth-subtitle">Create your adventurer's account</p>
        </div>

        <div className="divider">✦</div>

        {serverError && <div className="error-banner">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              {...register("username")}
              className={`form-input ${errors.username ? "error" : ""}`}
              placeholder="ThunderStrike99"
            />
            {errors.username && (
              <span className="form-error">{errors.username.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              {...register("email")}
              type="email"
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="wizard@adventure.com"
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              {...register("password")}
              type="password"
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              {...register("confirmPassword")}
              type="password"
              className={`form-input ${errors.confirmPassword ? "error" : ""}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span className="form-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "0.5rem",
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Begin Your Journey"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
