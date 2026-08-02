# md-checklist

Une checklist Markdown en un seul fichier HTML. Tu écris du Markdown, tu coches
des cases, et l'état te suit sans compte, sans serveur, sans build.

Ouvre `checklist.html` dans un navigateur. C'est tout.

## Pourquoi

Un besoin banal : une checklist de dépannage réseau (points d'accès UniFi),
lancée une fois tous les quelques mois, dont la liste elle-même change au fil
du temps. Chaque option existante avait le même défaut — soit un compte et un
abonnement pour une liste de douze lignes, soit un fichier Markdown statique
où les cases à cocher ne cochent pas vraiment.

- La liste est **écrite en Markdown**, parce que c'est ce qui se colle dans
  des notes, des wikis, des messages de commit.
- La liste est **exécutable** : cocher une case est une vraie interaction qui
  survit à un rechargement de page.
- Une session peut être **transmise à quelqu'un d'autre, ou à soi-même plus
  tard**, comme un simple lien, sans infrastructure derrière.
- Rien ne quitte la machine.

Non-objectifs : pas de collaboration, pas de synchronisation temps réel, pas
de rappels, pas de dates d'échéance, pas d'app mobile, pas de comptes.

## Comment ça marche

- **`localStorage`** est la mémoire principale, écrite à chaque coche.
- **Le fragment d'URL** (`#c=...`) est l'export : une encodage base64url de la
  source Markdown complète, cases cochées comprises. Utile pour archiver une
  session terminée ou envoyer un lien à quelqu'un.
- Une **empreinte** (FNV-1a sur le texte des tâches, sans les marqueurs
  `[ ]`/`[x]`) identifie deux versions d'une même liste, pour que rouvrir un
  vieux lien retrouve la progression locale au lieu de créer un doublon.
- En cas de conflit (lien entrant différent du stocké), rien n'est écrasé
  silencieusement : les deux versions sont proposées à l'utilisateur.

Détails complets de conception dans [`CLAUDE.md`](./CLAUDE.md).

## Contraintes

Fichier unique, zéro dépendance, pas de build. Fonctionne hors-ligne et depuis
`file://`. Pas de CDN, pas de fetch. Dégrade proprement si `localStorage` est
indisponible (iframe sandboxée, navigation privée).

## Licence

Pas encore définie.
