'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Accueil',
    'state': 'main'
  },{
    title: 'Bibliothèque',
    state: 'bibliotheque'
  },{
    title: 'Dessin',
    state: 'pageDessin'
  }
  ];

  isCollapsed = true;
  compoCollapsed = true;
  effetCollapsed = true;

  //end-non-standard

  constructor(Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
  }
}

angular.module('pedaleswitchApp')
  .controller('NavbarController', NavbarController);
