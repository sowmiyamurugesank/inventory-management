
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Form from "../component/Form";
import "../styles/Login.css";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
 password: z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[0-9]/, "Include at least one number")
  .regex(/[@#!]/, "Include at least one special character (@, #, or !)"),
  rememberMe: z.boolean(),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleLogin = (data) => {
    console.log(data);
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="brand-logo">
          <span className="brand-icon">S</span>
          <span>Stockwise</span>
        </div>

        <div className="brand-content">
          <span className="brand-label">INVENTORY MANAGEMENT PLATFORM</span>
          <h1>Everything in stock. Everything in control.</h1>
          <p>
            Manage products, track inventory, streamline orders, and make
            smarter business decisions from one place.
          </p>

          <div className="brand-stats">
            <div>
              <strong>Real-time</strong>
              <span>Stock visibility</span>
            </div>
            <div>
              <strong>One platform</strong>
              <span>Complete control</span>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          <span>© 2026 Stockwise</span>
          <span>Smarter inventory. Better business.</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="mobile-brand">
          <span className="brand-icon">S</span>
          <span>Stockwise</span>
        </div>

        <div className="login-container">
          <div className="form-heading">
            <span className="welcome-label">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to access your workspace.</p>
          </div>

          <Form
            className="auth-form"
            submitText="Sign In"
            onSubmit={handleSubmit(handleLogin)}
            register={register}
            errors={errors}
            fields={[
              {
                name: "email",
                label: "Work Email",
                type: "email",
                placeholder: "you@company.com",
                autoComplete: "email",
              },
              {
                name: "password",
                label: "Password",
                type: showPassword ? "text" : "password",
                placeholder: "Enter your password",
                autoComplete: "current-password",
                inputWrapperClass: "password-input",
                suffix: (
                  <button
                    type="button"
                    className="show-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                ),
              },
            ]}
          >
            <div className="login-options">
              <label className="remember-option">
                <input type="checkbox" {...register("rememberMe")} />
                <span>Remember me</span>
              </label>

              <button type="button" className="text-button">
                Forgot password?
              </button>
            </div>
          </Form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/signup")}>
              Sign up
            </button>
          </p>

          <p className="security-note">
            Your workspace, securely managed.
          </p>
        </div>
      </section>
    </main>
  );
}

