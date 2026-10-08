import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="SignIn | Sistem Tracer Study"
        description="SignIn Tables Dashboard - Sistem Tracer Study"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
