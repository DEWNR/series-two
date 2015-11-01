// Script to dynamically change background images
// Requires jQuery, prepare.js and enhance.js.
// Must be minified before use in a production environment.

// Variables
var spotlightUI = new Object;
spotlightUI.carouselRate = 7000;
spotlightUI.fadeRate = 1000;
spotlightUI.changeRate = 200;
spotlightUI.count;
spotlightUI.currentIndex = 0;
spotlightUI.timer;

// Functions
spotlightUI.cycleBackground = function() {
  spotlightUI.changeBackground();
  spotlightUI.timer = setTimeout(arguments.callee, spotlightUI.carouselRate); // ... then restart the timer
}

spotlightUI.changeBackground = function(target) {
  clearTimeout(spotlightUI.timer);
    
  if (target == spotlightUI.currentIndex) { // Check that target and the current item aren't the same
    return false;
  }
  
  if (typeof target == 'number') {
    fadeRate = spotlightUI.changeRate;
  } else {
    target = (spotlightUI.currentIndex + 1)%spotlightUI.count;
    fadeRate = spotlightUI.fadeRate;
  }
  
  $('#spotlight .item.active').stop().toggleClass('inactive active').after('<a class="item active" href="'+$('#spotlight-'+target).attr('href')+'">'+$('#spotlight-'+target).html()+'</a>').next('.item').css('display', 'block').fadeTo(fadeRate, 1, function() {$('#spotlight .item.inactive').remove()});
  $('#spotlight li.active').toggleClass('inactive active').toggleClass('highlight', fadeRate);
  $('#spotlight li:eq('+target+')').toggleClass('inactive active').toggleClass('highlight', fadeRate);
  
  spotlightUI.currentIndex = target;
}

spotlightUI.startCycle = function() {
  spotlightUI.timer = setTimeout('spotlightUI.cycleBackground()', spotlightUI.carouselRate);
}

spotlightUI.initBackground = function() {
  spotlightUI.count = $('#spotlight li').length;
  if (spotlightUI.count > 1) {
    var innerHTML = "<ol>";
    
    $('#spotlight li').each(function(index) {
      $(this).on('click', function() {
        spotlightUI.changeBackground(index);
        spotlightUI.startCycle();
        return false;
      });
    });
    $('#spotlight .item.initial').css("opacity", 1).toggleClass('initial active');
    spotlightUI.startCycle();
    
    // Add swipe events for touch screen devices (unless the user is viewing the desktop site)
    if (responsiveCookie !== "false" && Modernizr.touch) {
      $("#spotlight").on("swipeleft", ".item.active", function(){
        spotlightUI.changeBackground((spotlightUI.currentIndex + spotlightUI.count - 1) % spotlightUI.count);
      });
      $("#spotlight").on("swiperight", ".item.active", function(){
        spotlightUI.changeBackground((spotlightUI.currentIndex + spotlightUI.count + 1) % spotlightUI.count);
      });
    }
  } else if (spotlightUI.count === 1) { // Hide the spotlight selectors if only a single spotlight is used.
    $("#spotlight ol").hide(spotlightUI.changeRate);
  }
  
  if (spotlightUI.count > 0) {
    // Add Google Analytics events
    $('#spotlight').on('click', '.item a', function() {
      var linkHREF = $(this).attr('href');
      var linkTarget = $(this).attr('target');
      var linkText = $(this).html();
      _gaq.push(['_trackEvent', 'Spotlight', 'Click', linkText+' - '+linkHREF]);
      if (linkTarget != undefined && linkTarget.toLowerCase() != '_blank') {
        setTimeout(function() { location.href = linkHREF; }, 250);
        return false;
      }
    });
  }
}

// Initialise the spotlights
spotlightUI.initBackground();