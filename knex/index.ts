import type { Knex } from 'knex'

import createKnex from 'knex'

import config from './knexfile'

const knex: Knex = createKnex(config.development)

export default knex
