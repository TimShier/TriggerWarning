$(document).ready(function() {
  // update title to let us know we're covered.
  document.title = 'TW - we got ya!';

  //to manage the config, we need to load triggerCategories from chrome ext storage.
  // then using this, we need to look through the folders and pull out the badWords
  // from each we update our badWords array.
  // run the background.js task that handles this.
  chrome.runtime.sendMessage({functionName: "getBadWords"}, function(response) {
    console.log(response);
  });
});

var triggersRemoved = 0;

$(".Grid-cell").hide();

var isFirstIteration = true;

var tid = setInterval(makePageSafe, 500);

var badWords = ["Chicken", "cow"];

function testStringAgainstWords(string, words){
  var hasBadWords = false;
  for (var i = 0; i < words.length; i++) {

    // ignore case...
    if(string.toLowerCase().indexOf(words[i].toLowerCase())!==-1){
      hasBadWords = true;
    }


  }
  return hasBadWords;
}

function makePageSafe() {
  $(".tweet").each(function() {
    var tweetId = $(this).attr("data-tweet-id");
    if(testStringAgainstWords($(this).text(), badWords) && $("#consent_"+tweetId).length == false && $(this).hasClass("triggerWarning") == false){
      console.log("Hiding for " + tweetId);
      // so, it contains the bad word. Append a fake to the list then hide
      // this one. Remember to add an event listener so, when the fake is clicked
      // and the user gives consent, then the original is made visible again.

      var insertDiv = '<div id="consent_'+tweetId+'" class="tweet dismissible-content original-tweet js-original-tweet has-cards cards-forward" data-card2-type="summary_large_image" data-has-cards="true" data-component-context="tweet"><div class="context"></div><div class="content"><div class="stream-item-header"><a class="account-group js-account-group js-action-profile js-user-profile-link js-nav" href="#" data-user-id="#"><img class="avatar js-action-profile-avatar" src="https://pbs.twimg.com/profile_images/763340905587830784/J-Fivk_6_bigger.jpg" alt="">    <span class="FullNameGroup">      <strong class="fullname show-popup-with-id u-textTruncate " data-aria-label-part="">TriggerWarning</strong><span>‏</span><span class="UserBadges"><span class="Icon Icon--verified"><span class="u-hiddenVisually">Verified account</span></span></span><span class="UserNameBreak">&nbsp;</span></span><span class="username u-dir u-textTruncate" dir="ltr" data-aria-label-part="">@<b>TriggerWarning</b></span></a>        <small class="time">  <a href="#" class="tweet-timestamp js-permalink js-nav js-tooltip" title="Just in time" ><span class="_timestamp js-short-timestamp js-relative-timestamp" aria-hidden="true">0.5s</span><span class="u-hiddenVisually" data-aria-label-part="last">0.5s ago</span></a></small>          <div class="ProfileTweet-action ProfileTweet-action--more js-more-ProfileTweet-actions">    <div class="dropdown">  <button class="ProfileTweet-actionButton u-textUserColorHover dropdown-toggle js-dropdown-toggle" type="button" aria-haspopup="true">      <div class="IconContainer js-tooltip" title="More">        <span class="Icon Icon--caretDownLight Icon--small"></span>        <span class="u-hiddenVisually">More</span>      </div>  </button>  <div class="dropdown-menu is-autoCentered">  <div class="dropdown-caret">    <div class="caret-outer"></div>    <div class="caret-inner"></div>  </div>  <ul>      <li class="copy-link-to-tweet js-actionCopyLinkToTweet">        <button type="button" class="dropdown-link">Copy link to Tweet</button>      </li>      <li class="embed-link js-actionEmbedTweet" data-nav="embed_tweet">        <button type="button" class="dropdown-link">Embed Tweet</button>      </li>          <li class="mute-user-item"><button type="button" class="dropdown-link">Mute <span class="username u-dir u-textTruncate" dir="ltr">@<b>TriggerWarning</b></span></button></li>    <li class="unmute-user-item"><button type="button" class="dropdown-link">Unmute <span class="username u-dir u-textTruncate" dir="ltr">@<b>TriggerWarning</b></span></button></li>        <li class="block-link js-actionBlock" data-nav="block">          <button type="button" class="dropdown-link">Block <span class="username u-dir u-textTruncate" dir="ltr">@<b>TriggerWarning</b></span></button>        </li>        <li class="unblock-link js-actionUnblock" data-nav="unblock">          <button type="button" class="dropdown-link">Unblock <span class="username u-dir u-textTruncate" dir="ltr">@<b>TriggerWarning</b></span></button>        </li>      <li class="report-link js-actionReport" data-nav="report">        <button type="button" class="dropdown-link">            Report Tweet        </button>      </li>      <li class="dropdown-divider"></li>      <li class="js-actionMomentMakerAddTweetToOtherMoment MomentMakerAddTweetToOtherMoment">        <button type="button" class="dropdown-link">Add to other Moment</button>      </li>      <li class="js-actionMomentMakerCreateMoment">        <button type="button" class="dropdown-link">Add to new Moment</button>      </li>  </ul></div></div>  </div>      </div>        <div class="js-tweet-text-container">  <p class="TweetTextSize  js-tweet-text tweet-text" lang="en" data-aria-label-part="0"><strong>TriggerWarning</strong> this content triggered one of your alerts. If you want to see it, consent by clicking the link.</p></div>      <div class="stream-item-footer">      <div class="ProfileTweet-actionCountList u-hiddenVisually">  </div></div>  </div></div>';

      $(this).after(insertDiv);  //.after("<div id='consent_"+tweetId+"' class='tweet' style='min-height:150px; background:red;'>Click to show content</div>");
      $(this).addClass("triggerWarning");

      // now that we have a brand spanking new DIV (consent_"+tweetId),
      // let's add an event, so the user can click it and consents then
      // we can show them the tweet.
      $("#consent_"+tweetId).on("click", function(){
          $("#consent_"+tweetId).hide();
          $(".tweet[data-tweet-id='" + tweetId +"']").show();
      });



      $( this ).hide();
      triggersRemoved++;
      //chrome.browserAction.setBadgeText({text: triggersRemoved}); // We have 10+ unread items.
    }

  });

    if(isFirstIteration){
        $(".Grid-cell").show();
        isFirstIteration = false;
    }

}
