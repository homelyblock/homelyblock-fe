type AuthStatusProps = {
  status: "idle" | "error" | "success";
  message?: string;
};

export function AuthStatus({ status, message }: AuthStatusProps) {
  if (status === "idle" || !message) {
    return null;
  }

  const tone =
    status === "error"
      ? "border-destructive/25 border-l-destructive bg-destructive/10 text-destructive"
      : "border-success/30 border-l-success bg-success/10 text-success";

  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={`rounded-xl border border-l-4 px-4 py-3 text-sm leading-6 ${tone}`}
    >
      {message}
    </p>
  );
}
