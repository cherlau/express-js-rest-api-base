import db from '../database/connection.js'

const TABLE = 'users'

const User = {
  findAll: () => db(TABLE).select('id', 'name', 'email', 'created_at'),
  findById: (id) => db(TABLE).select('id', 'name', 'email', 'created_at').where({ id }).first(),
  findByEmail: (email) => db(TABLE).where({ email }).first(),
  create: (data) => db(TABLE).insert(data),
  update: (id, data) => db(TABLE).where({ id }).update({ ...data, updated_at: new Date() }),
  remove: (id) => db(TABLE).where({ id }).delete(),
}

export default User
