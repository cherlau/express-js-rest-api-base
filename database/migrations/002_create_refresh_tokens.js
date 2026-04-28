export const up = (knex) =>
  knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary()
    table.integer('user_id').unsigned().notNullable()
    table.foreign('user_id').references('users.id').onDelete('CASCADE')
    table.text('token').notNullable()
    table.timestamp('expires_at').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

export const down = (knex) => knex.schema.dropTable('refresh_tokens')
