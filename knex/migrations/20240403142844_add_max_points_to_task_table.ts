import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('tasks', function (table) {
        table.decimal('max_points', 5, 5)
            .notNullable()
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('tasks', function (table) {
        table.dropColumn('max_points')
    });
}
