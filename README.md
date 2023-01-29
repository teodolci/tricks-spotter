# tricks-spotter

Cette application permet de voir des spots de skate dans la ville de Lausanne et de poster des clips de skate sur chacun de ces spots (comme une sorte de réseau social de vidéo de skate).

Un utilisateur peut visualiser soit sur une carte, soit sous forme de liste les différents spots présents sur l'app (Les spots peuvent être postés par un utilisateur admin). En cliquant sur un des spots, l'utilisateur peut apercevoir les détails du spot (nom, description, catégories, date de création) et une liste des différentes tricks qui ont été postés sous ce spot. En cliquant sur un tricks, une vidéo se lance avec le clip en question. De plus, l'utilisateur peut accéder à son profil et peut apercevoir la liste de tous les tricks qu'il a pu posté (sur tous les spots compris).

## Guide
Au lancement, l'utilisateur peut soit se connecter à un compte existant, soit créer un nouveau compte. Une fois un compte créé il est redirigé vers le Login.

### User Lambda
Un user connecté est dirigé sur la page des spots qui est une map qui contient:
- des marqueurs (les icônes sont les catégories des spots) de chaque spot à son emplacement, plus un marqueur qui représente la position de l'appareil de l'utilisateur.  
- En haut de la carte il y'a une barre de recherche dans laquelle l'utiliateur peut filtrer les spots par nom. La carte est dynamique et se met à jour avec les spots filtrés quand on quitte la barre de recherche. Si la barre est vide, tous les spots sont affichés.
- Dans le coin à droite de la carte, il y'a un bouton pour voir la liste de tous les spots. Dans la liste des spots, on peut cliquer sur le bouton d'info, qui ouvre les détail du spot sur lequel on a cliqué, avec les tricks postés par tous les utilisateurs sur ce spot en question. Les infos des listes sont paginées à 10 éléments, l'utilisateur peut cliquer sur le bouton "Plus" en bas des listes pour charger les 10 éléments suivants. Si tout est chargé, le bouton n'apparait pas.

Dans le menu de navigation, à gauche, on voit le bouton qui mène à la page qui permet de créer un tricks. C'est un formulaire dans lequel l'utilisateur doit remplir:
- Le spot où le tricks a été fait (c'est une liste avec tous les spots)
- Le nom du tricks
- Il peut prendre une vidéo, ou uploader une vidéo de la gallerie de l'appareil
(L'input de l'utilisateur qui poste le tricks est readonly et est l'username de l'utilisateur connecté actuellement)
Une fois le tricks créé, l'utilisateur est redirigé sur son profil, où il voit directement le tricks qu'il vient d'ajouter.

Le 3e menu, à droite, mène au profil de l'utilisateur, où il peut voir ses informations de profil (prénom, nom, pseudo). 
- Il peut modifier ces informations en cliquant sur le bouton en haut à gauche (formulaire avec prénom, nom, pseudo)
- Il y'a un bouton pour se déconnecter en haut à droite de l'écran
- Juste sous les informations du profil, il y'a la liste de tous les tricks postés. Elle est paginée à 10 éléments, si l'utilisateur souhaite en charger plus, il y'a un bouton "Plus" qui charge les 10 suivants.
- Dans chacune des cartes des tricks, l'utilisateur peut supprimer ou modifier le tricks.

### User Admin
L'admin la même chose que l'user Lambda, mais avec des fonctionnalités en plus.
- Dans le menu de navigation, tout à gauche, il a une page en plus pour poster un Spot (formulaire avec le nom, la description, les catégories, la position sur une carte, uploader une photo). Suite à un ajout, l'utilisateur est redirigé sur la carte principale et le nouveau marqueur est visible.
- Dans la page des spots, dans la liste des spots, l'admin a un bouton en plus dans le coin en bas à droite des cartes, il sert à supprimer un spot.
- Toujours dans la page des spots, dans les détails d'un spot, en haut à gauche de l'écran l'admin a un bouton qui sert à modifier un spot. De nouveau, c'est un formulaire (nom, description, catégories, position, photo)

### Global
Sur des évènements délicats, comme par exemple la suppression d'un élément, il y'a une fenètre d'alerte qui apparait au milieu de l'écran et qui demande validation à l'utilisateur (empêche de supprimer un élément sur un misclick).
Quand l'utilisateur ajoute, modifie ou supprime un élément, un petit message apparait en bas de l'écran qui signale que l'action a bien été effectuée.

## Problèmes rencontrés ou bugs
Nous avons mal organisé la fonctionnalité des photos avec qImg. Nous n'y avons pas accès sans le token et nous nous y sommes pris trop tard pour pouvoir le demander. Donc malheureusement la possibilité de poster des photos ou vidéo n'est pas complètement implémentée (Nous avons tout de même codé une partie de l'implémentation à l'aveugle, il reste à ajouter le token manquant).
Nous n'avons pas réussi à implémenter le fait qu'un click sur un marqueur de la map lance la modal avec les détails du spot clické. Nous n'avons pas compris cet aspect de Leaflet (On ne comprends pas ce qu'il est possible de faire avec .on("click"), funciton()), leaflet semblait nous empêcher de faire ce qu'on veut dans la fonction).