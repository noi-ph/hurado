#!/bin/bash

script_directory="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$script_directory"

alias_line="alias hurado=$script_directory/hurado.sh"
bashrc=~/.bashrc

function initialize_project {
    echo 'Initializing project...'

    echo 'Adding "hurado" alias to "~/.bashrc"...'
    echo "$alias_line" >> "$bashrc"
    chmod +x "$script_directory/hurado.sh"
    source ~/.bashrc
    echo '"hurado" alias has been initialized.'
    echo 'You may now use "hurado" to run the script.'

    echo 'Creating pre-commit hook...'
    cp ./.git/hooks/pre-commit.sample ./.git/hooks/pre-commit
    ln -s .git/hooks/pre-commit pre-commit
}

grep -xqF -- "$alias_line" "$bashrc" || initialize_project

if [[ $# -eq 0 ]] || [[ $1 == 'help' ]]; then
    echo "Usage 1: hurado [command]"
    echo "Commands:"
    echo "    help....Show this help message"
    echo "    sql.....Open database psql shell"
    echo "    down....Stop all containers"
    echo "Usage 2: hurado [profile] [command]"
    echo "Profiles:"
    echo "    frontend..........Frontend server"
    echo "    backend...........Backend and database server"
    echo "General Commands:"
    echo "    dev-up............Start profile in development mode"
    echo "    lint..............Run formatter and linter"
    echo "    bash..............Open bash shell"
    echo "Backend-specific Commands:"
    echo "    migration-generate [date in yyyy-mm-dd]..........Generate a new migration"
    echo "    migration-run....................................Run all migrations"
    echo "    migration-revert.................................Revert the last migration"
    echo "    seed [file-name].................................Seed the database in accordance to the specified file"
    echo "    openapi-generate.................................Generate OpenAPI specification"
elif [[ $1 == 'sql' ]]; then
    docker exec -it hurado_db_1 psql -U noi.ph hurado
elif [[ $1 == 'down' ]]; then
    docker-compose -f docker-compose.dev.yml down
elif [[ $1 == 'frontend' ]] || [[ $1 == 'backend' ]]; then
    if [[ $# -eq 1 ]] || [[ $2 == 'dev-up' ]]; then
        if [[ $1 == 'frontend' ]]; then
            docker-compose -f docker-compose.dev.yml --profile frontend up
        elif [[ $1 == 'backend' ]]; then
            docker-compose -f docker-compose.dev.yml --profile backend up
        fi
    elif [[ $2 == 'lint' ]]; then
        if [[ $1 == 'frontend' ]]; then
            docker exec -it hurado_client_1 npx prettier --write /app/src/
            docker exec -it hurado_client_1 npx eslint --ext .js,.jsx,.ts,.tsx /app/src/ --fix
        elif [[ $1 == 'backend' ]]; then
            docker exec -it hurado_server_1 npx prettier --write /app/src/
            docker exec -it hurado_server_1 npx eslint --ext .js,.jsx,.ts /app/src/ --fix
        fi
    elif [[ $2 == 'bash' ]]; then
        if [[ $1 == 'frontend' ]]; then
            docker exec -it hurado_client_1 bash
        elif [[ $1 == 'backend' ]]; then
            docker exec -it hurado_server_1 bash
        fi
    elif [[ $1 == 'backend' ]]; then
        if [[ $2 == 'migration-generate' ]]; then
            docker exec -it hurado_server_1 npx ts-node ./node_modules/.bin/typeorm migration:generate ./src/orm/migrations/migration-$3 --pretty --dataSource ./src/orm/data-source.ts
        elif [[ $2 == 'migration-run' ]]; then
            docker exec -it hurado_server_1 npx ts-node ./node_modules/typeorm/cli.js migration:run --dataSource ./src/orm/data-source.ts
        elif [[ $2 == 'migration-revert' ]]; then
            docker exec -it hurado_server_1 npx ts-node ./node_modules/typeorm/cli.js migration:revert --dataSource ./src/orm/data-source.ts
        elif [[ $2 == 'seed' ]]; then
            docker exec -it hurado_server_1 npx ts-node ./src/orm/seeds/$3.ts
        elif [[ $2 == 'openapi-generate' ]]; then
            docker exec -it hurado_server_1 sh scripts/generate-openapi.sh
            cp "web-server/src/types/openapi-generated.ts" "web-client/src/types/openapi-generated.ts"
        fi
    fi
fi
