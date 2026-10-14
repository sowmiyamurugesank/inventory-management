
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Form from "../component/Form";
import "../styles/Signup.css";

const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    companyName: z.string().trim().min(2, "Enter your company name"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
    password: z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[0-9]/, "Include at least one number")
  .regex(/[@#!]/, "Include at least one special character (@, #, or !)"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignup = (data) => {
    const { confirmPassword, ...signupData } = data;
    console.log(signupData);
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="brand-logo">
          <span className="brand-icon">S</span>
          <span>Stockwise</span>
        </div>

        <div className="brand-content">
          <span className="brand-label">YOUR BUSINESS, SIMPLIFIED</span>
          <h1>Build a smarter way to manage your inventory.</h1>
          <p>
            Bring your products, stock, orders, and business operations
            together in one organized workspace.
          </p>

          <div className="brand-stats">
            <div>
              <strong>One workspace</strong>
              <span>All your operations</span>
            </div>
            <div>
              <strong>Better visibility</strong>
              <span>Smarter decisions</span>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          <span>© 2026 Stockwise</span>
          <span>Smarter inventory. Better business.</span>
        </div>
      </section>

      <section className="auth-form-panel signup-panel">
        <div className="mobile-brand">
          <span className="brand-icon">S</span>
          <span>Stockwise</span>
        </div>

        <div className="signup-container">
          <div className="form-heading">
            <span className="welcome-label">GET STARTED</span>
            <h2>Create your workspace</h2>
            <p>Enter your details to register your company account.</p>
          </div>

          <Form
            className="auth-form signup-form"
            submitText="Create Account"
            onSubmit={handleSubmit(handleSignup)}
            register={register}
            errors={errors}
            fields={[
              {
                name: "fullName",
                label: "Full Name",
                placeholder: "Enter your full name",
                autoComplete: "name",
              },
              {
                name: "companyName",
                label: "Company Name",
                placeholder: "Enter your company name",
                autoComplete: "organization",
              },
              {
                name: "email",
                label: "Work Email",
                type: "email",
                placeholder: "you@company.com",
                autoComplete: "email",
              },
              {
                name: "phone",
                label: "Phone Number",
                type: "tel",
                placeholder: "Enter your phone number",
                autoComplete: "tel",
              },
              {
                name: "password",
                label: "Password",
                type: showPassword ? "text" : "password",
                placeholder: "Enter strong password",
                autoComplete: "new-password",
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
              {
                name: "confirmPassword",
                label: "Confirm Password",
                type: "password",
                placeholder: "Re-enter your password",
                autoComplete: "new-password",
              },
            ]}
          />

          <p className="auth-switch">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("/login")}>
              log in 
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
