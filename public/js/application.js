//= require jquery.min
//= require jquery.timeago
//= require bootstrap.min
//= require bootstrap.tags
//= require form-validator

$(function() { 
  // Shim to make any element with a valid "href" value clickable
  // (This exists under standards like XHTML 2.0 but not natively in browsers.)
  $("*[href]").bind('touch click', function() {
    if ($(this).attr('href') != "" && !$(this).attr('href').match(/^#/))
      window.location = $(this).attr('href');
  });
  
  $("time.timeago").timeago();
  $("time.timeago").css({ visibility: 'visible' });
});