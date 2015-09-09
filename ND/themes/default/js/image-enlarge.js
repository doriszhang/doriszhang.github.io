(function ($) {

    $.fn.imageEnlarge = function (options) {

        var defaults = {
            contentWidth: 200,  //contentHeight be set as 'auto'
            previewWidth: 300,
            previewHeight: 300,
            imgScale:2
        };

        var CONSTANTS = {
            OuterContainerClassName:"dd_image_enlarge",
            ContentContainerClassName: "dd_content_containter",
            PreviewContainerClassName: "dd_preview_container",
            FocusAreaClassName:"dd_focus_area"
        };
        
        var options = $.extend(defaults, options);

        var contentContainer, previewContainer, focusArea, previewImage, contentImage;

        var enlargeInit = function (container) {
            if (!$('img', container) || $('img', container).length === 0) { return; }

            var image = new Image();
            image.src = $('img', container)[0].src;
            
            reloadContainer(container, image);
            registerEvents(container);
        };

        function reloadContainer(container, image) {
            var focusSize = getFocusAreaSize();
            focusArea = $('<div/>').addClass(CONSTANTS.FocusAreaClassName).width(focusSize.width).height(focusSize.height);
            contentImage = $('<img/>').attr({ 'src': image.src, 'width': options.contentWidth, 'height': 'auto' });
            contentContainer = $('<div/>').addClass(CONSTANTS.ContentContainerClassName)
                .append($('<div/>')
                    .append(contentImage)
                    .append(focusArea)
                );
            previewImage = $('<img/>').attr({ 'src': image.src, 'width': options.contentWidth * options.imgScale, 'height': 'auto' });
            previewContainer = $('<div/>').addClass(CONSTANTS.PreviewContainerClassName).width(options.previewWidth).height(options.previewHeight)
                .append($('<div/>')
                    .append(previewImage)
                );
            container.empty().addClass(CONSTANTS.OuterContainerClassName).append(contentContainer).append(previewContainer);
        }

        function getFocusAreaSize() {
            var width = options.contentWidth * options.previewWidth / (options.contentWidth * options.imgScale);
            var height = width * options.previewHeight / options.previewWidth;
            return {
                width: width,
                height: height
            };
        }

        function registerEvents(container) {
            previewContainer.hide();
            focusArea.hide();
            $(contentImage).parent().on('mousemove', function (e) {
                var self = this;
                var mouseX = e.clientX - self.offsetLeft,
                    mouseY = e.clientY - self.offsetTop;
                //console.log(mouseX + ',' + mouseY);
                if (mouseX > 0 && mouseX < $(self).width() && mouseY > 0 && mouseY < $(self).height()) {
                    var focus_top = (mouseY - focusArea.height() / 2) > 0
                            ? ((mouseY - focusArea.height() / 2) < ($(self).height() - focusArea.height())) ? (mouseY - focusArea.height() / 2) : ($(self).height() - focusArea.height())
                            : 0,
                        focus_left = (mouseX - focusArea.width() / 2) > 0
                            ? ((mouseX - focusArea.width() / 2) < ($(self).width() - focusArea.width())) ? (mouseX - focusArea.width() / 2) : ($(self).width() - focusArea.width())
                            : 0;
                    focusArea.css({
                        top: focus_top,
                        left: focus_left
                    });
                    previewImage.css({
                        top: -focus_top * options.imgScale,
                        left: -focus_left * options.imgScale
                    });
                    focusArea.show();
                    previewContainer.show();
                }
                else {
                    focusArea.hide();
                    previewContainer.hide();
                }
            });
            $(document).on('click', function () {
                focusArea.hide();
                previewContainer.hide();
            });
        }

        enlargeInit($(this));
    };


}(jQuery));