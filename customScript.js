// $(document).ready(function() {
//   // update title to let us know we're covered.
//   document.title = 'TW - we got ya!';
//
//   $(".tweet").each(function() {
//     if($(this).text().indexOf("chicken") !== -1){
//       $( this ).css("background","#FF0000");
//     }
//
//   });
// });
//
// $(".tweet").ready(function() {
//   if($(this).text().indexOf("chicken") !== -1){
//     $( this ).css("background","#0000FF");
//   }
// });

var tid = setInterval(mycode, 500);
function mycode() {
  $(".tweet").each(function() {
    if($(this).text().indexOf("chicken") !== -1){
      $( this ).css("background","#FF0000");
    }

  });
}
