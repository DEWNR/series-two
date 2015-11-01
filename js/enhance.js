// Apply progressive enhancements as applicable.
// Requires jQuery and prepare.js. Must be concatenated and minified before use in a production environment.
// @codekit-prepend ../includes/jquery.mobile.custom.1409290931.js
// @codekit-prepend ../includes/jquery.fancybox.js
// @codekit-prepend ../includes/jquery.fancybox-thumbs.js

// Make sure global variables set outside the script are accessible
var regionName, brandColour, pathToFiles, screenSizes, screenSize, isResponsive;

// Display a warning if the user's browser lacks desired features
if (!Modernizr.rgba || !Modernizr.multiplebgs || !Modernizr.backgroundsize || !Modernizr.boxshadow || !Modernizr.opacity || !Modernizr.generatedcontent || !Modernizr.inlinesvg || !Modernizr.boxsizing) {
  $(".banner-container.layout-helper").after('<div class="banner-container warning"><div class="banner"><strong>Warning!</strong> The browser you&rsquo;re using does not support all the features of this site. <a href="http://whatbrowser.org/">Upgrade your browser</a> for a better experience.</div></div>');
}

// Add the appropriate mobile/desktop toggle
if (screenSize == 'small' || screenSize == 'medium') {
  var text;
  if (readCookie("responsive") != "false") {
    text = '<p class="switch"><strong>Mobile</strong> | <a href="'+responsiveSwitchURL(false)+'">Desktop</a></p>';
  } else {
    text = '<p class="switch"><a href="'+responsiveSwitchURL(true)+'">Mobile</a> | <strong>Desktop</strong></p>';
  }
  $('#footer').append(text);
}

// Check that the navigation menus don't extend past the viewport
$(".menu-bar>li:not(.last)").each(function() {
  var menuWidth = $(this).children(".dropdown-container").outerWidth();
  var menuOffset = $(this).offset().left;
  
  if (menuWidth + menuOffset > $("#container").outerWidth()) {
    $(this).children(".dropdown-container").css("left", "auto").css("right", "-1px");
  }
});

// Add the navigation buttons, if required
if (responsiveCookie != "false" && jQuery.inArray(screenSize, screenSizes) <= jQuery.inArray("medium", screenSizes) && $("#navigation li").length) {
  $("#breadcrumbs a.breadCrumb").each(function() {
    $(this).replaceWith("<span>" + $(this).html() + "</span>");
  });
  $("#breadcrumbs p.breadCrumb").wrapInner('<a id="navigation-toggle" href="/"></a>');
}
setMenuToggle("#navigation", "#navigation-toggle");
setMenuToggle("#menu ul.menu-bar", "#menu-toggle");

// Load any image galleries
if (screenSize !== 'small' && typeof imageGallery === "object" && typeof imageGallery.items === "object" && imageGallery.items.length) {
  $("#image-gallery a").on('click', function() {
    $.fancybox(imageGallery.items,{ prevEffect: 'none', nextEffect: 'none', padding: 11, margin: [18,18,24,18], minWidth: 300, helpers: {title: {type: 'inside'}, overlay: {css : {'border-radius': 0, 'webkit-border-radius': 0, 'background-color' : 'rgba(0,0,0,0.5)'}}, thumbs: {width: 100, height: 100}}});
    return false;
  });
}

// Show only the first five items in module lists  
$(".content>.module>ul").each(function() {
  targetItems = $(this).children(":gt(4)");
  if (targetItems.length > 0) {
    targetItems.hide();
    $(this).append('<a class="toggle" href="#"></a>');
    currentID = "#"+$(this).parent().attr('id');
    setMenuToggle(currentID+">ul>li:gt(4)", currentID+" a.toggle");
  }
});

// Display links to embedded YouTube videos in lightbox (if tablet or desktop), or link to normal YouTube site (if mobile - regardless of whether the site is being displayed responsively or not)
var youTubeEmbedPrefix = 'http://www.youtube.com/embed/';
var teacherTubeEmbedPrefix = 'http://www.teachertube.com/embed.php';

