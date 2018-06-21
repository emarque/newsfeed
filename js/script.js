$(document).ready(function() {
	//feed to parse
	var feed = "https://feed.rssunify.com/5b2b311136f50/rss.xml";
	$.ajax(feed, {
		accepts:{
			xml:"application/rss+xml"
		},
		dataType:"xml",
		success:function(data) {
			//Credit: http://stackoverflow.com/questions/10943544/how-to-parse-an-rss-feed-using-javascript

			$(data).find("item").each(function () { // or "item" or whatever suits your feed
        var el=$(this);
				$("<li/>",{
          class: "item"
        }).append($("<div class='title'>" + el.find("title").text() + "</div>")).append($("<div class='description'>" + el.find("description").text() + "</div>")).appendTo($("#items"));
			}); 
		}
	});
  $('#newsfeed').breakingNews({
		effect: 'slide-up'
	});
});
