'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Home',
    'state': 'main'
  },{
    title: 'Composants',
    state: 'composants'
  },{
    title: 'Effets',
    state: 'effets'
  },{
    title: 'RemplirDb',
    state: 'random'
  },{
    title: 'Bibliothèque',
    state: 'bibliotheque'
  },{
    title: 'Dessin',
    state: 'pageDessin'
  }
  ];

  isCollapsed = true;
  //end-non-standard

  constructor(Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
  }
}

angular.module('pedaleswitchApp')
  .controller('NavbarController', NavbarController);
