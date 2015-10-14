format_date = function(date) {
var month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	if(date == ""){
		return "Ongoing";
	}    
	var parts = date.split('-');
	
    if (parseInt(parts[1]) == 0) {
        var month = "";
    } else {
        var month = month_names[parseInt(parts[1])-1] + " ";
    }
    return month + parts[0];
}

$('.date').each(function(){
    $(this).text(format_date($(this).text()));
});