'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasDraw', function (canvasControl) {

    var canvas = {};
    var ctx = {};
    var tableActive = [];
    var tableDashed = [];
    var tableThin = [];
    var tableShine = [];

    return {

      drawTableActive: function (context, colorStroke, colorFill, lineWidth) {
        tableActive = canvasControl.getTableActive();
        if(tableActive.length !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          for (var i = 0; i < tableActive.length; i++) {
            tableActive[i].drawCanvas(context);
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
            tableThin[j].drawCanvas(context);
          }
          context.restore();
        }
      },

      drawTableDashed: function (context, colorStroke, colorFill, lineWidth, dashArray) {
        tableDashed = canvasControl.getTableDashed();
        if(tableDashed.length !== 0) {
          context.save();
          context.lineWidth = lineWidth;
          context.strokeStyle = colorStroke;
          context.setLineDash(dashArray);
          for (var k = 0; k < tableDashed.length; k++) {
            tableDashed[k].drawCanvas(context);
          }
          context.restore();
        }
      },

      drawStuff: function() {

        canvas = canvasControl.getCanvas();
        ctx = canvasControl.getCtx();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.drawTableActive(ctx, "black", null, "1px");
        this.drawTableThin(ctx, "gray", null, "1px");
        this.drawTableDashed(ctx, "gray", null, "1px", [10, 3]);
      }

    };
  });
