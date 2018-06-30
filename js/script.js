$(document).ready(function() {
    //feed to parse
    var feed = "https://www.wsws.org/en/rss.xml";
    // re-enable once/if rssunify comes back
    //var feed = "https://feed.rssunify.com/5b2b311136f50/rss.xml";
    $.ajax(feed, {
        accepts: {
            xml: "application/rss+xml"
        },
        dataType: "xml",
        success: function(data) {
            //Credit: http://stackoverflow.com/questions/10943544/how-to-parse-an-rss-feed-using-javascript
            
            var tn = 0;
            
            $(data).find("item").each(function() { // or "item" or whatever suits your feed
                var el = $(this);
                var $item = $("<li/>", {
                    class: "item"
                });
                var iLink = el.find("link").text();
                if (iLink.includes("espn.com")){
                    $item.attr("type","Sports");
                }
                else {
                    $item.attr("type","News");
                }
                var $title = $("<div class='title'>" + el.find("title").text() + "</div>");
                var $description = $("<div class='description'>" + el.find("description").text() + "</div>");

                $description = $(".feedflare, img, p:gt(0)", $description).remove().end();
                $item.append($title);
                $item.append($description);

                if ($title.text().length > 0 && $description.text().length > 0) {
                    $item.appendTo($("#items"));
                    tn++;
                }
            });
            $('#newsfeed').breakingNews({
                effect: 'slide-up'
            });
        }
    });
});
