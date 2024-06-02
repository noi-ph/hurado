### Database Commands

If you're here, you might be looking to contribute. Here's some very helpful commands for devs:

```bash
npm run db:migrate  # Run all the migrations up to the latest one.

npm run db:seed     # Run all the seed scripts. Run this after migrating.

npm run db:reset    # Drop all the tables and start over.
                    # You almost always want to run db:migrate after this.

npm run db:sql      # Connect to the postgresql docker server to run raw SQL
```
