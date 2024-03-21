import { Knex } from 'knex'
import { hashSync } from 'bcryptjs'

const hash = (password: string) => hashSync(password, 10)
 
export async function seed(knex: Knex): Promise<void> {
    await knex('users').insert([{
        email: 'user-4b018dd0-8316@mailinator.com',
        username: 'user-4b018dd0-8316',
        hashed_password: hash('password'),
        school: 'University of the Philippines - Diliman',
        name: 'User 4b018dd0-8316',
    }])
}
