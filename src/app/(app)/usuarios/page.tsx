import { getUserList } from "@/lib/queries/users";
import { UsersTable } from "@/components/users/users-table";
import { NewUserButton } from "@/components/users/new-user-button";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const users = await getUserList();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cadastre quem pode entrar com e-mail e senha e acompanhe o uso da ferramenta.
          </p>
        </div>
        <NewUserButton />
      </div>

      <UsersTable users={users} />
    </div>
  );
}
