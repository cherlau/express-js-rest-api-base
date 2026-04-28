import db from '../database/connection.js'

const TABLE = 'refresh_tokens'

const RefreshToken = {
  create: (data) => db(TABLE).insert(data),
  findByToken: (token) => db(TABLE).where({ token }).first(),
  deleteByToken: (token) => db(TABLE).where({ token }).delete(),
  deleteByUserId: (user_id) => db(TABLE).where({ user_id }).delete(),
  deleteExpired: () => db(TABLE).where('expires_at', '<', new Date()).delete(),
}

export default RefreshToken
