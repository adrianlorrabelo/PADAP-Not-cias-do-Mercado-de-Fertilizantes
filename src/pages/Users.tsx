import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import { mockUsers } from "../data/mockUsers";
import { formatDateTime } from "../utils/date";

export default function Users() {
  return (
    <div>
      <div className="page-title"><h1>Usuários</h1><p>Área exclusiva para Administrador Geral criar usuários, alterar perfis, desativar acesso e auditar histórico.</p></div>
      <div className="mb-6 flex justify-end"><Button>Criar usuário</Button></div>
      <Table headers={["Nome", "E-mail", "Cargo", "Perfil", "Status", "Último acesso", "Ações"]} rows={mockUsers.map((u) => [u.name, u.email, u.position, u.role, <Badge tone={u.status === "Ativo" ? "green" : "red"}>{u.status}</Badge>, formatDateTime(u.lastAccess), <div className="flex gap-2"><Button variant="ghost">Editar</Button><Button variant="amber">Redefinir senha</Button><Button variant="danger">Desativar</Button></div>])} />
    </div>
  );
}
