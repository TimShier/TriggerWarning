$(document).ready(function() {
  // update title to let us know we're covered.
  document.title = 'TW - we got ya!';

  //to manage the config, we need to load triggerCategories from chrome ext storage.
  // then using this, we need to ask background to run it for us
  // then pass the result back.

  chrome.runtime.sendMessage({functionName: "getBadWords"}, function(response) {
    console.log(response);
  });
});

// keep count of triggers removed and found. Just so we have a total to
// update the icon down the line.
var triggersRemoved = 0;

// hide the main cells, just so that we don't see our triggering content by accident.
$(".Grid-cell").hide();

// record that this is the first time that it's running
var isFirstIteration = true;

// every 500ms, make the page safe... need to find a better
// way to trigger this but for now it does the job.
var tid = setInterval(makePageSafe, 500);

// DEPRECATED. NOT IN USE.
var badWords = [];

// JSON object containing the entire data object.
var data = {}; // json.

// keeps track of whether data has been loaded by the AJAX background task.
var canStart = false;

// *************************** FUNCTIONS ******************************

function testStringAgainstWords(string, words){
    // takes a string and an array and checks if any of the words
    // appear in the string.
    // if they do, then those words are returned as naughty words.

    // does it have any bad word so far?
    var hasBadWords = false;
    // which words have been found?
    var badWordsFound = [];

    for (var i = 0; i < words.length; i++) {
        // check if the word is found in the string. IGNORE CASE.
        if(string.toLowerCase().indexOf(words[i].toLowerCase())!==-1){
            // if the word exists then record that there are bad words and
            // push that word onto the list of bad words found.
            hasBadWords = true;
            badWordsFound.push(words[i]);
        }
    }
    // return the list of bad words.
    return badWordsFound;
}


function getCategorySafeWord(categoryNameArray){
    // given a category. Do a basic look up
    // and find the safeWord for a specific categoryArray.
    // this is returned as a string which concats all safeWords

    // the string we'll be returning.
    var returnString = ""
    // is this the first time it's running?
    var isFirst = true;
    for(var cArr = 0 ; cArr < categoryNameArray.length; cArr++){
        // for each categoryName in the array...

        if(isFirst){
            // it's the first, no need for a leading comma.
            returnString = returnString + data.badCategories[categoryNameArray[cArr]].safeWord;
            isFirst = false;
        }
        else
        {
            // it's not the first, add a comma...
            returnString = returnString + ", " + data.badCategories[categoryName].safeWord;
        }
    }

    // return the returnString for insertion.
    return returnString;

}
function buildWordsList(){
    // use data to build a words list
    // return this word list
    var words = [];
    console.log("Bad Cats length: " + data["badCategories"].length);
    for(var xy in data.badCategories){
        var curData = data.badCategories[xy].badWords;
        console.log("Looking at " + data.badCategories[xy].name+ "Current Data " + curData);
        for(var xxy = 0; xxy < curData.length; xxy++){
            words.push(curData[xxy]);
        }

    }
    // return words (all words).
    return words;
}

function findBadWordCategories(wordArray){
    // after receiving a wordArray. Look through the data object
    // and return the category names for each - again, as an array.
    var categories = [];
    for(var xy in data.badCategories){
        var curData = data.badCategories[xy].badWords;
        for(var xxy = 0; xxy < curData.length; xxy++){
            // now, for each bad word, check it against
            // the list of words and push the category to the list if needed
            for(var wa = 0; wa < wordArray.length;wa++) {
                if (curData[xxy] == wordArray[wa]){
                    categories.push(data.badCategories[xy].name);
                }
            }

        }

    }
    // before we return this... let's make it unique.
    return categories.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
}

function getCategoryStatus(categoryName){
    // get the category status from a name.
    console.log("Category name" + categoryName);
    console.log(data.badCategories);
    return data.badCategories[categoryName].status;
}

