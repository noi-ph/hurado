# Hurado

NOI.PH's Online Judge

## Development

### Recommended computer specs

- RAM: 8GB or more
- CPU: Intel i3 or better

### Getting started

If you're using Windows, we recommend [using WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) to emulate a Unix environment. If you haven't yet, [set up your own SSH-key and add it to your SSH-agent](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).

#### Fork the repository

Fork the Hurado repository with the help of [this guide](https://docs.github.com/en/get-started/quickstart/fork-a-repo).

#### Clone your fork of the repository

Before cloning your fork of the repository, make sure that you have added your SSH-key to your SSH-agent. You can clone the repository by running the following command:

```bash
git clone git@github.com:your_username/hurado.git
```

### Installing dependencies

#### Setup Docker

We use docker containers for everything for local development. Follow instructions [here](https://docs.docker.com/engine/install/) to get a new version of docker.

#### Set up local environment variables

Go to the repository directory by running the following command:

```bash
cd hurado
```

Copy the local environment template:

```bash
cp .env.template .env
```

This file is not included in the git history because it often contains temporary local changes and/or sensitive secrets like API keys. The template only contains non-sensitive placeholders, but it should work just fine.

#### Compiling the Hurado Docker Image

Run the following command to compile the `hurado` docker image.

```bash
./scripts/docker_build.sh
```

This isn't hosted on Dockerhub because of money. It's a quick compile anyway that you only need to run once when you first set up.

#### Installing Node Modules

Run this command to install the node modules

```bash
scripts/local/npm_ci.sh
```

### Running the server

#### Running the compose file

At this point, everything should be ready for your first run.

With the root directory of this repository as the current working directory, run the following command:

```bash
docker compose up
```

This runs all the docker containers. The databases and storage services wouldn't have been fully set up yet, so we need to run a few more commands. Open a new terminal tab, but don't close this one so that the docker containers can print their debugging messages to this one.

#### Accessing the main container shell

Once the docker containers are running, you'll need to run some commands from within the main container. It's recommended to run these inside to avoid system versioning issues and have access to any necessary environment variables.

```bash
docker exec -it hurado-main bash
```

This should get you an interactive bash shell inside the main hurado container. You can press Ctrl+D to leave this shell later or type `exit` but don't do that for now.

You'll know that you did it right if you see a prompt
that looks roughly like:

```bash
root@e51ecd113338:/app# 
```

#### Setting up databases and storage

Inside the docker bash shell, run the following commands:

```bash
# Set up the local file upload storage called Minio
npm run storage:init

# Set up the local database with tables and fake data
npm run db:reset
```

After you do this, you should finally be able to visit http://localhost:10000 and see a working page after it finishes loadng.

That's all you need to do. As long as the `docker compose up` is running, all the servers and processes should automatically reload whenever you make changes to the code.

### Setting up `hrd` convenience script

There's a utility bash script for common purposes called `hrd.sh`. We recommend setting up an alias to it because it's so helpful.

On Linux if you use bash as your default shell, you can run the following command to set up such an alias in your `~/.bashrc`

```bash
./scripts/hrd.sh install
```

Otherwise, you can set up your own alias or just manally replace every instance of `hrd` in this README with `./scripts/hrd.sh`

If you choose to install the alias, open a new terminal to load your new `.bashrc` file or just run `source ~/.bashrc`.

#### Running the server with hrd

This is how you run the server:

```bash
hrd compose up
```

You can also pass anything else you normally pass to `docker compose` to `hrd compose`. The only difference is that you can do it from anywhere on your computer instead of just the root directory of this project.

#### Bash shell in main container

To get an interactive bash shell inside the main container, you can run this command

```bash
hrd shell
```

If you just need to run one command, you can just add that to the command

```bash
hrd shell npm ci
```

#### SQL Interactive Terminal

To get an interactive SQL terminal, you can run

```bash
hrd sql
```

### NPM scripts inside main container

There are other commands aside from `db:reset` and `storage:init` that you can run from inside the hurado main container.

Run all the migrations:

```bash
npm run db:migrate
```

Seed some initial data:

```bash
npm run db:seed
```

Drop all the existing tables

```bash
npm run db:recreate
```

`db:reset` is actually just shorthand for all of these (recreate -> migrate -> seed).


## Deployment

### Connecting to Production

To connect to the production server you just need to run the following:

```bash
hrd connect production
```

Before this, you'll need to add an entry to `production.practice.noi.ph` to your `/etc/hosts` as well as set up your SSH config to use the correct SSH key for this server.

### Server configuration

Server configuration is just in `./config/production`. A correct `.env` file is all you need and `hrd compose up` will work just as well as locally on production.

### Building the code and deploying

You just need to run `./scripts/next_build.sh` to recompile everything and put all the files in the right place. Then a quick `hrd compose restart` should restart the servers and a `hrd shell npm run db:migrate` might be the only other thing you need.

All of these are done by `hrd deploy_server` from the server or `hrd deploy` from your local machine (which just connects and runs `hrd deploy_server`).

That's about it for deployment notes.

## Contribution Workflow

1. Follow the above instructions regarding forking, cloning, and running this repository.
2. Read the [contributor's guide](contributor-guide.md) for useful tips to improve your experience
3. Add and commit your changes to the repository. Don't forget to add your name to the [contributors](#contributors) section below.
4. Submit a pull request (PR) and tag one of the contributors to review your code.
5. Wait for the review and address the comments.
6. Wait for the reviewer to approve your PR.
7. Merge your PR.

## Core Contributors

- [Payton Yao](https://github.com/jabbawookiees)
- [Cisco Ortega](https://github.com/gfmortega)
- [Neomi Mendoza](https://github.com/nimendoza)
