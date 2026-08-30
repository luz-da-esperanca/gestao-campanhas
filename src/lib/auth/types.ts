export type UserRole = "admin" | "caravaneiro" | "visitante";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type CampanhaStatus = "PLANEJADA" | "ATIVA" | "ENCERRADA";
export type CampanhaTipo = "DISTRIBUICAO" | "COLETA" | "ESPECIAL";
