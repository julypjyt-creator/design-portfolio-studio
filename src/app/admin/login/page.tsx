import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params?.next || "/admin";

  return (
    <main className="container-wrap flex min-h-[78vh] items-center justify-center py-16">
      <section className="panel w-full max-w-md p-7">
        <h1 className="text-2xl font-semibold text-ink">后台登录</h1>
        <p className="mt-2 text-sm text-stone">请输入管理员账号和密码后进入后台。</p>

        <AdminLoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
