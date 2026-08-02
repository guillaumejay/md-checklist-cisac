# md-checklist

Une checklist Markdown en un seul fichier HTML. Tu écris du Markdown, tu coches
des cases, et l'état te suit sans compte, sans serveur, sans build.

Ouvre `checklist.html` dans un navigateur. C'est tout. L'interface est
disponible en français et en anglais (bouton en haut à droite de la barre
d'outils).

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
  silencieusement : les deux versions sont proposées à l'utilisateur. Rouvrir
  par erreur un lien vieux de deux semaines depuis un mail ne doit jamais
  effacer la progression du jour sans prévenir.

Une première version utilisait l'URL comme unique mémoire. C'était élégant et
faux : un lien capture l'état à l'instant où il a été copié, puis devient
obsolète pour toujours — l'inverse de ce qu'une checklist doit faire. L'URL est
restée, mais reléguée au rôle d'export.

Détails d'implémentation dans [`CLAUDE.md`](./CLAUDE.md) (destiné aux agents /
contributeurs qui modifient le code).

## Design

Instrument utilitaire, pas application de productivité. Gris papier froid,
encre marine, un seul accent bleu-vert pétrole réservé à la complétion et au
focus. Police à chasse fixe pour tout ce qui relève des métadonnées — compteurs,
libellés, boutons, lien d'export — et police système classique pour le texte
des tâches, qui est de la prose.

Les tâches de premier niveau sont numérotées, parce que ce sont en général des
procédures ordonnées où « étape 3 » se dit à voix haute ; les sous-tâches ne le
sont pas, ce sont des précisions plutôt que des étapes.

## Limitations connues

- **Doublons dans la bibliothèque.** Modifier le texte d'une tâche change son
  empreinte, donc une nouvelle entrée apparaît et l'ancienne reste. C'est
  voulu (rien n'est jamais perdu silencieusement), mais la bibliothèque se
  remplit si on itère souvent sur ses listes.
- **Listes longues, liens longs.** Correct jusqu'à environ 200 lignes. Un
  fichier de quarante lignes donne un lien d'environ 900 caractères ; largement
  dans les limites des navigateurs, mais ça grandit vite.
- **Pas d'export en `.md` brut.** Copier depuis la vue édition fonctionne ; pas
  de bouton de téléchargement pour l'instant.

## Contraintes

Fichier unique, zéro dépendance, pas de build. Fonctionne hors-ligne et depuis
`file://`. Pas de CDN, pas de fetch. Dégrade proprement si `localStorage` est
indisponible (iframe sandboxée, navigation privée).

## Licence

Pas encore définie.
