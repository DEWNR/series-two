// Applies and removes classes based on device capabilities. Should be placed in the document head to prevent a flash of unstyled content.
// Must be concatenated and minified before use in a production environment.
// @codekit-prepend ../includes/modernizr.custom.72305.js


// Remove the no-js class
document.documentElement.className.replace(/\bno-js\b/,'');

// Check the user agent and set the device independent pixel width and height of the device.
if (navigator.userAgent.match(/(Android)|(Windows Phone)/i) && typeof window.devicePixelRatio != "undefined") {
  var dpScreenWidth = screen.width/window.devicePixelRatio;
  var dpScreenHeight = screen.height/window.devicePixelRatio;
} else {
  var dpScreenWidth = screen.width;
  var dpScreenHeight = screen.height;
}

//Check the screen size, and assign it a value to determine site behaviour
var screenSizes = ['small', 'medium', 'large', 'maximum']; // Use an array and indices to set the values, so the value can be stored as a human-readable string but can still be used for comparison
var screenSize;

if (dpScreenWidth <= 740 && dpScreenHeight <= 740) {
  screenSizeIndex = 0;
} else if (dpScreenWidth <= 1024 && dpScreenHeight <= 1024) {
  screenSizeIndex = 1;
} else if (dpScreenWidth <= 1279 && dpScreenHeight <= 1279) {
  screenSizeIndex = 2;
} else {
  screenSizeIndex = 3;
}
screenSize = screenSizes[screenSizeIndex];

// Check the query string and set or remove the "responsive" cookie
if (location.search.indexOf("?responsive=false") === 0 || location.search.indexOf("&responsive=false") != -1) {
  createCookie("responsive", "false");
} else if (location.search.indexOf("?responsive=true") === 0 || location.search.indexOf("&responsive=true") != -1) {
  createCookie("responsive", "", -1);
}

// Read the responsive cookie (if set) to determine whether to make the site responsive or not
var responsiveCookie = readCookie("responsive");

// Ensure the responsiveOverride variable is accessible
var responsiveOverride;

// Check that the necessary criteria are met
var isResponsive = (function () {
  return (screenSize != "maximum" && Modernizr.backgroundsize && Modernizr.boxsizing && responsiveCookie != "false" && !responsiveOverride);
})();

// Load the responsive scripts and content
(function () {
  var root = document.documentElement;

  if (isResponsive) { // Only make the site responsive if the necessary criteria are met
    // Add the classes to trigger the responsive styling
    var screenSizeCount = screenSizes.length;
    var breakpointCount = screenSizeCount - screenSizeIndex; // Calculate the number of breakpoints
    for (var i = 1; i <= breakpointCount; i++) {
      root.className += ' breakpoint-'+screenSizes[screenSizeCount - i];
    }

    // Add the class to display hi-res or SVG images (as there's no longer a 1:1 pixel mapping)
    root.className += ' scaled';

    // Add the viewport meta tag
    var viewport = document.getElementById("viewport");
    viewport.setAttribute("content", "width=device-width, initial-scale=1.0");
  } else if (window.devicePixelRatio > 1) {
    // Add the class to display hi-res or SVG images (as there's no longer a 1:1 pixel mapping)
    root.className += ' scaled';
  }
}());


// Functions
// Scale the font size with the viewport
function setFontSize() {
  var containerWidth = document.getElementById("layout-helper").offsetWidth;
  var fontSize = (containerWidth/120) + 2;
  document.getElementsByTagName("body")[0].style.fontSize = fontSize+"px";
  //$("body").css("font-size", fontSize+"px"); JQuery version
}

function loadDeferred() {    // Load deferred scripts. Requires JQuery.
  var scriptLength = deferredScripts.length,
    src,
    async,
    cache,
    loadedScripts = [];

  for (i = 0; i < scriptLength; i++) {
    // Check that the script has an href value
    if (typeof deferredScripts[i].href === "string") {
      src = deferredScripts[i].href;
    } else {
      continue;
    }
    // Check that the script has an href value set, and is not already loaded
    if (!$("script[src='"+src+"']").length && $.inArray(src, loadedScripts) < 0) {
      // Assume scripts are loaded asynchronously unless otherwise specified
      if (typeof deferredScripts[i].async === "boolean") {
        async = deferredScripts[i].async;
      } else {
        async = true;
      }
      // Assume scripts are cached unless otherwise specified
      if (typeof deferredScripts[i].cache === "boolean") {
        cache = deferredScripts[i].cache;
      } else {
        cache = true;
      }
      $.ajax({
        cache: cache,
        async: async,
        url: deferredScripts[i].href,
        dataType: "script"
      });
      // Add the script to the list of scripts to ignore
      loadedScripts.push(deferredScripts[i].href);
    }
  }
  loadedScripts = null;
  deferredScripts = null;
}

// Cookie functions - taken from http://www.quirksmode.org/js/cookies.html

// Create a cookie
function createCookie(name,value,days) {
  var date;
  var expires;

  if (days) {
    date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    expires = "; expires="+date.toGMTString();
  }
  else expires = "";
  document.cookie = name+"="+value+expires+"; path=/";
}

// Read a cookie
function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

// Clear a cookie
function eraseCookie(name) {
  createCookie(name,"",-1);
}
