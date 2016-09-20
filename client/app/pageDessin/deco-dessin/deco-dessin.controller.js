'use strict';
(function(){

  class DecoDessin {
    constructor(Upload, $timeout) {
      this.Upload = Upload;

      this.shape = "'Rectangle'";
      this.color = '#FF0000';
      this.lineWidth = 1;
      this.fillColor = '#000000';
    }


    uploadFiles = function(file, errFiles) {
      this.f = file;
      this.errFile = errFiles && errFiles[0];
      if (file) {
        file.addImgToTable = this.addImgToTable;
        this.Upload.dataUrl(file, true).then(function(url){
          file.addImgToTable({src:url});
        });

      }
    }


  }

  angular.module('pedaleswitchApp')
    .component('decoDessin', {
      templateUrl: 'app/pageDessin/deco-dessin/deco-dessin.html',
      bindings: {
        boite:'<',
        draw:'&',
        switchDecoSub:'&',
        textDeco:'=',
        addTextToTable: '&',
        removeTextToTable: '&',
        shapeDeco:'=',
        addShapeToTable: '&',
        removeShapeToTable: '&',
        imgDeco:'=',
        addImgToTable:'&',
        removeImgToTable: '&'
      },
      controller: DecoDessin
    });

})();