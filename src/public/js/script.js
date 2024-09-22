jQuery(document).ready(function () {
  "use strict";

  // responsive menu

  $("body").on("click", ".navbar-toggler", function () {
    $(".nav-menu").css({ width: "300px" });
  });
  $("body").on("click", ".cross-wrap", function () {
    $(".nav-menu").css({ width: "0px" });
  });

  //for menu
  $("body").on("click", ".nav-menu li", function () {
    if ($(this).hasClass("active")) {
      $(this).removeClass("active");
    } else {
      $(".nav-menu li").removeClass("active");
      $(this).addClass("active");
    }
  });
});
  /*****************************
		Button Hover
	*****************************/
  $(".theme-btn, .theme-btn-secondary")
    .on("mouseenter", function (e) {
      var parentOffset = $(this).offset(),
        relX = e.pageX - parentOffset.left,
        relY = e.pageY - parentOffset.top;
      $(this).find("span").css({ top: relY, left: relX });
    })
    .on("mouseout", function (e) {
      var parentOffset = $(this).offset(),
        relX = e.pageX - parentOffset.left,
        relY = e.pageY - parentOffset.top;
      $(this).find("span").css({ top: relY, left: relX });
    });

/*=====================
sub manu
 ==========================*/
function submenu(val) {
  var len = $(".home-click").length;

  for (var i = 0; i <= len; i++) {
    if (i == val) {
      console.log(val);
      $(".home-page-2").eq(i).toggleClass("togglesubmenu");
    }
  }
}
