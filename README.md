# md-checklist

Une checklist Markdown en un seul fichier HTML. Tu écris du Markdown, tu coches
des cases, et l’état est conservé dans un Gist GitHub secret, sans backend ni
build.

Ouvre `checklist.html` dans un navigateur. L’interface est disponible en
français et en anglais.

## Déploiement sur Vercel

Le dépôt est prêt à être publié comme site statique : importe-le dans Vercel,
choisis **Other** comme framework et laisse les commandes de build ainsi que le
répertoire de sortie vides. `vercel.json` sert `checklist.html` à la racine.

## Comment ça marche

- Le propriétaire saisit un token GitHub autorisé à gérer les Gists. L’app crée
  un Gist secret contenant `md-checklist.json`.
- Le Markdown complet, cases cochées comprises, est envoyé au Gist deux secondes
  après chaque modification.
- Le lien de partage contient uniquement l’identifiant du Gist et ouvre la
  checklist en lecture seule. Il rafraîchit les données toutes les 30 secondes
  lorsque l’onglet est visible.
- L’écriture reste réservée au navigateur du propriétaire, qui conserve le
  token localement.
- `localStorage` conserve uniquement la configuration locale — identifiant du
  Gist, token et langue — jamais la checklist elle-même.

Une erreur réseau n’empêche jamais le propriétaire de continuer à modifier la
checklist ; la sauvegarde peut être relancée manuellement.

## Pourquoi

La liste reste écrite en Markdown, mais devient directement exécutable et
partageable sans compte applicatif ni serveur dédié. Le Gist est la source de
vérité : le lien indique où le trouver au lieu d’embarquer une copie figée de
son contenu.

## Design et grammaire

L’interface utilise un gris papier froid, une encre marine et un accent
bleu-vert réservé à la complétion et au focus. La grammaire Markdown reste
volontairement petite : titres ATX, tâches, puces simples, `code`, **gras** et
liens, avec une imbrication par deux espaces.

## Sécurité du token

Le token n’est jamais inclus dans le Gist, les liens de partage, le DOM, les
logs ou les erreurs. Il est stocké en clair dans `localStorage` uniquement sur
le navigateur du propriétaire. Préfère un token dédié et révocable, limité aux
Gists.

## Limitations connues

- **Un seul rédacteur.** Le partage est toujours en lecture seule.
- **Pas d’export `.md`.** Copier le texte depuis la vue édition reste possible.
- **Réseau requis.** Le fichier s’ouvre depuis `file://`, mais lire ou écrire le
  Gist nécessite un accès à l’API GitHub.

## Contraintes

Fichier unique, zéro dépendance, pas de build et pas de CDN. `fetch` est utilisé
uniquement pour l’API GitHub Gist. Les accès à `localStorage` restent protégés
par un fallback mémoire lorsqu’ils échouent.

## Licence

Pas encore définie.
