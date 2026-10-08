import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="SignUp | Sistem Tracer Study"
        description="SignUp Tables Dashboard - Sistem Tracer Study"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
