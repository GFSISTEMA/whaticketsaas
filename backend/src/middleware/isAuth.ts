import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";

// Interface para o Payload do Token
interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

// Middleware de Autenticação
const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Verifique se a URL da requisição corresponde à página inicial ou login
  // Pode ser uma rota pública que não necessita de autenticação
  if (req.path === '/' || req.path === '/login') {
    return next(); // Se for a página inicial ou de login, apenas prossiga sem verificar o token
  }

  // Verificar se o cabeçalho Authorization existe
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401); // Se não tiver o token, lançar erro de sessão expirada
  }

  const [, token] = authHeader.split(" "); // Extrair o token do cabeçalho

  try {
    // Tentar verificar e decodificar o token
    const decoded = verify(token, authConfig.secret);
    const { id, profile, companyId } = decoded as TokenPayload;
    req.user = {
      id,
      profile,
      companyId
    };
  } catch (err) {
    // Se o token for inválido ou expirado, lançar erro 403
    throw new AppError("Invalid token. We'll try to assign a new one on next request", 403);
  }

  return next(); // Se a verificação for bem-sucedida, prosseguir para a próxima função
};

export default isAuth;
