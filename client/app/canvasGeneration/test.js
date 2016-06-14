/**
 * Created by narcozy on 14/06/2016.
 */
function canvasiteminstance(ctx, shape, x, y, w, h, angle) {
  this.ctx = ctx;

  this.shape = shape || 'rect';
  this.x = parseInt(x, 10);
  this.y = parseInt(y, 10);
  this.w = parseInt(w, 10);
  this.h = parseInt(h, 10);
  this.angle = parseFloat(angle) * (2.0 * Math.PI) / 360.0;

  this.isSelected = false;
  this.isOverlapping = false;


  this.draw = function () {
    if (this.shape === 'rect') {
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "rgb(55, 55, 55)";
      this.ctx.rect(this.x, this.y, this.w, this.h);
      this.ctx.closePath();
      if (this.isOverlapping) {
        this.ctx.fillStyle = "rgba(255, 00, 00, 0.2)";
        this.ctx.fill();
      }
      else if (this.isSelected) {
        this.ctx.fillStyle = "rgba(255, 255, 00, 0.2)";
        this.ctx.fill();
      }
      this.ctx.stroke();
    }
    else if (this.shape === 'circle') {
      this.h = this.w;
      this.r = this.w / 2;
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "rgb(55, 55, 55)";
      this.ctx.arc(this.getCenterX(), this.getCenterY(), this.w / 2, 0, 2 * Math.PI, false);
      if (this.isOverlapping) {
        this.ctx.fillStyle = "rgba(255, 00, 00, 0.2)";
        this.ctx.fill();
      }
      else if (this.isSelected) {
        this.ctx.fillStyle = "rgba(255, 255, 00, 0.2)";
        this.ctx.fill();
      }
      this.ctx.stroke();
    }
    else if (this.shape === 'poly'){

      // Rect // axe
      var poly = this.getBoundingBoxPoints();
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "rgb(55, 55, 55)";
      this.ctx.moveTo(poly[0].x, poly[0].y);
      for (var item = 0, length = poly.length; item <= length - 1; item += 1) {
        this.ctx.lineTo(poly[item].x, poly[item].y);
      }
      this.ctx.closePath();
      this.ctx.fillStyle = "rgba(255, 00, 00, 0.2)";
      this.ctx.fill();
      this.ctx.stroke();

      // rotate Rect
      poly = this.getBoundingBoxPointsRotateLocal();
      poly = this.rotate(poly);
      poly = this.translate(this.getCenterX()/2,  this.getCenterY()/2, poly);
      this.ctx.beginPath();
      this.ctx.moveTo(poly[0].x, poly[0].y);
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "rgb(55, 55, 55)";
      for (var item = 0, length = poly.length; item <= length - 1; item += 1) {
        this.ctx.lineTo(poly[item].x, poly[item].y);
      }
      this.ctx.closePath();
      this.ctx.fillStyle = "rgba(255, 00, 00, 0.2)";
      this.ctx.fill();
      this.ctx.stroke();
    }
  };




  this.translate = function (x,y,poly) {
    return ([
      {
        x: x + poly[0].x,
        y: y + poly[0].x
      },
      {
        x: x + poly[1].x,
        y: y + poly[1].y
      },
      {
        x: x + poly[2].x,
        y: y + poly[2].y
      },
      {
        x: x + poly[3].x,
        y: y + poly[3].y
      }
    ]);
  };

  this.rotate = function (poly) {
    return ([
      {
        x: Math.round(poly[0].x * Math.cos(this.angle) + poly[0].y * Math.sin(this.angle)),
        y: Math.round(-1 * poly[0].x * Math.sin(this.angle) + poly[0].y * Math.cos(this.angle))
      },
      {
        x: Math.round(poly[1].x * Math.cos(this.angle) + poly[1].y * Math.sin(this.angle)),
        y: Math.round(-1 * poly[1].x * Math.sin(this.angle) + poly[1].y * Math.cos(this.angle))
      },
      {
        x: Math.round(poly[2].x * Math.cos(this.angle) + poly[2].y * Math.sin(this.angle)),
        y: Math.round(-1 * poly[2].x * Math.sin(this.angle) + poly[2].y * Math.cos(this.angle))
      },
      {
        x: Math.round(poly[3].x * Math.cos(this.angle) + poly[3].y * Math.sin(this.angle)),
        y: Math.round(-1 * poly[3].x * Math.sin(this.angle) + poly[3].y * Math.cos(this.angle))
      }
    ]);
  };


  this.getBoundingBoxPointsRotateLocal = function () {
    return ([
      {
        x: 0,
        y: 0
      },
      {
        x: this.w,
        y: 0
      },
      {
        x: this.w,
        y: this.h
      },
      {
        x: 0,
        y: this.h
      }
    ]);
  };

  this.getBoundingBoxPoints = function () {
    // Bords du rectangle.
    // 0 haut gauche, 1 haut droit, 2 bas droit, 3 bas gauche.
    if (this.shape === 'rect') {
      return ([
        {
          x: this.x,
          y: this.y
        },
        {
          x: this.x + this.w,
          y: this.y
        },
        {
          x: this.x + this.w,
          y: this.y + this.h
        },
        {
          x: this.x,
          y: this.y + this.h
        }
      ]);
    }
    // cercle,
    // 0 = centre, 1 = rayon
    else if (this.shape === 'circle') {
      return ({
        x: this.x + this.w / 2,
        y: this.y + this.w / 2,
        r: this.w / 2
      }
      );
    }
  };

  this.setCenterX = function (newX) {
    this.x = newX - (this.w / 2);
  };

  this.setCenterY = function (newY) {
    this.y = newY - (this.h / 2);
  };

  this.setX = function (newX) {
    this.x = newX;
  };

  this.setY = function (newY) {
    this.y = newY;
  };

  this.getX = function () {
    return this.x;
  };

  this.getY = function () {
    return this.y;
  };

  this.getLeft = function () {
    return this.getX();
  };

  this.getTop = function () {
    return this.getY();
  };

  this.getRight = function () {
    return this.getX() + this.w;
  };

  this.getBottom = function () {
    return this.getY() + this.h;
  };

  this.getCenterX = function () {
    return this.x + (this.w / 2);
  };

  this.getCenterY = function () {
    return this.y + (this.h / 2);
  };

  this.getRadius = function () {
    return this.w / 2;
  };

  this.setSelected = function (selected) {
    this.isSelected = selected;
  };

  this.setOverlapping = function (overlap) {
    this.isOverlapping = overlap;
  };
}

return {
  tab,

  createnew: function (shape, x, y, w, h, angle) {
    var x = this.tab.push(new canvasiteminstance(this.ctx, shape, x, y, w, h, angle));
    return this.tab[x - 1];
  },

  getinst: function () {
    return this.tab;
  },

  drawall: function () {
    this.clear();
    for (var i = 0, l = tab.length; i < l; i++) {
      tab[i].draw();
    }
  },

  setcanvas: function (canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    return this.canvas;
  },

  getcanvas: function () {
    return this.canvas;
  },

  getcxt: function () {
    return this.ctx;
  },

  clear: function () {
    //mousehelper.context.save();
    //mousehelper.context.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //mousehelper.context.restore();
  }


};

});
