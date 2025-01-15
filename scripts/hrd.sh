#!/bin/bash
# Simple bash script that provides a few utilities for managing Hurado development/deployment

PROJECT_ROOT=$(cd `dirname "$0"` && git rev-parse --show-toplevel)
HRD_CMD=$PROJECT_ROOT/scripts/hrd.sh


function hrd_install() {
    # Installs a new command `hrd` which is an alias to this script into the user's ~/.bashrc
    script_path=$(realpath "$0")
    script_dir=$(dirname "$script_path")
    shell_profile="$HOME/.bashrc"
    if ! grep -q "alias hrd=" $shell_profile; then
        echo "alias hrd='$script_dir/hrd.sh'" >> $shell_profile
        echo "Alias created for new command \`hrd\`. Open a new shell to apply changes."
    else
        echo "Alias already exists"
    fi
}

function hrd_shell() {
    # Runs a bash shell inside the main webapp container
    cd $PROJECT_ROOT
    if [ -z "$1" ]; then
        docker exec -it hurado-main bash
    else
        docker exec -it hurado-main $@
    fi
}

function hrd_sql() {
    # Runs psql inside the postgresql container
    cd $PROJECT_ROOT
    docker exec -it hurado-postgres sh -c 'PGPASSWORD=$POSTGRES_PASSWORD psql -U $POSTGRES_USER $POSTGRES_DB'
}

function hrd_compose() {
    cd $PROJECT_ROOT
    
    if [ -z "$HURADO_ENV" ]; then
        COMPOSE_FILE=./docker-compose.yml
    elif [ $HURADO_ENV == "production" ]; then
        COMPOSE_FILE=config/production/docker-compose.production.yml
    elif [ $HURADO_ENV == "staging" ]; then
        COMPOSE_FILE=config/staging/docker-compose.staging.yml
    else
        COMPOSE_FILE=./docker-compose.yml
    fi

    docker compose \
        --project-directory . \
        -f $COMPOSE_FILE \
        $@
}

function hrd_connect() {
    if [ -z "$1" ]; then
        echo "Usage: hrd connect [production]"
        return 1
    fi

    case "$1" in
        production)
            HOSTNAME="production.practice.noi.ph"
            ;;
        *)
            echo "Unknown server: $1"
            return 1
            ;;
    esac

    if [ -z "$2" ]; then
        ssh -t root@$HOSTNAME "cd /hurado; exec \$SHELL"
    else
        shift
        ssh -t root@$HOSTNAME $@
    fi
}

function hrd_deploy() {
    # Client-side script to deploy the latest changes to the staging or production server
    # This does not actually do anything, but rather just connects to the server and runs the deploy_server command

    # This does a full deploy to the staging or production server
    # This assumes that the .env file is already set up on the respective server
    # and no new dependencies are needed to be installed (i.e. no need to rebuild the docker image)
    # If you need to do any of those, you'll want to do it manually by doing the following:
    #
    # git push origin main
    # hrd connect production
    # git pull --ff-only origin main
    # ./tools/docker_build.sh
    # vim .env
    # hrd restart
    #
    # Pre-requisites for this command:
    # You need to add something like the following to your ~/.ssh/config file:
    #
    # Host production.practice.noi.ph
    #   HostName production.practice.noi.ph
    #   User root
    #   IdentityFile ~/.ssh/my_ssh_key
    #   IdentitiesOnly yes
    #
    # Host staging.practice.noi.ph
    #   HostName staging.practice.noi.ph
    #   User root
    #   IdentityFile ~/.ssh/my_ssh_key
    #   IdentitiesOnly yes
    #
    #
    # Then you need to add the following to your /etc/hosts file:
    # Get the actual IP address from someone else, the DNS configuration, or the VPS provider
    #
    # 123.123.123.123  production.practice.noi.ph
    #

    if [ -z "$1" ]; then
        echo "Usage: hrd deploy [staging|production]"
        return 1
    fi

    read -p "Are you sure you want to deploy to $1? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deploy aborted."
        return 1
    fi

    cd $PROJECT_ROOT

    case "$1" in
        production)
            $HRD_CMD connect production /hurado/scripts/hrd.sh deploy_server
            ;;
        *)
            echo "Unknown server: $1"
            return 1
            ;;
    esac
}

function hrd_deploy_server() {
    # Server-side script for deploying the latest changes to the production server
    set -e
    cd /hurado/
    git pull --ff-only origin main
    ./scripts/next_build.sh
    $HRD_CMD compose restart
    $HRD_CMD shell npm run db:migrate
}


function hrd_main() {
    case "$1" in
        install)
            shift
            hrd_install $@
            ;;
        compose)
            shift
            hrd_compose $@
            ;;
        shell)
            shift
            hrd_shell $@
            ;;
        sql)
            shift
            hrd_sql $@
            ;;
        connect)
            shift
            hrd_connect $@
            ;;
        deploy)
            shift
            hrd_deploy $@
            ;;
        deploy_server)
            shift
            hrd_deploy_server $@
            ;;
        *)
            echo "Usage: hrd {install|compose|shell|sql|connect|deploy}"
            echo "Subcommands:"
            echo "  install: Installs the hrd command"
            echo "  compose: Runs docker compose with the appropriate configuration file"
            echo "  shell: Opens a bash shell inside the main hurado container"
            echo "  sql: Opens a psql shell inside the postgresql container"
            echo "  connect: Connects to a remote server"
            echo "  deploy: Deploys the latest changes to the staging or production server"
            return 1
            ;;
    esac
}

hrd_main $@
