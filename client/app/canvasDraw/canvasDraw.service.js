'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasDraw', function (canvasControl, canvasConversion) {

    var canvasSetting = canvasControl.getCanvasSetting();
    var boite = null;
    var tableActive = [];
    var tableDrawDashed = [];
    var tableDrawThin = [];
    var tableDrawShine = [];
    var tableArrow = [];

    //@todo: table de travail, a supprimer.
    var tableDrawLimits = [];
    //Fin todo.

    var selectDraw = function(context, item){
      if (item.isSelected) {
        context.font = "16px sans-serif";
        context.strokeStyle = "#00bfff";
        context.fillStyle = "#00bfff";
        //context.textAlign = 'center';
        //context.fillText(item.titre, item.getCenterX(), item.findExtreme().t - canvasConversion.convertToPixel(5));
        context.shadowColor   = "#666";
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.shadowBlur    = 2;
      }
    };
    //var overlappingDraw = function (context, item){
    //  if (item.isOverlapping) {
    //    context.fillStyle = "rgba(255, 00, 00, 0.2)";
    //    context.fill();
    //  }
    //};

    return {

      drawTableDashed: function (context, colorStroke, colorFill, lineWidth, dashArray) {
        tableDrawDashed = canvasControl.getTableDrawDashed();
        if(tableDrawDashed.length !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          context.setLineDash(dashArray);
          for (var k = 0; k < tableDrawDashed.length; k++) {
            context.save();
            selectDraw(context, tableDrawDashed[k]);
            //overlappingDraw(context, tableDrawDashed[k]);
            tableDrawDashed[k].drawCanvas(context);
            if (colorFill){
              context.fillStyle = colorFill;
              context.fill();
            }
            context.restore()
          }
          context.restore();
        }
      },

      drawTableThin: function (context, colorStroke, colorFill, lineWidth) {
        tableDrawThin = canvasControl.getTableDrawThin();
        if(tableDrawThin.length !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          for (var j = 0; j < tableDrawThin.length; j++) {
            context.save();
            selectDraw(context, tableDrawThin[j]);
            //overlappingDraw(context, tableDrawThin[j]);
            tableDrawThin[j].drawCanvas(context);
            if (colorFill){
              context.fillStyle = colorFill;
              context.fill();
            }
            context.restore()
          }
          context.restore();
        }
      },

      drawTableActive: function (context, colorStroke, colorFill, lineWidth) {
        tableActive = canvasControl.getTableActive();
        if(tableActive.length !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          for (var i = 0; i < tableActive.length; i++) {
            context.save();
            selectDraw(context, tableActive[i]);
            //overlappingDraw(context, tableActive[i]);
            tableActive[i].drawCanvas(context);
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
        boite = canvasControl.getBoite();
        if(boite.fonction === "Boite") {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          context.shadowColor   = "#666";
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;
          context.shadowBlur    = 2;
          boite.drawCanvas(context);
          if (colorFill){
            context.fillStyle = colorFill;
            context.fill();
          }
          if (boite.isOverlapping) {
            context.fillStyle = "rgba(255, 00, 00, 0.2)";
            context.fill();
          }
          context.restore();
        }
      },

      drawTableAlignLine: function (canvas, context, colorClose, colorAlign, dashArray) {
        var tab = canvasControl.getTableAlignLine() || [];
        var i;

        if(tab.length !== 0) {
          context.save();
          context.setLineDash(dashArray);

          // Ligne Horizontale.
          for (i = 0 ; i < tab.x.length ; i++) {
            context.strokeStyle = colorClose;
            context.beginPath();
            if (tab.x[i].isPile) {
              context.strokeStyle = colorAlign;
            }
            context.moveTo(tab.x[i].x,0);
            context.lineTo(tab.x[i].x,canvas.height);
            context.stroke();
            context.closePath();
          }

          // Ligne Verticale.
          for (i = 0 ; i < tab.y.length ; i++) {
            context.strokeStyle = colorClose;
            context.beginPath();
            if (tab.y[i].isPile) {
              context.strokeStyle = colorAlign;
            }
            context.moveTo(0,tab.y[i].y);
            context.lineTo(canvas.width,tab.y[i].y);
            context.stroke();
            context.closePath();
          }
          context.restore();
        }
      },

      drawArrow: function (context, colorFill) {
        var tableArrow = canvasControl.getTableArrow();
        if(tableArrow.length !== 0) {
          context.save();
          context.shadowColor   = "gray";
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;
          context.shadowBlur    = 1;
          context.fillStyle = colorFill;
          for (var i = 0; i < tableArrow.length; i++) {
            tableArrow[i].drawCanvas(context);
          }
          context.restore();
        }
      },

      drawText: function(ctx){
        var tableText = canvasControl.getTableText();
        if(tableText.length !== 0) {
          for (var i = 0; i < tableText.length; i++) {
            tableText[i].drawCanvas(ctx);
          }
        }
      },

      //@todo : table de travail, a supprimer.
      drawTableLimits: function (context, colorStroke, colorFill, lineWidth, dashArray) {
        tableDrawLimits = canvasControl.getTableDrawLimits();
        if(tableDrawLimits.length !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          context.setLineDash(dashArray);
          for (var k = 0; k < tableDrawLimits.length; k++) {
            context.save();
            selectDraw(context, tableDrawLimits[k]);
            //overlappingDraw(context, tableDrawDashed[k]);
            tableDrawLimits[k].drawCanvasLimits(context);
            if (colorFill){
              context.fillStyle = colorFill;
              context.fill();
            }
            context.restore()
          }
          context.restore();
        }
      },
      // Fin todo.

      drawStuff: function() {

        canvasSetting.ctx.clearRect(0, 0, canvasSetting.canvas.width, canvasSetting.canvas.height);

        this.drawBoite(canvasSetting.ctx, "gray", "#f6f6f6", "1px");
        this.drawTableDashed(canvasSetting.ctx, "gray", "#f6f6f6", "1px", [10, 3]);
        this.drawTableLimits(canvasSetting.ctx, "gray", "#f6f6f6", "1px", [10, 3]);
        this.drawTableThin(canvasSetting.ctx, "gray", null, "1px");
        this.drawTableAlignLine(canvasSetting.canvas, canvasSetting.ctx, "#d0d0d0", "#00bfff", [10, 3]);
        this.drawTableActive(canvasSetting.ctx, "black", null, "1px");
        this.drawArrow(canvasSetting.ctx, "gray");
        
        //this.drawText(ctx);
      }

    };
  });
