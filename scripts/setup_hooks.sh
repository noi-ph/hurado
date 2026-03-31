#!/bin/bash
if [ -z "$1" ]; then
    echo "Error: Missing bare repository directory parameter."
    echo "Usage: $0 <path_to_bare_repo>"
    exit 1
fi

BARE_REPO_DIR="$1"
WORK_TREE=$(pwd)

if [ -d "$BARE_REPO_DIR" ]; then
    read -p "Directory '$BARE_REPO_DIR' already exists. Delete it? (y/N): " confirm

    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        rm -rf "$BARE_REPO_DIR"
        echo "Deleted '$BARE_REPO_DIR'."
    else
        echo "Setup aborted. Existing directory was kept."
        exit 1
    fi
fi

git init --bare "$BARE_REPO_DIR"

HOOK_FILE="$BARE_REPO_DIR/hooks/post-receive"
cat > "$HOOK_FILE" <<EOL
#!/bin/bash
set -e

#https://stackoverflow.com/questions/32910661/pretend-to-be-a-tty-in-bash-for-any-command
faketty () {
    script -qefc "\$(printf "%q " "\$@")" /dev/null
}

while read oldrev newrev refname; do
    if [[ "\$refname" == refs/heads/* ]]; then
        BRANCH="\${refname#refs/heads/}"
        PWD=\$(pwd)
        unset GIT_DIR

        # this assumes the work tree already exists
        set +e
        cd $WORK_TREE
        faketty ./scripts/hrd.sh compose stop
        set -e

        cd \$PWD
        GIT_WORK_TREE="$WORK_TREE" git checkout -f "\$BRANCH"

        cd $WORK_TREE
        faketty ./scripts/hrd.sh deploy_server | cat
    fi
done
EOL

chmod +x $HOOK_FILE
