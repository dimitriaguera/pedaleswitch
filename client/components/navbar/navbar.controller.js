'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Home',
    'state': 'main'
  },{
    title: 'Composant',
    state: 'composant'
  },{
    title: 'Effets',
    state: 'addeffet'
  },{
    title: 'RemplirDb',
    state: 'random'
  },{
    title: 'Bibliothèque',
    state: 'bibliotheque'
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
