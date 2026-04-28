import db from '../database/connection.js'

const TABLE = 'users'

const User = {
  findAll: () => db(TABLE).select('*'),
  findById: (id) => db(TABLE).where({ id }).first(),
  create: (data) => db(TABLE).insert(data),
  update: (id, data) => db(TABLE).where({ id }).update(data),
  remove: (id) => db(TABLE).where({ id }).delete(),
}

export default User
