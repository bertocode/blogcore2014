
var confirmarSubmit = function(msg,formname) {

   if (confirm(msg)) {
      document.getElementById(formname).submit();
   }
}
