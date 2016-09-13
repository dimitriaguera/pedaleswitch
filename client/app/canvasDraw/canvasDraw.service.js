'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasDraw', function (canvasGlobalServ) {

    var canvasS = canvasGlobalServ.getCanvasS();
    var tables = canvasGlobalServ.getTables();
    var boite = canvasGlobalServ.getBoite();

    /*
    var canvasGlobal = canvasGlobalServ.getCanvasGlobal();
    var boite = null;
    var tableActive = [];
    var tableDrawDashed = [];
    var tableDrawThin = [];
    //var tableDrawShine = [];
    //var tableArrow = [];

    //@todo: table de travail, a supprimer.
    var tableDrawLimits = [];
    //Fin todo.
    */

    var selectDraw = function(context, item){
      if (item.isSelected) {
        context.font = '16px sans-serif';
        context.strokeStyle = '#00bfff';
        context.fillStyle = '#00bfff';
        //context.textAlign = 'center';
        //context.fillText(item.titre, item.getCenterX(), item.findExtreme().t - canvasConversion.convertToPixel(5));
        context.shadowColor   = '#666';
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.shadowBlur    = 2;
      }
    };
    //var overlappingDraw = function (context, item){
    //  if (item.isOverlapping) {
    //    context.fillStyle = 'rgba(255, 00, 00, 0.2)';
    //    context.fill();
    //  }
    //};

    return {

      drawTableDashed: function (context, colorStroke, colorFill, lineWidth, dashArray) {
        if(tables.tableDrawDashed.length !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          context.setLineDash(dashArray);
          for (var k = 0; k < tables.tableDrawDashed.length; k++) {
            context.save();
            selectDraw(context, tables.tableDrawDashed[k]);
            //overlappingDraw(context, tableDrawDashed[k]);
            tables.tableDrawDashed[k].drawCanvas(context);
            if (colorFill){
              context.fillStyle = colorFill;
              context.fill();
            }
            context.restore();
          }
          context.restore();
        }
      },

      drawTableThin: function (context, colorStroke, colorFill, lineWidth) {
        if(tables.tableDrawThin.length !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          for (var j = 0; j < tables.tableDrawThin.length; j++) {
            context.save();
            selectDraw(context, tables.tableDrawThin[j]);
            //overlappingDraw(context, tableDrawThin[j]);
            tables.tableDrawThin[j].drawCanvas(context);
            if (colorFill){
              context.fillStyle = colorFill;
              context.fill();
            }
            context.restore();
          }
          context.restore();
        }
      },

      drawTableActive: function (context, colorStroke, colorFill, lineWidth) {
        if(tables.tableActive !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          for (var i = 0; i < tables.tableActive.length; i++) {
            context.save();
            selectDraw(context, tables.tableActive);
            //overlappingDraw(context, tables.tableActive[i]);
            tables.tableActive[i].drawCanvas(context);
            if (colorFill){
              context.fillStyle = colorFill;
              context.fill();
            }
            context.restore();
          }
          context.restore();
        }
      },

      drawBoite: function (context, colorStroke, colorFill, lineWidth) {
        if(boite.projBoite.fonction === 'Boite') {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          context.shadowColor   = '#666';
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;
          context.shadowBlur    = 2;
          boite.projBoite.drawCanvas(context);


          if (boite.projBoite.color) {
            context.fillStyle = boite.projBoite.color;
            context.fill();
          } else {
            if (colorFill){
              context.fillStyle = colorFill;
              context.fill();
            }
          }

          if (boite.projBoite.isOverlapping) {
            context.fillStyle = 'rgba(255, 00, 00, 0.2)';
            context.fill();
          }
          context.restore();
        }
      },

      drawTableAlignLine: function (canvas, context, colorClose, colorAlign, dashArray) {
        var i;
        if (tables.tableAlignLine.length !== 0) {
          context.save();
          context.setLineDash(dashArray);
          // Ligne Horizontale.
          for (i = 0 ; i < tables.tableAlignLine.x.length ; i++) {
            context.strokeStyle = colorClose;
            context.beginPath();
            if (tables.tableAlignLine.x[i].isPile) {
              context.strokeStyle = colorAlign;
            }
            context.moveTo(tables.tableAlignLine.x[i].x,0);
            context.lineTo(tables.tableAlignLine.x[i].x,canvas.height);
            context.stroke();
            context.closePath();
          }

          // Ligne Verticale.
          for (i = 0 ; i < tables.tableAlignLine.y.length ; i++) {
            context.strokeStyle = colorClose;
            context.beginPath();
            if (tables.tableAlignLine.y[i].isPile) {
              context.strokeStyle = colorAlign;
            }
            context.moveTo(0,tables.tableAlignLine.y[i].y);
            context.lineTo(canvas.width,tables.tableAlignLine.y[i].y);
            context.stroke();
            context.closePath();
          }
          context.restore();
        }
      },

      drawArrow: function (context, colorFill) {
        if(tables.tableArrow.length !== 0) {
          context.save();
          context.shadowColor   = 'gray';
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;
          context.shadowBlur    = 1;
          context.fillStyle = colorFill;
          for (var i = 0; i < tables.tableArrow.length; i++) {
            tables.tableArrow[i].drawCanvas(context);
          }
          context.restore();
        }
      },

      drawText: function(ctx){
        if(tables.tableText.length !== 0) {
          for (var i = 0; i < tables.tableText.length; i++) {
            tables.tableText[i].drawCanvas(ctx);
          }
        }
      },

      //@todo : table de travail, a supprimer.
      drawTableLimits: function (context, colorStroke, colorFill, lineWidth, dashArray) {
        if(tables.tableDrawLimits.length !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          context.setLineDash(dashArray);
          for (var k = 0; k < tables.tableDrawLimits.length; k++) {
            context.save();
            selectDraw(context, tables.tableDrawLimits[k]);
            //overlappingDraw(context, tableDrawDashed[k]);
            tables.tableDrawLimits[k].drawCanvasLimits(context);
            if (colorFill){
              context.fillStyle = colorFill;
              context.fill();
            }
            context.restore();
          }
          context.restore();
        }
      },
      // Fin todo.

      drawStuff: function() {

        canvasS.ctx.clearRect(0, 0, canvasS.canvas.width, canvasS.canvas.height);

        this.drawBoite(canvasS.ctx, 'gray', '#f6f6f6', '1px');
        this.drawTableDashed(canvasS.ctx, 'gray', '#f6f6f6', '1px', [10, 3]);
        this.drawTableLimits(canvasS.ctx, 'gray', '#f6f6f6', '1px', [10, 3]);
        this.drawTableThin(canvasS.ctx, 'gray', null, '1px');
        this.drawTableAlignLine(canvasS.canvas, canvasS.ctx, '#d0d0d0', '#00bfff', [10, 3]);
        this.drawTableActive(canvasS.ctx, 'black', null, '1px');
        this.drawArrow(canvasS.ctx, 'gray');

        //this.drawText(ctx);
      }

    };
  });
