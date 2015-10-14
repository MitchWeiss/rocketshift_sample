/*
 * jQuery Coverflow like Slider v0.1
 * http://www.fraser-hart.co.uk
 * http://blog.fraser-hart.co.uk
 *
 * Copyright 2013, Fraser Hart
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
    $.fn.coverFlow = function(options) {
    	//default settings
    	var settings = $.extend( {
    	  initialFocus : 0,
	      speed : 200,
	      addClasses : "",
	      autoNext : true,
	      autoTime : 5000,
	      afterChange: function afterChange(){} 
	    }, options);
	    
        var elems = this.find("ul").first().find("li");
        var allowSlide = true;
        this.addClass('coverFlow').wrap('<div class="coverFlowWrapperOuter" />').wrap('<div class="coverFlowWrapper '+settings.addClasses+'" />');
        var numberOfSlides = parseInt(elems.length),
			eachWidth = parseInt(elems.css("width").replace("px", "")),
			eachBorder = parseInt(elems.css("border-right-width"))+parseInt(elems.css("border-left-width")),
			eachMargin = parseInt(elems.css("margin-right"))+parseInt(elems.css("margin-left")),
            eachPadding = parseInt(elems.css("padding-right"))+parseInt(elems.css("padding-left")),
			totalItemWidth = eachWidth+eachMargin,
			totalWidth = totalItemWidth*numberOfSlides,
			elementToMove = $(this).find('ul'),
			initialFocusPos = -parseInt(settings.initialFocus * totalItemWidth)+(2*totalItemWidth);


		/**
		 * Animates the slider
		 * @param  animateTo //the the left-margin to animate to 
		 */
		function doAnimate(animateTo, after)
		{
			elementToMove.animate({
                    "margin-left": animateTo
            }, settings.speed, 'swing', function(){
                    settings.afterChange(elementToMove.find('li.selected').index());
                    after();
            });
            autoScroll(true);
		}

                var $parent = $(this).parent();
                $parent.parent().prepend('<button class="coverFlowNav prev"><i class="icon-angle-left"></i></button><button class="coverFlowNav next"><i class="icon-angle-right"></i></button>');

                elementToMove.css('margin-left', initialFocusPos);
                $parent.find('ul').width(totalWidth).find('li:eq('+settings.initialFocus+')').addClass('selected');
                setTimeout(function() {
                    $parent.find('ul').find('li:eq('+settings.initialFocus+')').addClass('selected2');
                }, 200);

				nav_click = function(self) {
                    if (allowSlide == true) {
                        allowSlide = false;
                        var $parent = self.parent();
                        var direction = self.hasClass('next') ? '-' : '+';
                        var $elementToSelect;
                        if (direction == '+') {
                            var $last = $parent.find('.coverFlow ul li:last-child').remove();
                            $parent.find('.coverFlow ul').prepend($last);
                            elementToMove.animate({'margin-left': '-='+totalItemWidth}, 0);
                            $elementToSelect = $parent.find('.coverFlow ul li.selected').removeClass('selected').removeClass('selected2').prev();
                        } else {
                            var $first = $parent.find('.coverFlow ul li:first-child').remove();
                            $parent.find('.coverFlow ul').append($first);
                            elementToMove.animate({'margin-left': '+='+totalItemWidth}, 0);
                            $elementToSelect = $parent.find('.coverFlow ul li.selected').removeClass('selected').removeClass('selected2').next();
                        }
                        doAnimate(direction+'='+totalItemWidth, function() {
                            $elementToSelect.addClass('selected');
                            setTimeout(function() {
                                $elementToSelect.addClass('selected2');
                                allowSlide = true;
                            }, 200);
                        });
                    }
                };

                $(this).parent().parent().on('click', '.coverFlowNav', function() {
                	nav_click($(this));
                });

                $(this).parent().on("click", "li", function(){
                    if (allowSlide == true) {
                        allowSlide = false;
                        $this = $(this);
                        newleftpos = -parseInt($this.parent().children().index(this) * totalItemWidth)+(2*totalItemWidth);

                        var multiple = (parseInt(elementToMove.css('margin-left').replace("px", ""))-newleftpos)/totalItemWidth;
                        if (multiple < 0) {
                            var direction = '+';
                            multiple *= -1;
                        } else if (multiple > 0) {
                            var direction = '-';
                        } else {
                            allowSlide = true;
                            window.location = $this.find('a').attr('href')
                            return;
                        }
                        for (var i = 0; i < multiple; i++) {
                            if (direction == '+') {
                                var $last = $this.parent().find('li:last-child').remove();
                                $this.parent().prepend($last);
                                elementToMove.animate({'margin-left': '-='+totalItemWidth}, 0);
                            } else {
                                var $first = $this.parent().find('li:first-child').remove();
                                $this.parent().append($first);
                                elementToMove.animate({'margin-left': '+='+totalItemWidth}, 0);
                            }
                        }

                        $this.parent().find('li.selected').removeClass('selected').removeClass('selected2');
                        doAnimate(direction+'='+(multiple*totalItemWidth), function() {
                            $this.addClass('selected');
                            setTimeout(function() {
                                $this.addClass('selected2');
                                allowSlide = true;
                            }, 200);
                        });
                    }
                });

                $parent.parent().swipe({
                	allowPageScroll: "vertical",
                    swipe:function(event, direction, distance, duration, fingerCount) {
                              if (direction == null) return;
                              if (direction == 'left') $parent.parent().find('.coverFlowNav.next').click();
                              if (direction == 'right') $parent.parent().find('.coverFlowNav.prev').click();
                    }, threshold: 75
                });

				function autoScroll(enable){
					if(settings.autoNext == false){
						return;
					}
					if(enable){
						if(typeof interval !== 'undefined'){
							clearTimeout(interval);
						}
						interval = setTimeout(function(){
							nav_click($parent.parent().find('.coverFlowNav.next'));
						}, settings.autoTime);
					} else {
						clearTimeout(interval);
					}
				}
				autoScroll(true);

				$('#contentSlider').on('mouseenter', function (){
					autoScroll(false);
				});
				$('#contentSlider').on('mouseleave', function (){
					autoScroll(true);
				});
    };
})( jQuery );