if (screenSize == 'small') {
  var youTubeVideoPrefix = 'http://www.youtube.com/watch?v=';
  var youTubePlaylistPrefix = 'http://www.youtube.com/playlist?list='; 
  var teacherTubeVideoPrefix = 'http://www.teachertube.com/mobile/video/';
  
  $("a[href^='"+youTubeEmbedPrefix+"']").each(function() { // Check all the YouTube links
    var videoHREF, videoID, playlistID;
    var searchString = $(this).attr('href').replace(youTubeEmbedPrefix, "");  // Remove the prefix from the search string to match things easier
    
    var videoRegExp = /^([^"&?\/ ]+)/  // Search the start of the string for anything but these characters
    var playlistRegExp = /(?:\?|\&)*list=([^"&?\/ ]+)/  // Search for the list value in the query string
    
    videoID = videoRegExp.exec(searchString);
    playlistID = playlistRegExp.exec(searchString);
    
    // Get the first match for each ID
    if (videoID !== null && videoID.length > 1) {
      videoID = videoID[1];
    }
    
    if (playlistID !== null && playlistID.length > 1) {
      playlistID = playlistID[1];
    }
    
    if (videoID) {  // Check that a video ID has been found
      if (videoID === 'videoseries') {  // Check to see if the link is to a playlist
        if (playlistID) {
          videoHREF = youTubePlaylistPrefix+playlistID;
        }
      } else {
        videoHREF = youTubeVideoPrefix+videoID;
        if (playlistID) {  // Check to see if the link is to a video in a playlist
          videoHREF += "&list="+playlistID;
        }
      }
      if (videoHREF) {  // Make sure the video HREF has been set
        $(this).attr('href', videoHREF);
      }
    }
  });
  $("a[href^='"+teacherTubeEmbedPrefix+"']").each(function() { // Check all the TeacherTube links
    var videoHREF, videoID;
    var searchString = $(this).attr('href').replace(teacherTubeEmbedPrefix, "");
    
    var videoRegExp = /=video_([^"&?\/ ]+)/  // Search for a video ID value
    
    videoID = videoRegExp.exec(searchString);
    
    // Get the first match for the ID
    if (videoID !== null && videoID.length > 1) {
      videoID = videoID[1];
    }
    
    if (videoID) {  // Check that a video ID has been found
      $(this).attr('href', teacherTubeVideoPrefix+videoID);
    }
  });
} else {
  $("a[href^='"+youTubeEmbedPrefix+"']").add("a[href^='"+teacherTubeEmbedPrefix+"']").fancybox({
    type: 'iframe',
    padding : 11,
    width : 178,
    height : 100,
    fitToView : false,
    autoCenter : true,
    iframe : {
      scrolling : 'no'
    },
    onUpdate : function() {
      var viewPortWidth = $(window).width();
      var viewPortHeight = $(window).height();
      var videoWidth;
      var videoHeight;
      
      if (viewPortHeight > viewPortWidth*9/16) {
        videoWidth = viewPortWidth*0.8;
        videoHeight = videoWidth*9/16;
      } else {
        videoHeight = viewPortHeight*0.8;
        videoWidth = videoHeight*16/9;
      }
      
      if (videoWidth > 853) {
        videoWidth = 853;
        videoHeight = 480;
      }
      
      $(".fancybox-wrap.fancybox-type-iframe").width(videoWidth + 22).height(videoHeight + 22);
      $(".fancybox-inner").width(videoWidth).height(videoHeight);
      $.fancybox.reposition();
    }
  });
}

// Display Wufoo forms in lightbox (if tablet or desktop)
if (screenSize != 'small') {
  $("a[href*='.wufoo.com/forms/']").each(function(i) {
    var formHREF = $(this).attr('href');
    
    // Check for a form hash and username (and store them)
    var formDetailsRegExp = new RegExp(/^https\:\/\/(\w+)\.wufoo.com\/forms\/(\w+)\/?$/gi);
    
    var formDetails = formDetailsRegExp.exec(formHREF);
    
    if (!formDetails) {
      return;
    }
    
    var formUsername = formDetails[1];
    var formHash = formDetails[2];

    // Check to see if the form has already been created by another link; if not, load it
    if (!$("#wufoo-"+formHash).length) {
      $("body").append('<div id="wufoo-'+formHash+'" class="wufoo-form"></div>');
      var formLoader, s = document.createElement('script'), options = {
        'userName':formUsername,
        'formHash':formHash,
        'autoResize':true,
        'resizeDone': setFormHeight,
        'async':true,
        'host':'wufoo.com',
        'header':'show',
        'ssl':true
      };
      s.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'wufoo.com/scripts/embed/form.js';
      s.onload = s.onreadystatechange = function() {
        var rs = this.readyState;
        if (rs) if (rs != 'complete') if (rs != 'loaded') return;
        try { formLoader = new WufooForm(); formLoader.initialize(options); formLoader.display(); } catch (e) {}
      };
      var scr = document.getElementsByTagName('script')[0], formTarget = document.getElementById("wufoo-"+formHash); formTarget.insertBefore(s);
    }
    
    $(this).click(function() {
      setFormWidth(".wufoo-form");
      $.fancybox.open([{
        href : '#wufoo-'+formHash
      }], {
        padding : 11,
        margin : 11,
        fitToView : false,
        fixed : false,
        onUpdate : function() {
          setFormWidth(".wufoo-form");
        }
      });
      return false;
    });
  });
}

// Preload any images that can be dynamically loaded;
preloadImages(regionName+'-expand');
preloadImages(regionName+'-contract');
if (screenSize == 'small' && isResponsive) {
  preloadImages(regionName+'-menu-button-active'); // The inactive button is enabled by default on pageload
}

// Add general event listeners

// Check for onpageshow in case of back/forward caching
if (isResponsive) {
  window.onpageshow = function(event) {
    if (event.persisted) {
      setTimeout(function(){setFontSize();}, 100);
    }
  };

  // Scale the fonts
  $(window).resize(function() {
    setFontSize();
  });
}


// Functions

// Add the appropriate query string to the current URL to set/remove the "responsive" cookie
function responsiveSwitchURL(enabled) {
  var urlPath = location.pathname;
  var urlQueryString = location.search;
  var urlHash = location.hash;
  
  // Check for the presence of a query string
  if (urlQueryString.indexOf("?") >= 0 ) {
    // Check to see if the existing query string contains values for "responsive", and replace them accordingly
    if (urlQueryString.indexOf("?responsive="+!enabled) == 0) {
      urlQueryString = urlQueryString.replace("?responsive="+!enabled, "?responsive="+enabled);
    } else if (urlQueryString.indexOf("&responsive="+!enabled) > 0) {
      urlQueryString = urlQueryString.replace("&responsive="+!enabled, "&responsive="+enabled);
    } else {
      // If not, append the values for "responsive"
      urlQueryString += "&responsive="+enabled;
    }
  } else {
    // If no query string is set, append one
    urlQueryString = "?responsive="+enabled;
  }
  return urlPath+urlQueryString+urlHash;
}

// Set event listeners to toggle menus on click
function setMenuToggle(target, trigger, dropdown, transitionRate) {
  if (dropdown) {
    $(target).addClass("inactive")
  } else {
    $(trigger).addClass("inactive")
  }
  $(trigger).click(function() { menuToggle(target, trigger, dropdown, transitionRate); return false; });
}

// Toggle menus
// target (selector) = the element to be hidden or shown
// trigger (selector) = the element that will trigger the event
// dropdown (boolean) = controls whether other menus (with class "dropdown") should be hidden before opening the current menu, and if the trigger or target should be assigned the "active"/"inactive" class
// transitionRate (int) = the time, in milliseconds, for the animation
function menuToggle(target, trigger, dropdown, transitionRate) {
  if (!transitionRate) {
    transitionRate = 150;
  }
  
  if (!dropdown) {
    dropdown = false;
  }
  
  // Check that the target is not currently animated
  target = $(target).filter(":not(:animated)");
  
  if (target.length) {
    if (dropdown) {
      //Check to see if other menus are animated: if they are, exit the function
      if ($(".dropdown").filter(":animated").length > 0) {
        return false;
      } else {
        activeMenus = $(".dropdown.active").not(target);
        activeMenus.toggleClass("active inactive");
        activeMenus.slideToggle({duration: transitionRate, queue: false}).fadeToggle({duration: 0, queue: false}).fadeToggle(transitionRate, function() { document.activeElement.focus(); }); // Setting the focus on the currently focussed element fixes a margin rendering bug in IE8
      }
      $(target).toggleClass("active inactive");
    } else {
      $(trigger).toggleClass("active inactive");
    }
    target.slideToggle({duration: transitionRate, queue: false}).fadeToggle({duration: 0, queue: false}).fadeToggle(transitionRate, function() { document.activeElement.focus(); }); // Setting the focus on the currently focussed element fixes a margin rendering bug in IE8
  } else {
    return false;
  }
}

// Preload images that may be assigned dynamically such as menu buttons. (Sprites are problematic when used for responsive sites.)
function preloadImages(imageName) {
  // Use SVGs only when the browser supports it and the output is scaled.
  var imageFormat = $("html").hasClass("inlinesvg", "scaled") ? "svg" : "png";
  var imagePath = imageFormat === "svg" ? "/assets/images/svg/" : pathToFiles;
  var innerHTML = '<img class="preload" style="display: none" src="'+imagePath+imageName+'.'+imageFormat+'" />';
  
  $("body").append(innerHTML);
  $(".preload").remove();  
}

// Set the width of the Wufoo forms - for use with Fancybox and Wufoo's resizeDone callback.
var currentFormHeight, currentFormWidth;  // Set global variables for comparison

function setFormHeight(height, target) {
  if (currentFormHeight != height) {
    currentFormHeight = height;
    $(".wufoo-form:visible").height(height);
    $.fancybox.update();
  }
}

function setFormWidth(target) {
  var viewPortWidth = $(window).width();
  var calculatedFormWidth = viewPortWidth*0.8;
  var maxFormWidth = 800;
        
  if (calculatedFormWidth > maxFormWidth) {
    calculatedFormWidth = maxFormWidth;
  }

  if (currentFormWidth != calculatedFormWidth) {
    currentFormWidth = calculatedFormWidth;
    $(target).width(calculatedFormWidth);
    $.fancybox.update();
  }
}