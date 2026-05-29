import { describe, expect, it } from "vitest";
import { mockCredentials, mockUsers } from "../data/mockUsers";

describe("mockUsers — estrutura de dados", () => {
  it("nenhum usuário contém campo 'password'", () => {
    for (const user of mockUsers) {
      expect(user).not.toHaveProperty("password");
    }
  });

  it("todos os usuários têm os campos obrigatórios", () => {
    for (const user of mockUsers) {
      expect(user.id).toBeTruthy();
      expect(user.name).toBeTruthy();
      expect(user.email).toBeTruthy();
      expect(user.role).toBeTruthy();
      expect(["Ativo", "Desativado"]).toContain(user.status);
    }
  });

  it("IDs são únicos", () => {
    const ids = mockUsers.map((u) => u.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("emails são únicos e em minúsculas", () => {
    const emails = mockUsers.map((u) => u.email);
    expect(emails.length).toBe(new Set(emails).size);
    emails.forEach((email) => expect(email).toBe(email.toLowerCase()));
  });
});

describe("mockCredentials — separação de responsabilidades", () => {
  it("credenciais existem para cada usuário ativo", () => {
    const activeUsers = mockUsers.filter((u) => u.status === "Ativo");
    for (const user of activeUsers) {
      expect(mockCredentials[user.email]).toBeTruthy();
    }
  });

  it("nenhuma credencial está vazia", () => {
    for (const [email, password] of Object.entries(mockCredentials)) {
      expect(email).toBeTruthy();
      expect(password.length).toBeGreaterThanOrEqual(6);
    }
  });

  it("credenciais são indexadas por email (lowercase)", () => {
    for (const key of Object.keys(mockCredentials)) {
      expect(key).toBe(key.toLowerCase());
    }
  });
});
