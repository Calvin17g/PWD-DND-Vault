import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await authAPI.login(data);
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Enter the vault, adventurer</p>
        </div>

        <div className="divider">✦</div>

        {serverError && <div className="error-banner">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
            {isSubmitting ? "Entering..." : "Enter the Vault"}
          </button>
        </form>

        <p className="auth-switch">
          New adventurer? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