chrome.runtime.onMessage.addListener(
      // set up a listener for any responses from background...
      function(request, sender, sendResponse) {
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");

        console.log(request.badWords);
        var responseHolder = "Success?";
        if (request.functionName == "badWords"){
            // save the data to the global var if it's for badWords.
          console.log("Badwords inbound" +request.data);
            data =request.data;
            // notify makePageSafe that it can start
            // all the data has been loaded as hoped.
            canStart = true;


          console.log(data);
        }
        sendResponse({status: "GotEm" + responseHolder});
  });


function makePageSafe() {
    // look at the page and update it in such a way that badWords are hidden from the user.

    if(canStart){
        // canStart is set when data is loaded. It must be true to denote that data has been loaded ASYNC.

        // build a list of words... inefficient but for not it'll do.
        badWords = buildWordsList();
        console.log("Making Safe");
        console.log(data);
        console.log(badWords);
        console.log("Done with data");

        // using Jquery, for each tweet do the following:
        $(".tweet").each(function() {

            // record the tweet ID for re-use.
            var tweetId = $(this).attr("data-tweet-id");

            // record which offending words were found in this tweet.
            var wordsFound = testStringAgainstWords($(this).text(), badWords);

            if(wordsFound.length>0 && $("#consent_"+tweetId).length == false && $(this).hasClass("triggerWarning") == false) {
                // check if there are words that conflict and that it doesn't already have a triggerWarning class applied.


                // get an array of categories for which this word applies.
                var tmpCat = findBadWordCategories(wordsFound);

                // determine what to do. 0 = do nothing. S = soft block and H = hard block.

                var overallStatus = "0";// do nothing.
                for (var w = 0; w < tmpCat.length; w++) {
                    var tmpStatus = getCategoryStatus(tmpCat[w]);
                    if (tmpStatus == "S" && overallStatus == "0")
                        overallStatus = tmpStatus;
                    if (tmpStatus == "H" && (overallStatus == "0" || overallStatus == "S" ))
                        overallStatus = tmpStatus;
                }


                if (overallStatus == "S") {
                    // do a soft block... change background to redish.
                    console.log("Soft Hiding");
                    $(this).css("background","#550000");
                    triggersRemoved++;
                }
                else if (overallStatus == "H") {
                    // do a hardblock. Remove tweet and replace with warning.
                    console.log("Hard Hiding");
                    console.log("Hiding for " + tweetId);
                    console.log("Because of:");
                    console.log(findBadWordCategories(wordsFound));
                    console.log("End.")
                    // so, it contains the bad word. Append a fake to the list then hide
                    // this one. Remember to add an event listener so, when the fake is clicked
                    // and the user gives consent, then the original is made visible again.

                    // NB: insertDiv does a lookup to get the safeWords for all categories...
                    var insertDiv = '<div id="consent_'+tweetId+'" class="tweet dismissible-content original-tweet js-original-tweet has-cards cards-forward" data-card2-type="summary_large_image" data-has-cards="true" data-component-context="tweet"><div class="context"></div><div class="content"><div class="stream-item-header"><a class="account-group js-account-group js-action-profile js-user-profile-link js-nav" href="#" data-user-id="#"><img class="avatar js-action-profile-avatar" src="https://pbs.twimg.com/profile_images/763340905587830784/J-Fivk_6_bigger.jpg" alt="">    <span class="FullNameGroup">      <strong class="fullname show-popup-with-id u-textTruncate " data-aria-label-part="">TriggerWarning</strong><span>‏</span><span class="UserBadges"><span class="Icon Icon--verified"><span class="u-hiddenVisually">Verified account</span></span></span><span class="UserNameBreak">&nbsp;</span></span><span class="username u-dir u-textTruncate" dir="ltr" data-aria-label-part="">@<b>TriggerWarning</b></span></a>        <small class="time">  <a href="#" class="tweet-timestamp js-permalink js-nav js-tooltip" title="Just in time" ><span class="_timestamp js-short-timestamp js-relative-timestamp" aria-hidden="true">0.5s</span><span class="u-hiddenVisually" data-aria-label-part="last">0.5s ago</span></a></small>          <div class="ProfileTweet-action ProfileTweet-action--more js-more-ProfileTweet-actions">    <div class="dropdown">  <button class="ProfileTweet-actionButton u-textUserColorHover dropdown-toggle js-dropdown-toggle" type="button" aria-haspopup="true">      <div class="IconContainer js-tooltip" title="More">        <span class="Icon Icon--caretDownLight Icon--small"></span>        <span class="u-hiddenVisually">More</span>      </div>  </button>  <div class="dropdown-menu is-autoCentered">  <div class="dropdown-caret">    <div class="caret-outer"></div>    <div class="caret-inner"></div>  </div>  <ul>      <li class="copy-link-to-tweet js-actionCopyLinkToTweet">        <button type="button" class="dropdown-link">Copy link to Tweet</button>      </li>      <li class="embed-link js-actionEmbedTweet" data-nav="embed_tweet">        <button type="button" class="dropdown-link">Embed Tweet</button>      </li>          <li class="mute-user-item"><button type="button" class="dropdown-link">Mute <span class="username u-dir u-textTruncate" dir="ltr">@<b>TriggerWarning</b></span></button></li>    <li class="unmute-user-item"><button type="button" class="dropdown-link">Unmute <span class="username u-dir u-textTruncate" dir="ltr">@<b>TriggerWarning</b></span></button></li>        <li class="block-link js-actionBlock" data-nav="block">          <button type="button" class="dropdown-link">Block <span class="username u-dir u-textTruncate" dir="ltr">@<b>TriggerWarning</b></span></button>        </li>        <li class="unblock-link js-actionUnblock" data-nav="unblock">          <button type="button" class="dropdown-link">Unblock <span class="username u-dir u-textTruncate" dir="ltr">@<b>TriggerWarning</b></span></button>        </li>      <li class="report-link js-actionReport" data-nav="report">        <button type="button" class="dropdown-link">            Report Tweet        </button>      </li>      <li class="dropdown-divider"></li>      <li class="js-actionMomentMakerAddTweetToOtherMoment MomentMakerAddTweetToOtherMoment">        <button type="button" class="dropdown-link">Add to other Moment</button>      </li>      <li class="js-actionMomentMakerCreateMoment">        <button type="button" class="dropdown-link">Add to new Moment</button>      </li>  </ul></div></div>  </div>      </div>        <div class="js-tweet-text-container">  <p class="TweetTextSize  js-tweet-text tweet-text" lang="en" data-aria-label-part="0"><strong>TriggerWarning</strong> this content triggered one of your alerts. The safe words are: ' + getCategorySafeWord(tmpCat) + '. If you want to see it, consent by clicking the link.</p></div>      <div class="stream-item-footer">      <div class="ProfileTweet-actionCountList u-hiddenVisually">  </div></div>  </div></div>';

                    // insert insertDiv in place
                    $(this).after(insertDiv);  //.after("<div id='consent_"+tweetId+"' class='tweet' style='min-height:150px; background:red;'>Click to show content</div>");
                    // add the class so we don't try to do this one again...
                    $(this).addClass("triggerWarning");

                    // now that we have a brand spanking new DIV (consent_"+tweetId),
                    // let's add an event, so the user can click it and consents then
                    // we can show them the tweet.
                    $("#consent_"+tweetId).on("click", function(){
                        $("#consent_"+tweetId).hide();
                        $(".tweet[data-tweet-id='" + tweetId +"']").show();
                    });

                    // hide the original tweet.
                    $( this ).hide();
                    triggersRemoved++;
                }
                else
                {
                    console.log("Doing nothing...");
                }



            }

        });

        // after the first round... show the page content.
        if(isFirstIteration){
            $(".Grid-cell").show();
            isFirstIteration = false;
        }
    }
    else
    {
        console.log("Can't start yet");
    }

}
