import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', (table) => {
        table.uuid('id')
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'))
        table.text('email')
            .notNullable()
            .unique()
        table.text('username')
            .notNullable()
            .unique()
        table.text('hashed_password')
            .notNullable()
        table.timestamp('created_at')
            .defaultTo(knex.fn.now())
        // TODO: Implement user roles (e.g., admin, user, etc.)
        table.text('school')
        table.text('name')
        // TODO: Implement user country (default to PH)
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('users')
}
