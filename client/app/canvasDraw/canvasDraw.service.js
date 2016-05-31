'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasDraw', function (canvasControl) {

    var canvas = {};
    var ctx = {};
    var boite = null;
    var tableActive = [];
    var tableDashed = [];
    var tableThin = [];
    var tableShine = [];
    var selectDraw = function(context, item){
      if (item.isSelected) {
        context.font = "16px sans-serif";
        context.strokeStyle = "#00bfff";
        context.fillStyle = "#00bfff";
        context.fillText(item.titre, item.getCenterX(), item.pos.y - 20);
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
        tableDashed = canvasControl.getTableDashed();
        if(tableDashed.length !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          context.setLineDash(dashArray);
          for (var k = 0; k < tableDashed.length; k++) {
            context.save();
            selectDraw(context, tableDashed[k]);
            //overlappingDraw(context, tableDashed[k]);
            tableDashed[k].drawCanvas(context);
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
        tableThin = canvasControl.getTableThin();
        if(tableThin.length !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          for (var j = 0; j < tableThin.length; j++) {
            context.save();
            selectDraw(context, tableThin[j]);
            //overlappingDraw(context, tableThin[j]);
            tableThin[j].drawCanvas(context);
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
        if(boite) {
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
          context.restore();
        }
      },

      drawStuff: function() {

        canvas = canvasControl.getCanvas();
        ctx = canvasControl.getCtx();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.drawBoite(ctx, "gray", "#f6f6f6", "1px");
        this.drawTableDashed(ctx, "gray", "#f6f6f6", "1px", [10, 3]);
        this.drawTableThin(ctx, "gray", null, "1px");
        this.drawTableActive(ctx, "black", null, "1px");
      }

    };
  });
