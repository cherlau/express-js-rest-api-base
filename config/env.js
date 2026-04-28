const REQUIRED = [
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
]

export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error(`[ERRO] Variáveis de ambiente obrigatórias não definidas: ${missing.join(', ')}`)
    console.error('Copie o arquivo .env.example para .env e preencha os valores.')
    process.exit(1)
  }
}
