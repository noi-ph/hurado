import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('tasks', (table) => {
        table.uuid('id')
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'))
        table.text('slug')
            .notNullable()
            .unique()
        table.text('title')
            .notNullable()
        table.text('description')
        table.text('statement')
            .notNullable()
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('tasks')
}
