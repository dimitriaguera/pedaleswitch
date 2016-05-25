'use strict';

angular.module('pedaleswitchApp')
  .factory('mousehelper', function (canvasitem, checkCollision) {

    var mousehelper = function(doc, canvas) {
      mousehelper.doc = doc;
      mousehelper.canvas = canvas;
      mousehelper.context = this.canvas.getContext("2d");
      mousehelper.dragIdx = -1;
      mousehelper.dragOffsetX = 0;
      mousehelper.dragOffsetY = 0;
    };

    mousehelper.update = function (handle) {
      mousehelper.doc.body.style.cursor = handle;
    };

    mousehelper.mousedown = function (e) {
      var mouseX = e.layerX, //- mousehelper.canvas.offsetLeft,
          mouseY = e.layerY; //- mousehelper.canvas.offsetTop;

      var dragid = checkCollision.checkmousebox({x: mouseX, y: mouseY}, canvasitem.tab, 10);
      
      if (dragid !== false) {
        mousehelper.dragIdx = dragid.id;
        mousehelper.dragOffsetX = dragid.dx;
        mousehelper.dragOffsetY = dragid.dy;
        canvasitem.tab[mousehelper.dragIdx].setSelected(true);
        mousehelper.canvas.addEventListener("mousemove", mousehelper.mousemove);
        mousehelper.canvas.addEventListener("mouseup", mousehelper.mouseup);
        mousehelper.update('move');
      }

    };

    mousehelper.mousemove = function (e) {
      var mouseX = e.layerX, //- mousehelper.canvas.offsetLeft,
          mouseY = e.layerY; //- mousehelper.canvas.offsetTop;

      canvasitem.tab[mousehelper.dragIdx].setCenterX(mouseX - mousehelper.dragOffsetX);
      canvasitem.tab[mousehelper.dragIdx].setCenterY(mouseY - mousehelper.dragOffsetY);
      checkCollision.checkall(canvasitem.tab);
      canvasitem.drawall();
    };


    mousehelper.mouseover = function (e) {
      mousehelper.canvas.addEventListener("mousemove", mousehelper.mousemovebox);
    };

    mousehelper.mousemovebox = function (e) {
      var mouseX = e.layerX, //- mousehelper.canvas.offsetLeft,
        mouseY = e.layerY; //- mousehelper.canvas.offsetTop;

      checkCollision.checkmousebox({x: mouseX, y: mouseY}, canvasitem.tab, 10);
      canvasitem.drawall();
    };

    mousehelper.mouseout = function (e) {
      mousehelper.canvas.removeEventListener("mousemove", mousehelper.mousemovebox);
    };
    
    
    mousehelper.mouseup = function (e) {
      var mouseX = e.layerX,// - mousehelper.canvas.offsetLeft,
          mouseY = e.layerY;// - mousehelper.canvas.offsetTop;

      mousehelper.canvas.removeEventListener("mousemove", mousehelper.mousemove);
      mousehelper.canvas.removeEventListener("mouseup", mousehelper.mouseup);


      canvasitem.tab[mousehelper.dragIdx].setCenterX(mouseX - mousehelper.dragOffsetX);
      canvasitem.tab[mousehelper.dragIdx].setCenterY(mouseY - mousehelper.dragOffsetY);

      canvasitem.tab[mousehelper.dragIdx].setSelected(false);
      mousehelper.update('default');


      checkCollision.checkall(canvasitem.tab);
      canvasitem.drawall();

      mousehelper.dragIdx = -1;
    };

    return mousehelper;
  });
