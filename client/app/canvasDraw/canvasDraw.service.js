'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasDraw', function (canvasGlobalServ) {

    var canvasS = canvasGlobalServ.getCanvasS();
    var canvasGlobal = canvasGlobalServ.getCanvasGlobal();
    var tables = canvasGlobalServ.getTables();
    var boite = canvasGlobalServ.getBoite();


    var selectDraw = function(ctx, item){
      if (item.isSelected) {
        ctx.font = '16px sans-serif';
        ctx.strokeStyle = '#00bfff';
        ctx.fillStyle = '#00bfff';
        //ctx.textAlign = 'center';
        //ctx.fillText(item.titre, item.getCenterX(), item.findExtreme().t - canvasConversion.convertToPixel(5));
        ctx.shadowColor   = '#666';
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur    = 2;
      }
    };
    //var overlappingDraw = function (ctx, item){
    //  if (item.isOverlapping) {
    //    ctx.fillStyle = 'rgba(255, 00, 00, 0.2)';
    //    ctx.fill();
    //  }
    //};

    return {

      drawBoite: function (ctx, colorStroke, colorFill, lineWidth) {
        if(boite.projBoite.fonction === 'Boite') {
          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = colorStroke;
          ctx.shadowColor   = '#666';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur    = 2;

          if (canvasGlobal.state.viewState === 'up' || canvasGlobal.state.viewState === 'down') {
            boite.projBoite.drawCanvasRoundBorder(ctx);
          }
          else{
            boite.projBoite.drawCanvas(ctx);
          }


          if (boite.projBoite.color) {
            ctx.fillStyle = boite.projBoite.color;
            ctx.fill();
          } else {
            if (colorFill){
              ctx.fillStyle = colorFill;
              ctx.fill();
            }
          }

          if (boite.projBoite.isOverlapping) {
            ctx.fillStyle = 'rgba(255, 00, 00, 0.2)';
            ctx.fill();
          }
          ctx.restore();

          // Cette fonction permet de ne pas dessiner les élements qui sont
          // en dehors du canvas quand on est en mode deco.
          if (canvasGlobal.state.isActive === 'deco') {ctx.clip()}
        }
      },

      drawTableDashed: function (ctx, colorStroke, colorFill, lineWidth, dashArray) {
        if(tables.tableDrawDashed.length !== 0) {
          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = colorStroke;
          ctx.setLineDash(dashArray);
          for (var k = 0; k < tables.tableDrawDashed.length; k++) {
            ctx.save();
            selectDraw(ctx, tables.tableDrawDashed[k]);
            //overlappingDraw(ctx, tableDrawDashed[k]);
            tables.tableDrawDashed[k].drawCanvas(ctx);
            if (colorFill){
              ctx.fillStyle = colorFill;
              ctx.fill();
            }
            ctx.restore();
          }
          ctx.restore();
        }
      },

      drawTableThin: function (ctx, colorStroke, colorFill, lineWidth) {
        if(tables.tableDrawThin.length !== 0) {
          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = colorStroke;
          for (var j = 0; j < tables.tableDrawThin.length; j++) {
            ctx.save();
            selectDraw(ctx, tables.tableDrawThin[j]);
            //overlappingDraw(ctx, tableDrawThin[j]);
            tables.tableDrawThin[j].drawCanvas(ctx);
            if (colorFill){
              ctx.fillStyle = colorFill;
              ctx.fill();
            }
            ctx.restore();
          }
          ctx.restore();
        }
      },

      drawTableActive: function (ctx, colorStroke, colorFill, lineWidth) {
        if(tables.tableActive !== 0) {
          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = colorStroke;
          for (var i = 0; i < tables.tableActive.length; i++) {
            ctx.save();
            selectDraw(ctx, tables.tableActive);
            //overlappingDraw(ctx, tables.tableActive[i]);
            tables.tableActive[i].drawCanvas(ctx);
            if (colorFill){
              ctx.fillStyle = colorFill;
              ctx.fill();
            }
            ctx.restore();
          }
          ctx.restore();
        }
      },

      drawTableAlignLine: function (canvas, ctx, colorClose, colorAlign, dashArray) {
        var i;
        if (tables.tableAlignLine.length !== 0) {
          ctx.save();
          ctx.setLineDash(dashArray);
          // Ligne Horizontale.
          for (i = 0 ; i < tables.tableAlignLine.x.length ; i++) {
            ctx.strokeStyle = colorClose;
            ctx.beginPath();
            if (tables.tableAlignLine.x[i].isPile) {
              ctx.strokeStyle = colorAlign;
            }
            ctx.moveTo(tables.tableAlignLine.x[i].x,0);
            ctx.lineTo(tables.tableAlignLine.x[i].x,canvas.height);
            ctx.stroke();
            ctx.closePath();
          }

          // Ligne Verticale.
          for (i = 0 ; i < tables.tableAlignLine.y.length ; i++) {
            ctx.strokeStyle = colorClose;
            ctx.beginPath();
            if (tables.tableAlignLine.y[i].isPile) {
              ctx.strokeStyle = colorAlign;
            }
            ctx.moveTo(0,tables.tableAlignLine.y[i].y);
            ctx.lineTo(canvas.width,tables.tableAlignLine.y[i].y);
            ctx.stroke();
            ctx.closePath();
          }
          ctx.restore();
        }
      },

      drawArrow: function (ctx, colorFill) {
        if(tables.tableArrow.length !== 0) {
          ctx.save();
          ctx.shadowColor   = 'gray';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur    = 1;
          ctx.fillStyle = colorFill;
          for (var i = 0; i < tables.tableArrow.length; i++) {
            tables.tableArrow[i].drawCanvas(ctx);
          }
          ctx.restore();
        }
      },

      drawTextDeco: function(ctx){
        if(boite.projBoite.textDeco.length !== 0) {
          for (var i = 0; i < boite.projBoite.textDeco.length; i++) {
            boite.projBoite.textDeco[i].drawCanvas(ctx);
          }
        }
      },

      drawShapeDeco: function(ctx){
        if(boite.projBoite.shapeDeco.length !== 0) {
          for (var i = 0; i < boite.projBoite.shapeDeco.length; i++) {
            boite.projBoite.shapeDeco[i].drawCanvas(ctx);
          }
        }
      },

      drawImgDeco: function(ctx){
        if(boite.projBoite.imgDeco.length !== 0) {
          for (var i = 0; i < boite.projBoite.imgDeco.length; i++) {
            boite.projBoite.imgDeco[i].drawCanvas(ctx);
          }
        }
      },

      //@todo : table de travail, a supprimer.
      drawTableLimits: function (ctx, colorStroke, colorFill, lineWidth, dashArray) {
        if(tables.tableDrawLimits.length !== 0) {
          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = colorStroke;
          ctx.setLineDash(dashArray);
          for (var k = 0; k < tables.tableDrawLimits.length; k++) {
            ctx.save();
            selectDraw(ctx, tables.tableDrawLimits[k]);
            //overlappingDraw(ctx, tableDrawDashed[k]);
            tables.tableDrawLimits[k].drawCanvasLimits(ctx);
            if (colorFill){
              ctx.fillStyle = colorFill;
              ctx.fill();
            }
            ctx.restore();
          }
          ctx.restore();
        }
      },
      // Fin todo.

      drawStuff: function() {

        canvasS.ctx.clearRect(0, 0, canvasS.canvas.width, canvasS.canvas.height);

        this.drawBoite(canvasS.ctx, 'gray', '#f6f6f6', '1px');

        if (canvasGlobal.state.isActive === 'deco') {
          this.drawImgDeco(canvasS.ctx);
          this.drawShapeDeco(canvasS.ctx);
          this.drawTextDeco(canvasS.ctx);
        }

        this.drawTableDashed(canvasS.ctx, 'gray', '#f6f6f6', '1px', [10, 3]);
        this.drawTableLimits(canvasS.ctx, 'gray', '#f6f6f6', '1px', [10, 3]);
        this.drawTableThin(canvasS.ctx, 'gray', '#f6f6f6', '1px');
        this.drawTableAlignLine(canvasS.canvas, canvasS.ctx, '#d0d0d0', '#00bfff', [10, 3]);
        this.drawArrow(canvasS.ctx, 'gray');

        if (canvasGlobal.state.isActive !== 'deco') {
          this.drawTableActive(canvasS.ctx, 'black', null, '1px');
        }

      }

    };
  });
