
export default function Form({
  fields = [],
  onSubmit,
  submitText = "Submit",
  className = "",
  children,
  register,
  errors = {},
}) {
  return (
    <form className={className} onSubmit={onSubmit} noValidate>
      {fields.map((field) => (
        <div className="form-field" key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>

          <div className={field.inputWrapperClass || ""}>
            <input
              id={field.name}
              type={field.type || "text"}
              placeholder={field.placeholder || ""}
              autoComplete={field.autoComplete}
              aria-invalid={Boolean(errors[field.name])}
              {...register(field.name)}
            />
            {field.suffix}
          </div>

          {errors[field.name] && (
            <p className="field-error">{errors[field.name].message}</p>
          )}
        </div>
      ))}

      {children}

      <button type="submit" className="auth-submit">
        {submitText} <span>→</span>
      </button>
    </form>
  );
}
