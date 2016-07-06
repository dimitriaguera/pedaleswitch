/**
 * Rulers JS is an HTML5 (canvas) based script that renders rulers on your canvas, similar to that found on PhotoShop or other drawing programs. A cursor is rendered on the gutter as well.
 *
 * All code is MIT licensed: http://opensource.org/licenses/mit-license.php
 * Created by Andrew Rodrigues (psychobunny) https://github.com/psychobunny/Rulers.
 * And modified to fit with angularJS by Marc Foletto.
 * Usage
 * Include the script in your HTML document:
 * Pass in a reference or ID (string) of the target canvas into the Rulers constructor:
 * var rulers = new Rulers('myCanvas');
 * Render the canvas with the desired options:
 * rulers.render('#aaa', 'pixels', 100);
 */

'use strict';

angular.module('pedaleswitchApp')
  .factory('rulers', function () {

    var MAJOR_INTERVAL_RATIO = 0.5,
      MINOR_INTERVAL_RATIO = 0.2,
      TICKS_PER_MAJOR_INTERVAL = 10,
      RULERS_SIZE = 15;
    

    return {

      fillContextWithRuler: function(context, ruler, width, height) {
        var patternHolder = document.createElement('canvas'),
          patternCtx = patternHolder.getContext('2d');
  
        context.fillStyle = context.createPattern(ruler, 'repeat-x');
        context.fillRect(RULERS_SIZE, 0, width, height);
  
        patternHolder.width = width;
        patternHolder.height = 100;
  
        patternCtx.translate(0, 0);
        patternCtx.scale(-1, 1);
        patternCtx.rotate(Math.PI / 4 * 2);
        patternCtx.drawImage(ruler, 0, 0);
  
        context.fillStyle = context.createPattern(patternHolder, 'repeat-y');
        context.fillRect(0, RULERS_SIZE, width, width);
      },

      constructSVGData: function(color, units, major) {
        var majorHeight = parseInt(RULERS_SIZE * MAJOR_INTERVAL_RATIO, 10),
          minorHeight = parseInt(RULERS_SIZE * MINOR_INTERVAL_RATIO, 10),
          tickWidth = parseInt(major / 10, 10),
          html = '',
          i;
  
        for (i = 0; i < TICKS_PER_MAJOR_INTERVAL; i += 1) {
          html += "<div xmlns='http://www.w3.org/1999/xhtml' style='position: absolute; bottom: 0px; width: " + tickWidth + "px; border-bottom: 1px solid #555; border-left: 1px solid #999;  height: " + ((i % 5 === 0) ? majorHeight : minorHeight)  + "px; left: "  + i * tickWidth + "px'></div>";
        }
  
        // https://developer.mozilla.org/en-US/docs/HTML/Canvas/Drawing_DOM_objects_into_a_canvas
        return "<svg xmlns='http://www.w3.org/2000/svg' width='" + major + "' height='" + RULERS_SIZE + "'><foreignObject width='100%' height='100%'>" + html + "</foreignObject></svg>";
      },
  
      render: function(canvas, ctx, color, units, major) {
        var svg, svgdata, ruler, url, DOMURL;

        this.ctx = ctx;
        this.canvas = canvas;

        this.ctx.fillStyle =  '#474747';
        this.ctx.strokeStyle = '#ffffff';

  
        this.ctx.fillRect(0, 0, this.canvas.width, RULERS_SIZE);
        this.ctx.fillRect(0, 0, RULERS_SIZE, this.canvas.height);
  
        svgdata = this.constructSVGData.apply(this, [color, units, major]);
  
        ruler = document.createElement('img');
  
        DOMURL = window.URL || window.webkitURL || window;

        ruler.onload = function () {
          DOMURL.revokeObjectURL(url);
          this.fillContextWithRuler(this.ctx, ruler, this.canvas.width, this.canvas.height);
        }.bind(this);
  
        svg = new Blob([svgdata], {
          type: 'image/svg+xml;charset=utf-8'
        });
  
        url = DOMURL.createObjectURL(svg);
        ruler.src = url;
      },
      
      getRulersSize: function(){
        return RULERS_SIZE;        
      },

      drawGrid: function(canvas, ctx) {
        var w = canvas.width, h = canvas.height;
        ctx.strokeStyle = 'rgba(94, 94, 94, 0.8)';
        //ctx.setLineDash([1, 5]);
        ctx.beginPath();
        for (var e = 0; e < w; e += 15) {
          ctx.moveTo(e, 0);
          ctx.lineTo(e, w);
        }
        for (var f = 0; f < h; f += 15) {
          ctx.moveTo(0, f);
          ctx.lineTo(w, f);
        }
        ctx.stroke();
      }
      
    };
  });
