# Ansible - Configuration Management

## Description
Playbooks Ansible pour la configuration et le déploiement automatisé de l'application.

## Objectifs
- Configuration des serveurs
- Installation des dépendances
- Déploiement de l'application
- Configuration des services (nginx, bases de données...)
- Gestion des utilisateurs et permissions

## Structure prévue

```
ansible/
├── inventory/
│   ├── dev
│   ├── test
│   └── prod
├── playbooks/
│   ├── setup-servers.yml
│   ├── deploy-app.yml
│   ├── configure-db.yml
│   └── monitoring.yml
├── roles/
│   ├── common/
│   ├── docker/
│   ├── nginx/
│   └── monitoring/
├── group_vars/
│   ├── all.yml
│   ├── webservers.yml
│   └── databases.yml
└── ansible.cfg
```

## Playbooks prévus

### setup-servers.yml
- Installation des paquets système
- Configuration SSH
- Installation Docker
- Sécurisation serveur (firewall, fail2ban...)

### deploy-app.yml
- Pull des images Docker
- Déploiement des conteneurs
- Configuration nginx reverse proxy
- Certificats SSL

### configure-db.yml
- Installation et configuration bases de données
- Création des utilisateurs
- Import des schémas

### monitoring.yml
- Installation Prometheus
- Installation Grafana
- Configuration des exporters

## Utilisation

```bash
# Vérifier la connectivité
ansible all -i inventory/prod -m ping

# Exécuter un playbook
ansible-playbook -i inventory/prod playbooks/setup-servers.yml

# Dry-run
ansible-playbook -i inventory/prod playbooks/deploy-app.yml --check

# Avec variables supplémentaires
ansible-playbook -i inventory/prod playbooks/deploy-app.yml -e "version=1.2.0"
```

## Bonnes pratiques
- Utiliser des rôles réutilisables
- Vault pour les secrets : `ansible-vault encrypt`
- Tags pour exécution sélective
- Handlers pour les services
- Tests avec Molecule

## À développer
- [ ] Inventaires par environnement
- [ ] Playbook de setup serveurs
- [ ] Playbook de déploiement
- [ ] Rôles réutilisables
- [ ] Ansible Vault pour les secrets
- [ ] Tests et validation
