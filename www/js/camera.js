
var Camera = {

    DestinationType: {
        DATA_URL : 0,           // Return image as base64 encoded string
        FILE_URI : 1            // Return image file URI
    },
    PictureSourceType: {
        PHOTOLIBRARY : 0,
        CAMERA : 1,
        SAVEDPHOTOALBUM : 2
    },
    EncodingType: {
        JPEG : 0,               // Return JPEG encoded image
        PNG : 1                 // Return PNG encoded image
    },
    MediaType: {
        PICTURE: 0,             // allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType
        VIDEO: 1,               // allow selection of video only, WILL ALWAYS RETURN FILE_URI
        ALLMEDIA : 2            // allow selection from all media types
    },

    // Take a photo
    takePhoto: function(pictureQuality, callback, errorCallback) {
      try {
        pictureQuality = (pictureQuality)
          ? pictureQuality
          : 90;
        navigator.camera.getPicture(function(imageData) {
          callback(imageData);
        }, function(message) {
          if (typeof errorCallback != 'undefined') {
            errorCallback(message);
          } else {
            Notify.alert('Oops', 'Photo capture failed: ' + error);
          }
        }, {
          sourceType: Camera.PictureSourceType.CAMERA,
          mediaType: Camera.MediaType.PICTURE,
          encodingType: Camera.EncodingType.JPEG,
          quality: pictureQuality,
          destinationType: Camera.DestinationType.DATA_URL,
          saveToPhotoAlbum: false
        });
      } catch(err) {
        Notify.alert('Oops', 'Could not capture picture: ' + err.message);
      }
    }

};
