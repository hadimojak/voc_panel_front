import AuthLayout from "../components/layout/AuthLayout";
import LoginForm from "../components/auth/LoginForm";

type LoginPageProps = {
  onLogin: (username: string, password: string) => Promise<void>;
  error?: string;
  loading?: boolean;
};

export default function LoginPage({
  onLogin,
  error,
  loading,
}: LoginPageProps) {
  return (
    <AuthLayout
      title="VOC Control Panel"
      subtitle="Secure administrative access for authorized users only."
    >
      <LoginForm onSubmit={onLogin} error={error} loading={loading} />
    </AuthLayout>
  );
}
