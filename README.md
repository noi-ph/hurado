# Hurado

NOI.PH's online judge

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

#### Setup PostgreSQL

We use PostgreSQL as our database management system (DMS). Kindly go to [this guide](https://www.postgresql.org/download/linux/) to install it in your Unix environment.

#### Setup NodeJS

We recommend using the latest stable release of NodeJS when running this application. Kindly go to [this guide](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) to configure which version of NodeJS runs in your environment.

Once NVM has been installed, run the following so that the latest stable release (LTS) of NodeJS is installed:

```bash
nvm install --lts
nvm use --lts
```

## Running the application

Go to the repository directory by running the following command:

```bash
cd hurado
```

Run the `run.sh` script as well by running:

```bash
./scripts/run start
```

## Contribution Workflow

1. Follow the above instructions regarding forking, cloning, and running this repository.
2. Add and commit your changes to the repository. Don't forget to add your name to the [contributors](#contributors) section below.
4. Submit a pull request (PR) and tag one of the contributors to review your code.
5. Wait for the review and address the comments.
6. Wait for the reviewer to approve your PR.
7. Merge your PR.

## Contributors

- Lead: [Payton Yao](https://github.com/jabbawookiees)
- [Franz Cesista](https://github.com/leloykun)
- [Cisco Ortega](https://github.com/gfmortega)
- [Neomi Mendoza](https://github.com/nimendoza)
- [Kian Chua](https://github.com/Quantum-K9)
- [Troy Serapio](https://github.com/tdserapio)
- [Angelu Garcia](https://github.com/devByGelu)
- [The Boy (alias)](https://github.com/RedBlazerFlame)
- [Davis Magpantay](https://github.com/dexva)
