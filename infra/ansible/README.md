# Ansible — Configuration Management

## Ce qui est en place

### Fichiers

```
ansible/
├── inventory.ini          # Serveurs cibles (à remplir avec votre IP)
├── playbook.yml           # Playbook principal de déploiement
├── vars/
│   └── app.yml            # Variables de l'application
└── templates/
    └── env.j2             # Template Jinja2 pour générer le .env
```

### Ce que fait le playbook

| Étape | Tag | Action |
|-------|-----|--------|
| Prérequis système | `setup` | apt update, git, curl, ca-certificates |
| Installation Docker | `docker` | Docker Engine + Compose Plugin |
| Récupération du code | `deploy` | git clone / pull depuis GitHub |
| Configuration | `config` | génération du `.env` via template Jinja2 |
| Déploiement | `deploy` | `docker compose up -d --build` |
| Vérification | `verify` | `docker compose ps` |

## Utilisation

```bash
# Prérequis : Ansible installé localement
pip install ansible

# 1. Remplir l'inventaire
nano inventory.ini
# → remplacer YOUR_SERVER_IP par l'IP de votre serveur

# 2. Remplir les variables (et changer les secrets !)
nano vars/app.yml

# 3. Tester la connectivité
ansible all -i inventory.ini -m ping

# 4. Déploiement complet
ansible-playbook -i inventory.ini playbook.yml

# 5. Redéploiement seul (sans re-setup Docker)
ansible-playbook -i inventory.ini playbook.yml --tags deploy
```

## Sécuriser les secrets avec Vault

```bash
# Chiffrer le fichier de variables
ansible-vault encrypt vars/app.yml

# Lancer le playbook avec le vault
ansible-playbook -i inventory.ini playbook.yml --ask-vault-pass
```
